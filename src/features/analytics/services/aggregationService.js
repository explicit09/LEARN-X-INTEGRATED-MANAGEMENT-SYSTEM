/**
 * Analytics Aggregation Service
 * Handles DAU/WAU/MAU calculations, retention cohorts, and time-series rollups
 */

class AggregationService {
    constructor(supabase) {
        this.supabase = supabase;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('[AggregationService] Initializing...');
        
        // Create aggregation tables if they don't exist
        // Note: Tables should be created via migrations, not runtime
        // await this.createAggregationTables();
        
        this.isInitialized = true;
        console.log('[AggregationService] Initialized successfully');
    }

    async createAggregationTables() {
        try {
            // Create daily active users table
            await this.supabase.rpc('execute_sql', {
                query: `
                CREATE TABLE IF NOT EXISTS daily_active_users (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    date DATE NOT NULL,
                    user_count INTEGER NOT NULL DEFAULT 0,
                    new_users INTEGER NOT NULL DEFAULT 0,
                    returning_users INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(date)
                );
                
                CREATE INDEX IF NOT EXISTS idx_dau_date ON daily_active_users(date DESC);
                `
            });

            // Create weekly active users table
            await this.supabase.rpc('execute_sql', {
                query: `
                CREATE TABLE IF NOT EXISTS weekly_active_users (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    week_start DATE NOT NULL,
                    week_end DATE NOT NULL,
                    user_count INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(week_start)
                );
                
                CREATE INDEX IF NOT EXISTS idx_wau_week ON weekly_active_users(week_start DESC);
                `
            });

            // Create monthly active users table
            await this.supabase.rpc('execute_sql', {
                query: `
                CREATE TABLE IF NOT EXISTS monthly_active_users (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    month DATE NOT NULL,
                    user_count INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(month)
                );
                
                CREATE INDEX IF NOT EXISTS idx_mau_month ON monthly_active_users(month DESC);
                `
            });

            // Create retention cohorts table
            await this.supabase.rpc('execute_sql', {
                query: `
                CREATE TABLE IF NOT EXISTS retention_cohorts (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    cohort_date DATE NOT NULL,
                    period_type VARCHAR(10) NOT NULL, -- 'day', 'week', 'month'
                    period_number INTEGER NOT NULL,
                    cohort_size INTEGER NOT NULL DEFAULT 0,
                    retained_users INTEGER NOT NULL DEFAULT 0,
                    retention_rate DECIMAL(5,2) DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(cohort_date, period_type, period_number)
                );
                
                CREATE INDEX IF NOT EXISTS idx_retention_cohort ON retention_cohorts(cohort_date, period_type);
                `
            });

            // Create time series metrics table
            await this.supabase.rpc('execute_sql', {
                query: `
                CREATE TABLE IF NOT EXISTS time_series_metrics (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    metric_name VARCHAR(100) NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
                    period_type VARCHAR(10) NOT NULL, -- 'hour', 'day', 'week', 'month'
                    value DECIMAL(20,4) NOT NULL DEFAULT 0,
                    dimensions JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_tsm_metric_time ON time_series_metrics(metric_name, timestamp DESC);
                CREATE INDEX IF NOT EXISTS idx_tsm_period ON time_series_metrics(period_type, timestamp DESC);
                `
            });

            console.log('[AggregationService] Aggregation tables created successfully');
        } catch (error) {
            console.error('[AggregationService] Error creating tables:', error);
            throw error;
        }
    }

