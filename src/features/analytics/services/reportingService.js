/**
 * Analytics Reporting Service
 * Handles report generation, export to CSV/PDF, and scheduled reports
 */

const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

class ReportingService {
    constructor(supabase, aggregationService) {
        this.supabase = supabase;
        this.aggregationService = aggregationService;
        this.reportQueue = [];
        this.isProcessing = false;
    }

    /**
     * Generate a comprehensive analytics report
     */
    async generateReport(options = {}) {
        const {
            reportType = 'summary', // 'summary', 'detailed', 'custom'
            timeRange = '7d',
            format = 'json', // 'json', 'csv', 'pdf'
            metrics = ['all'],
            filters = {}
        } = options;

        console.log(`[ReportingService] Generating ${reportType} report in ${format} format...`);

        try {
            // Gather report data based on type
            let reportData;
            switch (reportType) {
                case 'summary':
                    reportData = await this.generateSummaryReport(timeRange);
                    break;
                case 'detailed':
                    reportData = await this.generateDetailedReport(timeRange, metrics);
                    break;
                case 'custom':
                    reportData = await this.generateCustomReport(timeRange, metrics, filters);
                    break;
                default:
                    throw new Error(`Unknown report type: ${reportType}`);
            }

            // Format the report based on requested format
            let formattedReport;
            switch (format) {
                case 'json':
                    formattedReport = reportData;
                    break;
                case 'csv':
                    formattedReport = await this.formatAsCSV(reportData);
                    break;
                case 'pdf':
                    formattedReport = await this.formatAsPDF(reportData);
                    break;
                default:
                    throw new Error(`Unknown format: ${format}`);
            }

            console.log(`[ReportingService] Report generated successfully`);
            return formattedReport;

        } catch (error) {
            console.error('[ReportingService] Error generating report:', error);
            throw error;
        }
    }

    /**
     * Generate summary report with key metrics
     */
    async generateSummaryReport(timeRange) {
        const endDate = new Date();
        const startDate = new Date();
        const days = this.getTimeRangeDays(timeRange);
        startDate.setDate(startDate.getDate() - days);

        // Get aggregated metrics
        const aggregatedMetrics = await this.aggregationService.getAggregatedMetrics(timeRange);

        // Get current DAU/WAU/MAU
        const latestDAU = aggregatedMetrics.dau[aggregatedMetrics.dau.length - 1] || { user_count: 0 };
        const latestWAU = aggregatedMetrics.wau[aggregatedMetrics.wau.length - 1] || { user_count: 0 };
        const latestMAU = aggregatedMetrics.mau[aggregatedMetrics.mau.length - 1] || { user_count: 0 };

        // Get total events
        const { count: totalEvents } = await this.supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', startDate.toISOString());

        // Get unique users
        const { data: userEvents } = await this.supabase
            .from('analytics_events')
            .select('user_id')
            .gte('timestamp', startDate.toISOString())
            .not('user_id', 'is', null);
        
        const uniqueUsers = new Set(userEvents?.map(e => e.user_id) || []).size;

        // Get event distribution
        const { data: events } = await this.supabase
            .from('analytics_events')
            .select('event_type')
            .gte('timestamp', startDate.toISOString());

        const eventDistribution = events?.reduce((acc, { event_type }) => {
            acc[event_type] = (acc[event_type] || 0) + 1;
            return acc;
        }, {}) || {};

        // Get feature adoption
        const { data: featureAdoption } = await this.supabase
            .from('feature_adoption')
            .select('*')
            .order('adoption_rate', { ascending: false });

        return {
            reportMetadata: {
                generatedAt: new Date().toISOString(),
                timeRange,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            },
            summary: {
                totalEvents,
                uniqueUsers,
                dailyActiveUsers: latestDAU.user_count,
                weeklyActiveUsers: latestWAU.user_count,
                monthlyActiveUsers: latestMAU.user_count,
                newUsersToday: latestDAU.new_users || 0,
                returningUsersToday: latestDAU.returning_users || 0
            },
            trends: {
                dauTrend: this.calculateTrend(aggregatedMetrics.dau),
                wauTrend: this.calculateTrend(aggregatedMetrics.wau),
                mauTrend: this.calculateTrend(aggregatedMetrics.mau)
            },
            topEvents: Object.entries(eventDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([event, count]) => ({ event, count, percentage: ((count / totalEvents) * 100).toFixed(2) })),
            featureAdoption: featureAdoption?.slice(0, 10) || [],
            dailyMetrics: aggregatedMetrics.dau
        };
    }

