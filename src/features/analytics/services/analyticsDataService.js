const supabaseDatabase = require('../../common/services/supabaseDatabase');
const { PGMQConsumer } = require('./pgmqConsumer');
const { businessMetricsService } = require('./businessMetricsService');
const AggregationScheduler = require('./aggregationScheduler');

// Test data to exclude from analytics
const TEST_USER_IDS = [
    '123e4567-e89b-12d3-a456-426614174000' // Test user from send-real-event.js
];

const TEST_EVENT_TYPES = [
    'test_analytics_event',
    'test_event'
];

class AnalyticsDataService {
    constructor() {
        this.db = supabaseDatabase;
        this.consumer = null;
        this.aggregationScheduler = null;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        this.listeners = new Map();
        console.log('[AnalyticsDataService] Initialized');
    }

    async initialize(config = {}) {
        try {
            // Initialize database connection
            this.db.initialize();
            
            // Initialize PGMQ consumer
            this.consumer = new PGMQConsumer(config);
            
            // Set up event listeners
            this.consumer.on('event_processed', (event) => {
                this.emitUpdate('event_processed', event);
                this.clearCache(); // Clear cache when new events arrive
            });
            
            this.consumer.on('metrics_updated', (metrics) => {
                this.emitUpdate('metrics_updated', metrics);
            });
            
            this.consumer.on('alert_triggered', (alert) => {
                this.emitUpdate('alert_triggered', alert);
            });
            
            // Start the consumer
            await this.consumer.start();
            console.log('[AnalyticsDataService] PGMQ Consumer started');
            
            // Initialize and start aggregation scheduler
            this.aggregationScheduler = new AggregationScheduler(this.db);
            await this.aggregationScheduler.start();
            console.log('[AnalyticsDataService] Aggregation scheduler started');
            
            console.log('[AnalyticsDataService] Initialized successfully');
        } catch (error) {
            console.error('[AnalyticsDataService] Initialization error:', error);
            throw error;
        }
    }