    /**
     * Calculate Daily Active Users (DAU) for a specific date
     */
    async calculateDAU(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        const startTime = `${dateStr}T00:00:00Z`;
        const endTime = `${dateStr}T23:59:59Z`;
        
        try {
            // Get all user events for the day
            const { data: events, error } = await this.supabase
                .from('analytics_events')
                .select('user_id, timestamp')
                .gte('timestamp', startTime)
                .lte('timestamp', endTime)
                .not('user_id', 'is', null)
                .neq('event_type', 'test_analytics_event') // Exclude test events
                .neq('event_type', 'test_event');

            if (error) throw error;

            // Get unique users
            const uniqueUserIds = [...new Set(events.map(e => e.user_id))];
            const userCount = uniqueUserIds.length;

            // Identify new vs returning users
            let newUsers = 0;
            let returningUsers = 0;

            if (userCount > 0) {
                // For each user, check if they have events before this date
                for (const userId of uniqueUserIds) {
                    const { data: previousEvents, error: prevError } = await this.supabase
                        .from('analytics_events')
                        .select('user_id')
                        .eq('user_id', userId)
                        .lt('timestamp', startTime)
                        .limit(1);

                    if (!prevError && (!previousEvents || previousEvents.length === 0)) {
                        newUsers++;
                    } else {
                        returningUsers++;
                    }
                }
            }

            // Upsert DAU record
            const { error: upsertError } = await this.supabase
                .from('daily_active_users')
                .upsert({
                    date: dateStr,
                    user_count: userCount,
                    new_users: newUsers,
                    returning_users: returningUsers
                }, {
                    onConflict: 'date'
                });

            if (upsertError) throw upsertError;

            console.log(`[AggregationService] DAU calculated for ${dateStr}: ${userCount} users (${newUsers} new, ${returningUsers} returning)`);
            
            return { date: dateStr, userCount, newUsers, returningUsers };
        } catch (error) {
            console.error('[AggregationService] Error calculating DAU:', error);
            throw error;
        }
    }