    /**
     * Generate detailed report with all metrics
     */
    async generateDetailedReport(timeRange, metrics) {
        const summaryReport = await this.generateSummaryReport(timeRange);
        
        // Add detailed breakdowns
        const endDate = new Date();
        const startDate = new Date();
        const days = this.getTimeRangeDays(timeRange);
        startDate.setDate(startDate.getDate() - days);

        // Get hourly breakdown for last 24 hours
        const hourlyBreakdown = [];
        for (let i = 0; i < 24; i++) {
            const hourStart = new Date();
            hourStart.setHours(hourStart.getHours() - i, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hourEnd.getHours() + 1);

            const { count } = await this.supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .gte('timestamp', hourStart.toISOString())
                .lt('timestamp', hourEnd.toISOString());

            hourlyBreakdown.unshift({
                hour: hourStart.toISOString(),
                events: count || 0
            });
        }

        // Get user cohort retention
        const { data: retentionData } = await this.supabase
            .from('retention_cohorts')
            .select('*')
            .gte('cohort_date', startDate.toISOString())
            .order('cohort_date', { ascending: false })
            .order('period_number', { ascending: true });

        // Get time series metrics
        const { data: timeSeriesData } = await this.supabase
            .from('time_series_metrics')
            .select('*')
            .gte('timestamp', startDate.toISOString())
            .order('timestamp', { ascending: true });

        return {
            ...summaryReport,
            detailed: {
                hourlyBreakdown,
                retentionCohorts: this.formatRetentionData(retentionData),
                timeSeriesMetrics: this.formatTimeSeriesData(timeSeriesData),
                eventsByCategory: await this.getEventsByCategory(startDate, endDate),
                userEngagementMetrics: await this.getUserEngagementMetrics(startDate, endDate)
            }
        };
    }

    /**
     * Generate custom report based on specific metrics and filters
     */
    async generateCustomReport(timeRange, metrics, filters) {
        const report = {
            reportMetadata: {
                generatedAt: new Date().toISOString(),
                timeRange,
                requestedMetrics: metrics,
                appliedFilters: filters
            },
            data: {}
        };

        const endDate = new Date();
        const startDate = new Date();
        const days = this.getTimeRangeDays(timeRange);
        startDate.setDate(startDate.getDate() - days);

        // Process each requested metric
        for (const metric of metrics) {
            switch (metric) {
                case 'dau':
                    report.data.dailyActiveUsers = await this.getDAUData(startDate, endDate);
                    break;
                case 'events':
                    report.data.events = await this.getEventData(startDate, endDate, filters);
                    break;
                case 'users':
                    report.data.users = await this.getUserData(startDate, endDate, filters);
                    break;
                case 'retention':
                    report.data.retention = await this.getRetentionData(startDate, endDate);
                    break;
                case 'features':
                    report.data.features = await this.getFeatureData(startDate, endDate);
                    break;
                default:
                    console.warn(`[ReportingService] Unknown metric: ${metric}`);
            }
        }

        return report;
    }

    /**
     * Format report data as CSV
     */
    async formatAsCSV(reportData) {
        const csvData = [];
        
        // Summary section
        if (reportData.summary) {
            csvData.push({
                section: 'Summary',
                metric: 'Total Events',
                value: reportData.summary.totalEvents
            });
            csvData.push({
                section: 'Summary',
                metric: 'Unique Users',
                value: reportData.summary.uniqueUsers
            });
            csvData.push({
                section: 'Summary',
                metric: 'Daily Active Users',
                value: reportData.summary.dailyActiveUsers
            });
        }

        // Top events
        if (reportData.topEvents) {
            reportData.topEvents.forEach(event => {
                csvData.push({
                    section: 'Top Events',
                    metric: event.event,
                    value: event.count,
                    percentage: event.percentage
                });
            });
        }

        // Daily metrics
        if (reportData.dailyMetrics) {
            reportData.dailyMetrics.forEach(day => {
                csvData.push({
                    section: 'Daily Metrics',
                    date: day.date,
                    users: day.user_count,
                    new_users: day.new_users,
                    returning_users: day.returning_users
                });
            });
        }

        const parser = new Parser();
        return parser.parse(csvData);
    }