    // Summary metrics for dashboard
    async getSummaryMetrics(timeRange = '7d') {
        const cacheKey = `summary_${timeRange}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        // Try to use aggregated data first
        if (this.aggregationScheduler) {
            try {
                const aggregatedMetrics = await this.aggregationScheduler.aggregationService.getAggregatedMetrics(timeRange);
                
                if (aggregatedMetrics.dau.length > 0) {
                    // Use aggregated DAU/WAU/MAU data
                    const latestDAU = aggregatedMetrics.dau[aggregatedMetrics.dau.length - 1];
                    const totalUsers = await this.getTotalUsersCount();
                    
                    // Calculate trends from aggregated data
                    const previousDAU = aggregatedMetrics.dau.length > 1 ? 
                        aggregatedMetrics.dau[aggregatedMetrics.dau.length - 2] : latestDAU;
                    
                    const activeChange = latestDAU.user_count - previousDAU.user_count;
                    const activeTrend = previousDAU.user_count > 0 ? 
                        ((activeChange / previousDAU.user_count) * 100).toFixed(1) : '0';
                    
                    // Get lessons and completion data
                    const lessonsCreated = await this.getEventCount('lesson_generated', 
                        new Date(Date.now() - this.getTimeRangeDays(timeRange) * 24 * 60 * 60 * 1000), 
                        new Date()
                    );
                    
                    const lessonsStarted = await this.getEventCount('lesson_started', 
                        new Date(Date.now() - this.getTimeRangeDays(timeRange) * 24 * 60 * 60 * 1000), 
                        new Date()
                    );
                    
                    const lessonsCompleted = await this.getEventCount('lesson_completed', 
                        new Date(Date.now() - this.getTimeRangeDays(timeRange) * 24 * 60 * 60 * 1000), 
                        new Date()
                    );
                    
                    const completionRate = lessonsStarted > 0 ? 
                        Math.round((lessonsCompleted / lessonsStarted) * 100) : 0;
                    
                    const result = {
                        totalUsers,
                        activeToday: latestDAU.user_count,
                        newUsersToday: latestDAU.new_users || 0,
                        returningUsers: latestDAU.returning_users || 0,
                        lessonsCreated,
                        completionRate,
                        trends: {
                            users: `${activeTrend > 0 ? '+' : ''}${activeTrend}%`,
                            active: `${activeTrend > 0 ? '+' : ''}${activeTrend}%`,
                            lessons: '0%', // TODO: Calculate lesson trends
                            completion: '0%' // TODO: Calculate completion trends
                        }
                    };
                    
                    this.setCache(cacheKey, result);
                    return result;
                }
            } catch (error) {
                console.error('[AnalyticsDataService] Error using aggregated metrics:', error);
                // Fall back to direct calculation
            }
        }

        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '1d':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
        }

        try {
            // Get total unique users (excluding test users)
            const allEvents = await this.db.findMany('analytics_events', {});
            const uniqueUsers = new Set();
            allEvents.forEach(event => {
                if (event.user_id && !TEST_USER_IDS.includes(event.user_id)) {
                    uniqueUsers.add(event.user_id);
                }
            });
            const totalUsers = uniqueUsers.size;
            
            // Get active users today
            const today = new Date().toISOString().split('T')[0];
            const activeUsersToday = await this.getActiveUsersCount(today, today);
            
            // Get lessons created
            const lessonsCreated = await this.getEventCount('lesson_generated', startDate, endDate);
            
            // Get completion rate
            const lessonsStarted = await this.getEventCount('lesson_started', startDate, endDate);
            const lessonsCompleted = await this.getEventCount('lesson_completed', startDate, endDate);
            const completionRate = lessonsStarted > 0 
                ? (lessonsCompleted / lessonsStarted) * 100 
                : 0;

            // Calculate trends by comparing with previous period
            const prevEndDate = new Date(startDate);
            const prevStartDate = new Date(startDate);
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
            
            // Get previous period metrics
            const prevActiveUsers = await this.getActiveUsersCount(prevStartDate, prevEndDate);
            const prevLessonsCreated = await this.getEventCount('lesson_generated', prevStartDate, prevEndDate);
            const prevLessonsStarted = await this.getEventCount('lesson_started', prevStartDate, prevEndDate);
            const prevLessonsCompleted = await this.getEventCount('lesson_completed', prevStartDate, prevEndDate);
            const prevCompletionRate = prevLessonsStarted > 0 
                ? (prevLessonsCompleted / prevLessonsStarted) * 100 
                : 0;
            
            // Calculate percentage changes
            const calculateTrend = (current, previous) => {
                if (previous === 0) return current > 0 ? '+100%' : '0%';
                const change = ((current - previous) / previous) * 100;
                const sign = change >= 0 ? '+' : '';
                return `${sign}${Math.round(change * 10) / 10}%`;
            };
            
            const result = {
                totalUsers,
                activeToday: activeUsersToday,
                lessonsCreated,
                completionRate: Math.round(completionRate * 10) / 10,
                trends: {
                    users: calculateTrend(totalUsers, prevActiveUsers), // Compare total users vs previous active
                    active: calculateTrend(activeUsersToday, prevActiveUsers),
                    lessons: calculateTrend(lessonsCreated, prevLessonsCreated),
                    completion: calculateTrend(completionRate, prevCompletionRate)
                }
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching summary metrics:', error);
            throw error;
        }
    }

    // Get time series data for charts
    async getTimeSeriesData(metric, startDate, endDate, interval = 'hour') {
        const cacheKey = `timeseries_${metric}_${startDate}_${endDate}_${interval}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            let data = [];
            
            switch (metric) {
                case 'user_registrations':
                    data = await this.getEventTimeSeries('user_registered', startDate, endDate, interval);
                    break;

                case 'lesson_completions':
                    data = await this.getEventTimeSeries('lesson_completed', startDate, endDate, interval);
                    break;

                case 'active_users':
                    data = await this.getActiveUsersTimeSeries(startDate, endDate, interval);
                    break;

                case 'ai_cost':
                    data = await this.getCostTimeSeries(startDate, endDate, interval);
                    break;
            }

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching time series data:', error);
            throw error;
        }
    }

    // Get user cohort retention data
    async getUserCohorts() {
        const cacheKey = 'user_cohorts';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            // For now, return mock data until cohort analysis is implemented
            const result = [
                {
                    cohort_week: '2025-01',
                    cohort_size: 100,
                    day_1: 85,
                    day_7: 65,
                    day_30: 45,
                    day_90: 30
                }
            ];
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching cohort data:', error);
            throw error;
        }
    }

    // Get feature adoption metrics
    async getFeatureAdoption() {
        const cacheKey = 'feature_adoption';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const features = await this.db.findMany('feature_adoption', {}, {
                limit: 1000
            });
            
            // Filter out test users
            const realFeatures = features.filter(f => !TEST_USER_IDS.includes(f.user_id));
            const totalUsers = realFeatures.length || 1;
            
            const featureMetrics = [
                { name: 'Document Upload', field: 'first_document_date' },
                { name: 'Lesson Creation', field: 'first_lesson_date' },
                { name: 'Canvas Sync', field: 'first_canvas_sync_date' },
                { name: 'Voice Generation', field: 'first_voice_date' },
                { name: 'Notes & Highlights', field: 'first_note_date' },
                { name: 'Chat Usage', field: 'first_chat_date' }
            ];

            const result = featureMetrics.map(feature => {
                const usersWithFeature = realFeatures.filter(user => user[feature.field] !== null).length;
                const adoptionRate = (usersWithFeature / totalUsers) * 100;
                
                return {
                    feature: feature.name,
                    users: usersWithFeature,
                    total_users: totalUsers,
                    adoption_rate: Math.round(adoptionRate * 10) / 10
                };
            });

            // Sort by adoption rate
            result.sort((a, b) => b.adoption_rate - a.adoption_rate);

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching feature adoption:', error);
            throw error;
        }
    }

    // Get recent events for live feed
    async getRecentEvents(limit = 100) {
        try {
            const events = await this.db.findMany('analytics_events', {}, {
                orderBy: 'timestamp',
                ascending: false,
                limit: limit * 2 // Get extra to account for filtering
            });
            
            // Filter out test events and users
            const filteredEvents = events.filter(event => {
                const isTestUser = event.user_id && TEST_USER_IDS.includes(event.user_id);
                const isTestEvent = TEST_EVENT_TYPES.includes(event.event_type);
                return !isTestUser && !isTestEvent;
            });
            
            // Return only requested limit
            return filteredEvents.slice(0, limit);
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching recent events:', error);
            throw error;
        }
    }

    // Get voice analytics
    async getVoiceMetrics(timeRange = '7d') {
        const cacheKey = `voice_metrics_${timeRange}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const days = parseInt(timeRange.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        try {
            const voiceEvents = await this.db.findMany('analytics_events', {
                event_type: 'voice_generated'
            }, {
                limit: 1000
            });

            const result = {
                total_generations: voiceEvents.length,
                total_plays: 0, // Would need play events
                total_characters: 0, // Would need character count in events
                quota_exceeded: 0, // Would need quota events
                avg_cache_hit_rate: 0,
                avg_generation_time: 0
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching voice metrics:', error);
            throw error;
        }
    }

    // Get system health metrics
    async getSystemHealth() {
        const cacheKey = 'system_health';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const consumerStats = this.consumer ? this.consumer.getStats() : {};
            
            // Calculate error rate from recent events
            const recentHours = 24;
            const since = new Date();
            since.setHours(since.getHours() - recentHours);
            
            const apiRequests = await this.getEventCount('api_request', since, new Date());
            const apiErrors = await this.getEventCount('api_error', since, new Date());
            const errorRate = apiRequests > 0 ? (apiErrors / apiRequests) * 100 : 0;
            
            // Calculate average response time from events with response_time_ms
            const recentApiEvents = await this.db.findMany('analytics_events', {
                event_type: 'api_request'
            });
            
            const validResponseTimes = recentApiEvents
                .filter(e => e.response_time_ms && e.response_time_ms > 0)
                .map(e => e.response_time_ms);
                
            const avgResponseTime = validResponseTimes.length > 0
                ? validResponseTimes.reduce((a, b) => a + b, 0) / validResponseTimes.length
                : 0;
            
            // Calculate pipeline success rate
            const totalProcessed = consumerStats.eventsProcessed || 0;
            const totalErrors = consumerStats.errors || 0;
            const successRate = totalProcessed > 0 
                ? ((totalProcessed - totalErrors) / totalProcessed) * 100 
                : 100;
            
            const result = {
                api_requests: apiRequests,
                avg_response_time_ms: Math.round(avgResponseTime),
                error_rate: Math.round(errorRate * 10) / 10,
                queue_depth: consumerStats.queueDepth || 0,
                processing_pipeline_success_rate: Math.round(successRate * 10) / 10,
                ai_service_uptime_percentage: 100, // Would need separate monitoring
                consumer_status: {
                    is_running: consumerStats.isRunning || false,
                    events_processed: consumerStats.eventsProcessed || 0,
                    errors: consumerStats.errors || 0,
                    events_per_minute: consumerStats.eventsPerMinute || 0
                }
            };

            this.setCache(cacheKey, result, 10000); // Cache for 10 seconds
            return result;
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching system health:', error);
            throw error;
        }
    }

    // Get active alerts
    async getActiveAlerts() {
        try {
            const alerts = await this.db.findMany('alert_history', {
                acknowledged_at: null,
                resolved_at: null
            }, {
                orderBy: 'triggered_at',
                ascending: false,
                limit: 50
            });
            
            return alerts || [];
        } catch (error) {
            console.error('[AnalyticsDataService] Error fetching alerts:', error);
            throw error;
        }
    }

    // Helper methods
    async getTotalUsersCount() {
        try {
            const allEvents = await this.db.findMany('analytics_events', {});
            const uniqueUsers = new Set();
            allEvents.forEach(event => {
                if (event.user_id && !TEST_USER_IDS.includes(event.user_id)) {
                    uniqueUsers.add(event.user_id);
                }
            });
            return uniqueUsers.size;
        } catch (error) {
            console.error('[AnalyticsDataService] Error getting total users count:', error);
            return 0;
        }
    }

    async getEventCount(eventType, startDate, endDate) {
        const filters = { event_type: eventType };
        const events = await this.db.findMany('analytics_events', filters);
        
        return events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= startDate && eventDate <= endDate;
        }).length;
    }

    async getActiveUsersCount(startDate, endDate) {
        const events = await this.db.findMany('analytics_events', {});
        
        const uniqueUsers = new Set();
        events.forEach(event => {
            const eventDate = new Date(event.timestamp);
            if (eventDate >= new Date(startDate) && eventDate <= new Date(endDate) && event.user_id) {
                // Exclude test users
                if (!TEST_USER_IDS.includes(event.user_id)) {
                    uniqueUsers.add(event.user_id);
                }
            }
        });
        
        return uniqueUsers.size;
    }

    async getEventTimeSeries(eventType, startDate, endDate, interval) {
        const events = await this.db.findMany('analytics_events', { event_type: eventType });
        
        return this.aggregateByInterval(
            events.filter(event => {
                const eventDate = new Date(event.timestamp);
                return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
            }),
            interval
        );
    }

    async getActiveUsersTimeSeries(startDate, endDate, interval) {
        const events = await this.db.findMany('analytics_events', {});
        
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate) && event.user_id;
        });
        
        return this.aggregateUniqueUsersByInterval(filteredEvents, interval);
    }

    async getCostTimeSeries(startDate, endDate, interval) {
        const events = await this.db.findMany('analytics_events', {});
        
        const costEvents = events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate) && event.cost_usd;
        });
        
        return this.aggregateSumByInterval(costEvents, 'cost_usd', interval);
    }

    aggregateByInterval(data, interval) {
        const aggregated = new Map();
        
        data.forEach(item => {
            const date = new Date(item.timestamp);
            let key;
            
            switch (interval) {
                case 'hour':
                    key = date.toISOString().slice(0, 13) + ':00:00';
                    break;
                case 'day':
                    key = date.toISOString().slice(0, 10);
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().slice(0, 10);
                    break;
            }
            
            aggregated.set(key, (aggregated.get(key) || 0) + 1);
        });
        
        return Array.from(aggregated.entries()).map(([period, value]) => ({
            period,
            value
        }));
    }

    aggregateUniqueUsersByInterval(data, interval) {
        const aggregated = new Map();
        
        data.forEach(item => {
            const date = new Date(item.timestamp);
            let key;
            
            switch (interval) {
                case 'hour':
                    key = date.toISOString().slice(0, 13) + ':00:00';
                    break;
                case 'day':
                    key = date.toISOString().slice(0, 10);
                    break;
            }
            
            if (!aggregated.has(key)) {
                aggregated.set(key, new Set());
            }
            aggregated.get(key).add(item.user_id);
        });
        
        return Array.from(aggregated.entries()).map(([period, users]) => ({
            period,
            value: users.size
        }));
    }

    aggregateSumByInterval(data, field, interval) {
        const aggregated = new Map();
        
        data.forEach(item => {
            const date = new Date(item.timestamp);
            let key;
            
            switch (interval) {
                case 'hour':
                    key = date.toISOString().slice(0, 13) + ':00:00';
                    break;
                case 'day':
                    key = date.toISOString().slice(0, 10);
                    break;
            }
            
            aggregated.set(key, (aggregated.get(key) || 0) + (item[field] || 0));
        });
        
        return Array.from(aggregated.entries()).map(([period, value]) => ({
            period,
            value: Math.round(value * 100) / 100
        }));
    }

    // Cache management
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.timeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data, timeout = this.cacheTimeout) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            timeout
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Event emitter for real-time updates
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emitUpdate(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[AnalyticsDataService] Event listener error for ${event}:`, error);
                }
            });
        }
    }

    // Business Intelligence Methods
    async getBusinessKPIs(timeRange = '7d') {
        return await businessMetricsService.getBusinessKPIs(timeRange);
    }
    
    async getConversionFunnel(timeRange = '7d') {
        return await businessMetricsService.getConversionFunnel(timeRange);
    }
    
    async getLearningAnalytics(timeRange = '7d') {
        return await businessMetricsService.getLearningAnalytics(timeRange);
    }
    
    async getActionableInsights(timeRange = '7d') {
        return await businessMetricsService.getActionableInsights(timeRange);
    }

    // Aggregation & Reporting Methods
    async getDAUData(startDate, endDate) {
        try {
            const client = this.db.getClient();
            
            const { data, error } = await client
                .from('daily_active_users')
                .select('*')
                .gte('date', startDate.toISOString().split('T')[0])
                .lte('date', endDate.toISOString().split('T')[0])
                .order('date', { ascending: true });
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('[AnalyticsDataService] Error getting DAU data:', error);
            return [];
        }
    }

    async getRetentionCohorts(timeRange = '30d') {
        try {
            const client = this.db.getClient();
            const days = this.getTimeRangeDays(timeRange);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const { data, error } = await client
                .from('user_retention_cohorts')
                .select('*')
                .gte('cohort_date', startDate.toISOString().split('T')[0])
                .order('cohort_date', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('[AnalyticsDataService] Error getting retention cohorts:', error);
            return [];
        }
    }

    async getUniqueUsersInPeriod(startDate, endDate) {
        try {
            const client = this.db.getClient();
            
            const { data, error } = await client
                .from('analytics_events')
                .select('user_id')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString())
                .not('user_id', 'is', null)
                .neq('event_type', 'test_analytics_event')
                .neq('event_type', 'test_event');
            
            if (error) throw error;
            
            // Count unique users
            const uniqueUsers = new Set(data.map(e => e.user_id));
            return uniqueUsers.size;
        } catch (error) {
            console.error('[AnalyticsDataService] Error getting unique users:', error);
            return 0;
        }
    }

    async generateReport(options) {
        try {
            const reportingService = require('./reportingService');
            return await reportingService.generateReport(options);
        } catch (error) {
            console.error('[AnalyticsDataService] Error generating report:', error);
            throw error;
        }
    }

    // Cleanup
    async stop() {
        if (this.consumer) {
            await this.consumer.stop();
        }
        if (this.aggregationScheduler) {
            this.aggregationScheduler.stop();
        }
        this.clearCache();
        this.listeners.clear();
    }
    
    getTimeRangeDays(timeRange) {
        switch (timeRange) {
            case '1d': return 1;
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 7;
        }
    }
}

// Export singleton instance
const analyticsDataService = new AnalyticsDataService();

module.exports = {
    analyticsDataService,
    AnalyticsDataService
};