    /**
     * Calculate Weekly Active Users (WAU) for a specific week
     */
    async calculateWAU(date = new Date()) {
        // Get start of week (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        try {
            const { data: activeUsers, error } = await this.supabase
                .from('analytics_events')
                .select('user_id')
                .gte('timestamp', weekStart.toISOString())
                .lte('timestamp', weekEnd.toISOString())
                .not('user_id', 'is', null);

            if (error) throw error;

            const uniqueUsers = [...new Set(activeUsers.map(u => u.user_id))];
            const userCount = uniqueUsers.length;

            // Upsert WAU record
            const { error: upsertError } = await this.supabase
                .from('weekly_active_users')
                .upsert({
                    week_start: weekStart.toISOString().split('T')[0],
                    week_end: weekEnd.toISOString().split('T')[0],
                    user_count: userCount
                }, {
                    onConflict: 'week_start'
                });

            if (upsertError) throw upsertError;

            console.log(`[AggregationService] WAU calculated for week starting ${weekStart.toISOString().split('T')[0]}: ${userCount} users`);
            
            return { weekStart, weekEnd, userCount };
        } catch (error) {
            console.error('[AggregationService] Error calculating WAU:', error);
            throw error;
        }
    }

    /**
     * Calculate Monthly Active Users (MAU) for a specific month
     */
    async calculateMAU(date = new Date()) {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        try {
            const { data: activeUsers, error } = await this.supabase
                .from('analytics_events')
                .select('user_id')
                .gte('timestamp', monthStart.toISOString())
                .lte('timestamp', monthEnd.toISOString())
                .not('user_id', 'is', null);

            if (error) throw error;

            const uniqueUsers = [...new Set(activeUsers.map(u => u.user_id))];
            const userCount = uniqueUsers.length;

            // Upsert MAU record
            const { error: upsertError } = await this.supabase
                .from('monthly_active_users')
                .upsert({
                    month: monthStart.toISOString().split('T')[0],
                    user_count: userCount
                }, {
                    onConflict: 'month'
                });

            if (upsertError) throw upsertError;

            console.log(`[AggregationService] MAU calculated for ${monthStart.toISOString().split('T')[0]}: ${userCount} users`);
            
            return { month: monthStart, userCount };
        } catch (error) {
            console.error('[AggregationService] Error calculating MAU:', error);
            throw error;
        }
    }

    /**
     * Calculate retention cohorts
     */
    async calculateRetentionCohort(cohortDate, periodType = 'day') {
        const cohortDateStr = cohortDate.toISOString().split('T')[0];
        
        try {
            // Get cohort users (users who first appeared on cohort date)
            const { data: cohortUsers } = await this.supabase.rpc('execute_sql', {
                query: `
                SELECT DISTINCT user_id
                FROM analytics_events
                WHERE DATE(timestamp) = '${cohortDateStr}'
                AND user_id NOT IN (
                    SELECT DISTINCT user_id 
                    FROM analytics_events 
                    WHERE DATE(timestamp) < '${cohortDateStr}'
                    AND user_id IS NOT NULL
                )
                AND user_id IS NOT NULL
                `
            });

            const cohortUserIds = cohortUsers?.map(u => u.user_id) || [];
            const cohortSize = cohortUserIds.length;

            if (cohortSize === 0) {
                console.log(`[AggregationService] No new users in cohort ${cohortDateStr}`);
                return;
            }

            // Calculate retention for different periods
            const periods = periodType === 'day' ? [1, 3, 7, 14, 30] : [1, 2, 4, 8, 12];
            
            for (const period of periods) {
                const targetDate = new Date(cohortDate);
                if (periodType === 'day') {
                    targetDate.setDate(targetDate.getDate() + period);
                } else if (periodType === 'week') {
                    targetDate.setDate(targetDate.getDate() + (period * 7));
                } else if (periodType === 'month') {
                    targetDate.setMonth(targetDate.getMonth() + period);
                }

                // Skip future dates
                if (targetDate > new Date()) continue;

                const targetDateStr = targetDate.toISOString().split('T')[0];
                
                // Get retained users
                const { data: retainedData } = await this.supabase
                    .from('analytics_events')
                    .select('user_id')
                    .in('user_id', cohortUserIds)
                    .gte('timestamp', `${targetDateStr}T00:00:00Z`)
                    .lt('timestamp', `${targetDateStr}T23:59:59Z`);

                const retainedUsers = [...new Set(retainedData?.map(u => u.user_id) || [])].length;
                const retentionRate = (retainedUsers / cohortSize) * 100;

                // Upsert retention record
                await this.supabase
                    .from('retention_cohorts')
                    .upsert({
                        cohort_date: cohortDateStr,
                        period_type: periodType,
                        period_number: period,
                        cohort_size: cohortSize,
                        retained_users: retainedUsers,
                        retention_rate: parseFloat(retentionRate.toFixed(2))
                    });
            }

            console.log(`[AggregationService] Retention calculated for cohort ${cohortDateStr}: ${cohortSize} users`);
            
        } catch (error) {
            console.error('[AggregationService] Error calculating retention:', error);
            throw error;
        }
    }

    /**
     * Create time series rollups for various metrics
     */
    async createTimeSeriesRollup(metricName, periodType = 'hour') {
        try {
            const now = new Date();
            let startTime, endTime, truncateFormat;

            switch (periodType) {
                case 'hour':
                    startTime = new Date(now.setMinutes(0, 0, 0));
                    endTime = new Date(startTime);
                    endTime.setHours(endTime.getHours() + 1);
                    truncateFormat = 'hour';
                    break;
                case 'day':
                    startTime = new Date(now.setHours(0, 0, 0, 0));
                    endTime = new Date(startTime);
                    endTime.setDate(endTime.getDate() + 1);
                    truncateFormat = 'day';
                    break;
                case 'week':
                    startTime = new Date(now);
                    startTime.setDate(startTime.getDate() - startTime.getDay());
                    startTime.setHours(0, 0, 0, 0);
                    endTime = new Date(startTime);
                    endTime.setDate(endTime.getDate() + 7);
                    truncateFormat = 'week';
                    break;
                case 'month':
                    startTime = new Date(now.getFullYear(), now.getMonth(), 1);
                    endTime = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    truncateFormat = 'month';
                    break;
            }

            // Calculate metric based on name
            let value = 0;
            let dimensions = {};

            switch (metricName) {
                case 'total_events':
                    const { count: eventCount } = await this.supabase
                        .from('analytics_events')
                        .select('*', { count: 'exact', head: true })
                        .gte('timestamp', startTime.toISOString())
                        .lt('timestamp', endTime.toISOString());
                    value = eventCount || 0;
                    break;

                case 'unique_users':
                    const { data: users } = await this.supabase
                        .from('analytics_events')
                        .select('user_id')
                        .gte('timestamp', startTime.toISOString())
                        .lt('timestamp', endTime.toISOString())
                        .not('user_id', 'is', null);
                    value = [...new Set(users?.map(u => u.user_id) || [])].length;
                    break;

                case 'avg_session_duration':
                    const { data: sessionData } = await this.supabase.rpc('execute_sql', {
                        query: `
                        SELECT AVG(duration_minutes) as avg_duration
                        FROM (
                            SELECT 
                                user_id,
                                DATE_TRUNC('${truncateFormat}', timestamp) as session_period,
                                EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 60 as duration_minutes
                            FROM analytics_events
                            WHERE timestamp >= '${startTime.toISOString()}'
                            AND timestamp < '${endTime.toISOString()}'
                            AND user_id IS NOT NULL
                            GROUP BY user_id, session_period
                            HAVING COUNT(*) > 1
                        ) as sessions
                        `
                    });
                    value = parseFloat(sessionData?.[0]?.avg_duration || 0);
                    break;

                case 'events_by_category':
                    const { data: categoryData } = await this.supabase
                        .from('analytics_events')
                        .select('category')
                        .gte('timestamp', startTime.toISOString())
                        .lt('timestamp', endTime.toISOString());
                    
                    const categoryCounts = categoryData?.reduce((acc, { category }) => {
                        acc[category || 'uncategorized'] = (acc[category || 'uncategorized'] || 0) + 1;
                        return acc;
                    }, {});
                    
                    dimensions = categoryCounts || {};
                    value = Object.values(dimensions).reduce((sum, count) => sum + count, 0);
                    break;
            }

            // Insert time series record
            const { error } = await this.supabase
                .from('time_series_metrics')
                .insert({
                    metric_name: metricName,
                    timestamp: startTime.toISOString(),
                    period_type: periodType,
                    value: value,
                    dimensions: dimensions
                });

            if (error) throw error;

            console.log(`[AggregationService] Time series rollup created for ${metricName} (${periodType}): ${value}`);
            
            return { metricName, periodType, timestamp: startTime, value, dimensions };
        } catch (error) {
            console.error('[AggregationService] Error creating time series rollup:', error);
            throw error;
        }
    }

    /**
     * Run all aggregations for a specific date
     */
    async runDailyAggregations(date = new Date()) {
        console.log('[AggregationService] Running daily aggregations...');
        
        try {
            // Calculate DAU
            await this.calculateDAU(date);
            
            // Calculate WAU (if it's Monday)
            if (date.getDay() === 1) {
                await this.calculateWAU(date);
            }
            
            // Calculate MAU (if it's the first of the month)
            if (date.getDate() === 1) {
                await this.calculateMAU(date);
            }
            
            // Calculate retention for yesterday's cohort
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            await this.calculateRetentionCohort(yesterday, 'day');
            
            // Create time series rollups
            await this.createTimeSeriesRollup('total_events', 'day');
            await this.createTimeSeriesRollup('unique_users', 'day');
            await this.createTimeSeriesRollup('avg_session_duration', 'day');
            await this.createTimeSeriesRollup('events_by_category', 'day');
            
            console.log('[AggregationService] Daily aggregations completed successfully');
        } catch (error) {
            console.error('[AggregationService] Error running daily aggregations:', error);
            throw error;
        }
    }

    /**
     * Get aggregated metrics for dashboard
     */
    async getAggregatedMetrics(timeRange = '7d') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
        }

        try {
            // Get DAU/WAU/MAU trends
            const { data: dauData } = await this.supabase
                .from('daily_active_users')
                .select('*')
                .gte('date', startDate.toISOString().split('T')[0])
                .order('date', { ascending: true });

            const { data: wauData } = await this.supabase
                .from('weekly_active_users')
                .select('*')
                .gte('week_start', startDate.toISOString().split('T')[0])
                .order('week_start', { ascending: true });

            const { data: mauData } = await this.supabase
                .from('monthly_active_users')
                .select('*')
                .gte('month', startDate.toISOString().split('T')[0])
                .order('month', { ascending: true });

            // Get latest retention cohort
            const { data: retentionData } = await this.supabase
                .from('retention_cohorts')
                .select('*')
                .eq('period_type', 'day')
                .order('cohort_date', { ascending: false })
                .limit(1);

            // Get time series metrics
            const { data: timeSeriesData } = await this.supabase
                .from('time_series_metrics')
                .select('*')
                .gte('timestamp', startDate.toISOString())
                .order('timestamp', { ascending: true });

            return {
                dau: dauData || [],
                wau: wauData || [],
                mau: mauData || [],
                retention: retentionData?.[0] || null,
                timeSeries: timeSeriesData || []
            };
        } catch (error) {
            console.error('[AggregationService] Error getting aggregated metrics:', error);
            throw error;
        }
    }
}

module.exports = AggregationService;