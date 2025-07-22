/**
 * Aggregation Scheduler
 * Runs periodic aggregation jobs for analytics metrics
 */

const AggregationService = require('./aggregationService');
const RetentionService = require('./retentionService');

class AggregationScheduler {
    constructor(supabaseDatabase) {
        this.supabaseDatabase = supabaseDatabase;
        this.aggregationService = new AggregationService(supabaseDatabase.getClient());
        this.retentionService = new RetentionService(supabaseDatabase.getClient());
        this.intervals = {};
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) {
            console.log('[AggregationScheduler] Already running');
            return;
        }

        console.log('[AggregationScheduler] Starting...');
        
        // Initialize aggregation service
        await this.aggregationService.initialize();
        
        // Run initial aggregations
        await this.runInitialAggregations();
        
        // Schedule periodic aggregations
        this.scheduleAggregations();
        
        this.isRunning = true;
        console.log('[AggregationScheduler] Started successfully');
    }

    stop() {
        console.log('[AggregationScheduler] Stopping...');
        
        // Clear all intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        this.intervals = {};
        
        this.isRunning = false;
        console.log('[AggregationScheduler] Stopped');
    }

    async runInitialAggregations() {
        console.log('[AggregationScheduler] Running initial aggregations...');
        
        try {
            // Calculate aggregations for the last 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                await this.aggregationService.runDailyAggregations(date);
            }
            
            // Calculate initial retention cohorts
            console.log('[AggregationScheduler] Calculating retention cohorts...');
            await this.retentionService.updateRetentionCohorts();
            
            console.log('[AggregationScheduler] Initial aggregations completed');
        } catch (error) {
            console.error('[AggregationScheduler] Error running initial aggregations:', error);
        }
    }

    scheduleAggregations() {
        // Hourly aggregations (every hour on the hour)
        this.intervals.hourly = setInterval(async () => {
            try {
                console.log('[AggregationScheduler] Running hourly aggregations...');
                
                // Create hourly time series rollups
                await this.aggregationService.createTimeSeriesRollup('total_events', 'hour');
                await this.aggregationService.createTimeSeriesRollup('unique_users', 'hour');
                
                // Update current day's DAU
                await this.aggregationService.calculateDAU(new Date());
                
            } catch (error) {
                console.error('[AggregationScheduler] Error in hourly aggregation:', error);
            }
        }, 60 * 60 * 1000); // Every hour

        // Daily aggregations (at 2 AM)
        this.intervals.daily = setInterval(async () => {
            const now = new Date();
            if (now.getHours() === 2) {
                try {
                    console.log('[AggregationScheduler] Running daily aggregations...');
                    
                    // Run full daily aggregations for yesterday
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    await this.aggregationService.runDailyAggregations(yesterday);
                    
                } catch (error) {
                    console.error('[AggregationScheduler] Error in daily aggregation:', error);
                }
            }
        }, 60 * 60 * 1000); // Check every hour

        // Real-time DAU update (every 5 minutes)
        this.intervals.realtime = setInterval(async () => {
            try {
                // Update today's DAU
                await this.aggregationService.calculateDAU(new Date());
            } catch (error) {
                console.error('[AggregationScheduler] Error updating real-time DAU:', error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Run aggregations for a specific date range (for backfilling)
     */
    async backfillAggregations(startDate, endDate) {
        console.log(`[AggregationScheduler] Backfilling aggregations from ${startDate} to ${endDate}`);
        
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            try {
                await this.aggregationService.runDailyAggregations(new Date(current));
                current.setDate(current.getDate() + 1);
            } catch (error) {
                console.error(`[AggregationScheduler] Error backfilling ${current.toISOString()}:`, error);
            }
        }
        
        console.log('[AggregationScheduler] Backfill completed');
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            scheduledJobs: Object.keys(this.intervals),
            nextHourlyRun: new Date(Math.ceil(Date.now() / 3600000) * 3600000),
            nextDailyRun: (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(2, 0, 0, 0);
                return tomorrow;
            })()
        };
    }
}

module.exports = AggregationScheduler;