    /**
     * Format report data as PDF
     */
    async formatAsPDF(reportData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Title
                doc.fontSize(20)
                   .text('Analytics Report', 50, 50);

                // Metadata
                doc.fontSize(10)
                   .text(`Generated: ${reportData.reportMetadata.generatedAt}`, 50, 80)
                   .text(`Time Range: ${reportData.reportMetadata.timeRange}`, 50, 95);

                // Summary section
                if (reportData.summary) {
                    doc.fontSize(16)
                       .text('Summary', 50, 130);
                    
                    doc.fontSize(12);
                    let y = 160;
                    Object.entries(reportData.summary).forEach(([key, value]) => {
                        doc.text(`${this.formatLabel(key)}: ${value}`, 70, y);
                        y += 20;
                    });
                }

                // Top Events
                if (reportData.topEvents && reportData.topEvents.length > 0) {
                    doc.addPage();
                    doc.fontSize(16)
                       .text('Top Events', 50, 50);
                    
                    let y = 80;
                    reportData.topEvents.forEach(event => {
                        doc.fontSize(12)
                           .text(`${event.event}: ${event.count} (${event.percentage}%)`, 70, y);
                        y += 20;
                    });
                }

                // Feature Adoption
                if (reportData.featureAdoption && reportData.featureAdoption.length > 0) {
                    doc.addPage();
                    doc.fontSize(16)
                       .text('Feature Adoption', 50, 50);
                    
                    let y = 80;
                    reportData.featureAdoption.forEach(feature => {
                        doc.fontSize(12)
                           .text(`${feature.feature}: ${feature.adoption_rate}% (${feature.users} users)`, 70, y);
                        y += 20;
                    });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Schedule a report to be generated periodically
     */
    async scheduleReport(schedule) {
        const {
            name,
            reportType = 'summary',
            timeRange = '7d',
            format = 'pdf',
            frequency = 'daily', // 'hourly', 'daily', 'weekly', 'monthly'
            recipients = [],
            enabled = true
        } = schedule;

        try {
            // Store schedule in database
            const { data, error } = await this.supabase
                .from('scheduled_reports')
                .insert({
                    name,
                    report_type: reportType,
                    time_range: timeRange,
                    format,
                    frequency,
                    recipients,
                    enabled,
                    next_run: this.calculateNextRun(frequency)
                })
                .select()
                .single();

            if (error) throw error;

            console.log(`[ReportingService] Scheduled report created: ${name}`);
            return data;

        } catch (error) {
            console.error('[ReportingService] Error scheduling report:', error);
            throw error;
        }
    }

    /**
     * Process scheduled reports
     */
    async processScheduledReports() {
        try {
            // Get due reports
            const { data: dueReports, error } = await this.supabase
                .from('scheduled_reports')
                .select('*')
                .eq('enabled', true)
                .lte('next_run', new Date().toISOString());

            if (error) throw error;

            for (const schedule of dueReports || []) {
                try {
                    console.log(`[ReportingService] Processing scheduled report: ${schedule.name}`);
                    
                    // Generate report
                    const report = await this.generateReport({
                        reportType: schedule.report_type,
                        timeRange: schedule.time_range,
                        format: schedule.format
                    });

                    // Save report
                    const filename = `${schedule.name}_${new Date().toISOString()}.${schedule.format}`;
                    await this.saveReport(filename, report, schedule.format);

                    // Send to recipients (implement email/webhook sending)
                    // await this.sendReport(schedule.recipients, filename, report);

                    // Update next run time
                    await this.supabase
                        .from('scheduled_reports')
                        .update({
                            last_run: new Date().toISOString(),
                            next_run: this.calculateNextRun(schedule.frequency)
                        })
                        .eq('id', schedule.id);

                } catch (error) {
                    console.error(`[ReportingService] Error processing report ${schedule.name}:`, error);
                }
            }

        } catch (error) {
            console.error('[ReportingService] Error processing scheduled reports:', error);
        }
    }

    /**
     * Save report to storage
     */
    async saveReport(filename, data, format) {
        const reportsDir = path.join(process.cwd(), 'reports');
        
        // Ensure reports directory exists
        try {
            await fs.mkdir(reportsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        const filepath = path.join(reportsDir, filename);
        
        if (format === 'pdf') {
            await fs.writeFile(filepath, data);
        } else {
            await fs.writeFile(filepath, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
        }

        console.log(`[ReportingService] Report saved: ${filepath}`);
        return filepath;
    }

    // Helper methods
    getTimeRangeDays(timeRange) {
        switch (timeRange) {
            case '1d': return 1;
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 7;
        }
    }

    calculateTrend(dataPoints) {
        if (!dataPoints || dataPoints.length < 2) return '0%';
        
        const recent = dataPoints[dataPoints.length - 1];
        const previous = dataPoints[dataPoints.length - 2];
        
        const change = ((recent.user_count - previous.user_count) / previous.user_count) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
    }

    calculateNextRun(frequency) {
        const now = new Date();
        
        switch (frequency) {
            case 'hourly':
                now.setHours(now.getHours() + 1, 0, 0, 0);
                break;
            case 'daily':
                now.setDate(now.getDate() + 1);
                now.setHours(9, 0, 0, 0); // 9 AM
                break;
            case 'weekly':
                now.setDate(now.getDate() + 7);
                now.setHours(9, 0, 0, 0);
                break;
            case 'monthly':
                now.setMonth(now.getMonth() + 1);
                now.setDate(1);
                now.setHours(9, 0, 0, 0);
                break;
        }
        
        return now.toISOString();
    }

    formatRetentionData(retentionData) {
        const cohorts = {};
        
        retentionData?.forEach(row => {
            if (!cohorts[row.cohort_date]) {
                cohorts[row.cohort_date] = {
                    cohortDate: row.cohort_date,
                    cohortSize: row.cohort_size,
                    retention: {}
                };
            }
            cohorts[row.cohort_date].retention[`${row.period_type}_${row.period_number}`] = {
                retainedUsers: row.retained_users,
                retentionRate: row.retention_rate
            };
        });
        
        return Object.values(cohorts);
    }

    formatTimeSeriesData(timeSeriesData) {
        const metrics = {};
        
        timeSeriesData?.forEach(row => {
            if (!metrics[row.metric_name]) {
                metrics[row.metric_name] = [];
            }
            metrics[row.metric_name].push({
                timestamp: row.timestamp,
                value: row.value,
                periodType: row.period_type,
                dimensions: row.dimensions
            });
        });
        
        return metrics;
    }

    async getEventsByCategory(startDate, endDate) {
        const { data } = await this.supabase
            .from('analytics_events')
            .select('category, event_type')
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString());
        
        const categories = {};
        data?.forEach(({ category, event_type }) => {
            const cat = category || 'uncategorized';
            if (!categories[cat]) {
                categories[cat] = { total: 0, events: {} };
            }
            categories[cat].total++;
            categories[cat].events[event_type] = (categories[cat].events[event_type] || 0) + 1;
        });
        
        return categories;
    }

    async getUserEngagementMetrics(startDate, endDate) {
        // Implementation depends on what engagement metrics you want to track
        return {
            avgSessionDuration: 0,
            avgEventsPerUser: 0,
            bounceRate: 0
        };
    }

    async getDAUData(startDate, endDate) {
        const { data } = await this.supabase
            .from('daily_active_users')
            .select('*')
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true });
        
        return data || [];
    }

    async getEventData(startDate, endDate, filters) {
        let query = this.supabase
            .from('analytics_events')
            .select('*')
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString());
        
        // Apply filters
        if (filters.event_type) {
            query = query.eq('event_type', filters.event_type);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }
        
        const { data } = await query;
        return data || [];
    }

    async getUserData(startDate, endDate, filters) {
        const { data } = await this.supabase
            .from('analytics_events')
            .select('user_id, timestamp')
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString())
            .not('user_id', 'is', null);
        
        // Group by user
        const users = {};
        data?.forEach(({ user_id, timestamp }) => {
            if (!users[user_id]) {
                users[user_id] = {
                    userId: user_id,
                    firstSeen: timestamp,
                    lastSeen: timestamp,
                    eventCount: 0
                };
            }
            users[user_id].eventCount++;
            if (timestamp > users[user_id].lastSeen) {
                users[user_id].lastSeen = timestamp;
            }
            if (timestamp < users[user_id].firstSeen) {
                users[user_id].firstSeen = timestamp;
            }
        });
        
        return Object.values(users);
    }

    async getRetentionData(startDate, endDate) {
        const { data } = await this.supabase
            .from('retention_cohorts')
            .select('*')
            .gte('cohort_date', startDate.toISOString().split('T')[0])
            .lte('cohort_date', endDate.toISOString().split('T')[0])
            .order('cohort_date', { ascending: false })
            .order('period_number', { ascending: true });
        
        return this.formatRetentionData(data);
    }

    async getFeatureData(startDate, endDate) {
        const { data } = await this.supabase
            .from('feature_adoption')
            .select('*')
            .order('adoption_rate', { ascending: false });
        
        return data || [];
    }
}

module.exports = ReportingService;