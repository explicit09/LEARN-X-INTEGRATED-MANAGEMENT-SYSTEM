const internalBridge = require('../../bridge/internalBridge');
const { analyticsDataService } = require('./services/analyticsDataService');

class AnalyticsService {
    constructor() {
        this.dataService = analyticsDataService;
        this.initialized = false;
        console.log('[AnalyticsService] Created');
    }

    async initialize() {
        if (this.initialized) {
            console.log('[AnalyticsService] Already initialized');
            return;
        }

        try {
            await this.dataService.initialize();
            this.initialized = true;
            console.log('[AnalyticsService] Initialized successfully');
        } catch (error) {
            console.error('[AnalyticsService] Initialization failed:', error);
            throw error;
        }
    }

    // Dashboard API methods
    async getSummaryMetrics(timeRange = '7d') {
        try {
            return await this.dataService.getSummaryMetrics(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting summary metrics:', error);
            return {
                totalUsers: 0,
                activeToday: 0,
                lessonsCreated: 0,
                completionRate: 0,
                trends: {
                    users: '0%',
                    active: '0%',
                    lessons: '0%',
                    completion: '0%'
                }
            };
        }
    }

    async getTimeSeriesData(metric, startDate, endDate, interval = 'hour') {
        try {
            return await this.dataService.getTimeSeriesData(metric, startDate, endDate, interval);
        } catch (error) {
            console.error('[AnalyticsService] Error getting time series data:', error);
            return [];
        }
    }

    async getUserCohorts() {
        try {
            return await this.dataService.getUserCohorts();
        } catch (error) {
            console.error('[AnalyticsService] Error getting user cohorts:', error);
            return [];
        }
    }

    async getFeatureAdoption() {
        try {
            return await this.dataService.getFeatureAdoption();
        } catch (error) {
            console.error('[AnalyticsService] Error getting feature adoption:', error);
            return [];
        }
    }

    async getRecentEvents(limit = 100) {
        try {
            return await this.dataService.getRecentEvents(limit);
        } catch (error) {
            console.error('[AnalyticsService] Error getting recent events:', error);
            return [];
        }
    }

    async getVoiceMetrics(timeRange = '7d') {
        try {
            return await this.dataService.getVoiceMetrics(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting voice metrics:', error);
            return {
                total_generations: 0,
                total_plays: 0,
                total_characters: 0,
                quota_exceeded: 0,
                avg_cache_hit_rate: 0,
                avg_generation_time: 0
            };
        }
    }

    async getSystemHealth() {
        try {
            return await this.dataService.getSystemHealth();
        } catch (error) {
            console.error('[AnalyticsService] Error getting system health:', error);
            return {
                api_requests: 0,
                avg_response_time_ms: 0,
                error_rate: 0,
                queue_depth: 0,
                processing_pipeline_success_rate: 100,
                ai_service_uptime_percentage: 100,
                consumer_status: {
                    is_running: false,
                    events_processed: 0,
                    errors: 0,
                    events_per_minute: 0
                }
            };
        }
    }

    async getActiveAlerts() {
        try {
            return await this.dataService.getActiveAlerts();
        } catch (error) {
            console.error('[AnalyticsService] Error getting active alerts:', error);
            return [];
        }
    }

    // Platform-specific analytics
    async getLearnXMetrics(timeRange = '7d') {
        try {
            const summary = await this.getSummaryMetrics(timeRange);
            const featureAdoption = await this.getFeatureAdoption();
            const voiceMetrics = await this.getVoiceMetrics(timeRange);
            
            return {
                summary,
                featureAdoption,
                voiceMetrics,
                timeRange
            };
        } catch (error) {
            console.error('[AnalyticsService] Error getting LEARN-X metrics:', error);
            return null;
        }
    }

    // Real-time event subscription
    subscribeToEvents(callback) {
        this.dataService.on('event_processed', callback);
        
        return () => {
            this.dataService.off('event_processed', callback);
        };
    }

    subscribeToMetrics(callback) {
        this.dataService.on('metrics_updated', callback);
        
        return () => {
            this.dataService.off('metrics_updated', callback);
        };
    }

    subscribeToAlerts(callback) {
        this.dataService.on('alert_triggered', callback);
        
        return () => {
            this.dataService.off('alert_triggered', callback);
        };
    }

    // Business Intelligence Methods
    async getBusinessKPIs(timeRange = '7d') {
        try {
            return await this.dataService.getBusinessKPIs(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting business KPIs:', error);
            return null;
        }
    }
    
    async getConversionFunnel(timeRange = '7d') {
        try {
            return await this.dataService.getConversionFunnel(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting conversion funnel:', error);
            return null;
        }
    }
    
    async getLearningAnalytics(timeRange = '7d') {
        try {
            return await this.dataService.getLearningAnalytics(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting learning analytics:', error);
            return null;
        }
    }
    
    async getActionableInsights(timeRange = '7d') {
        try {
            return await this.dataService.getActionableInsights(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting actionable insights:', error);
            return [];
        }
    }

    // Aggregation & Reporting methods
    async getDAUWAUMAU(startDate, endDate) {
        try {
            // Get daily active users data for the period
            const dauData = await this.dataService.getDAUData(startDate, endDate);
            
            if (!dauData || dauData.length === 0) {
                return {
                    dau: [],
                    wau: [],
                    mau: [],
                    latest: { dau: 0, wau: 0, mau: 0 }
                };
            }
            
            // For WAU/MAU, we need to calculate unique users over rolling windows
            // This requires actual user IDs, not just counts
            const today = new Date();
            const wau = await this.calculateUniqueUsersForPeriod(7, today);
            const mau = await this.calculateUniqueUsersForPeriod(30, today);
            
            return {
                dau: dauData.map(d => ({
                    date: d.date,
                    dau: d.user_count,
                    newUsers: d.new_users || 0,
                    returningUsers: d.returning_users || 0
                })),
                wau: [], // For now, return empty array for trend
                mau: [], // For now, return empty array for trend
                latest: {
                    dau: dauData[dauData.length - 1]?.user_count || 0,
                    wau: wau,
                    mau: mau
                }
            };
        } catch (error) {
            console.error('[AnalyticsService] Error getting DAU/WAU/MAU:', error);
            return {
                dau: [],
                wau: [],
                mau: [],
                latest: { dau: 0, wau: 0, mau: 0 }
            };
        }
    }

    async calculateUniqueUsersForPeriod(days, endDate = new Date()) {
        try {
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - days);
            
            const uniqueUsers = await this.dataService.getUniqueUsersInPeriod(startDate, endDate);
            return uniqueUsers;
        } catch (error) {
            console.error(`[AnalyticsService] Error calculating unique users for ${days} days:`, error);
            return 0;
        }
    }

    async getRetentionCohorts(timeRange = '30d') {
        try {
            return await this.dataService.getRetentionCohorts(timeRange);
        } catch (error) {
            console.error('[AnalyticsService] Error getting retention cohorts:', error);
            return [];
        }
    }

    async generateReport(options) {
        try {
            const report = await this.dataService.generateReport(options);
            
            // Save to temp directory and return file path
            const fs = require('fs').promises;
            const path = require('path');
            const os = require('os');
            
            // Create temp file path
            const tempDir = path.join(os.tmpdir(), 'glass-analytics-reports');
            await fs.mkdir(tempDir, { recursive: true });
            
            const filename = report.filename || `report_${Date.now()}.${options.format || 'pdf'}`;
            const filepath = path.join(tempDir, filename);
            
            // Write file based on format
            if (options.format === 'csv') {
                await fs.writeFile(filepath, report.content, 'utf8');
            } else if (options.format === 'json') {
                await fs.writeFile(filepath, JSON.stringify(report.content, null, 2), 'utf8');
            } else {
                // PDF - write buffer
                await fs.writeFile(filepath, report.buffer);
            }
            
            return {
                filepath,
                filename,
                format: options.format || 'pdf',
                generatedAt: new Date().toISOString(),
                size: (await fs.stat(filepath)).size
            };
        } catch (error) {
            console.error('[AnalyticsService] Error generating report:', error);
            throw error;
        }
    }

    // Utility methods
    async refreshCache() {
        this.dataService.clearCache();
        console.log('[AnalyticsService] Cache cleared');
    }

    async getConsumerStatus() {
        const health = await this.getSystemHealth();
        return health.consumer_status;
    }

    // Cleanup
    async cleanup() {
        await this.dataService.stop();
        this.initialized = false;
        console.log('[AnalyticsService] Cleaned up');
    }
}

// Export singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService;