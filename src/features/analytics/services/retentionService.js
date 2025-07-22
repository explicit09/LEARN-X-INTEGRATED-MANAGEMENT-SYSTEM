/**
 * Retention Service
 * Calculates user retention cohorts from actual user activity
 */

class RetentionService {
    constructor(supabase) {
        this.supabase = supabase;
    }

    /**
     * Calculate retention cohorts for a given period
     * @param {number} lookbackDays - Number of days to look back for cohorts
     * @param {number} cohortSize - Size of each cohort in days (default: 7 for weekly)
     */
    async calculateRetentionCohorts(lookbackDays = 90, cohortSize = 7) {
        console.log('[RetentionService] Calculating retention cohorts...');
        
        const cohorts = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate cohorts
        for (let i = 0; i < Math.floor(lookbackDays / cohortSize); i++) {
            const cohortStart = new Date(today);
            cohortStart.setDate(cohortStart.getDate() - (i + 1) * cohortSize);
            
            const cohortEnd = new Date(cohortStart);
            cohortEnd.setDate(cohortEnd.getDate() + cohortSize - 1);
            
            const cohort = await this.calculateSingleCohort(cohortStart, cohortEnd);
            if (cohort && cohort.total_users > 0) {
                cohorts.push(cohort);
            }
        }
        
        return cohorts;
    }

    /**
     * Calculate retention for a single cohort
     */
    async calculateSingleCohort(cohortStart, cohortEnd) {
        try {
            // Get users who were new during the cohort period
            const { data: cohortUsers, error } = await this.supabase
                .from('analytics_events')
                .select('user_id, timestamp')
                .gte('timestamp', cohortStart.toISOString())
                .lte('timestamp', cohortEnd.toISOString())
                .not('user_id', 'is', null)
                .neq('event_type', 'test_analytics_event')
                .neq('event_type', 'test_event');
            
            if (error) throw error;
            
            // Group by user to find their first activity date
            const userFirstActivity = {};
            cohortUsers.forEach(event => {
                if (!userFirstActivity[event.user_id] || event.timestamp < userFirstActivity[event.user_id]) {
                    userFirstActivity[event.user_id] = event.timestamp;
                }
            });
            
            // Filter to only new users (first activity in this cohort period)
            const newUserIds = [];
            for (const [userId, firstActivity] of Object.entries(userFirstActivity)) {
                // Check if user had any activity before cohort start
                const { data: previousActivity } = await this.supabase
                    .from('analytics_events')
                    .select('user_id')
                    .eq('user_id', userId)
                    .lt('timestamp', cohortStart.toISOString())
                    .limit(1);
                
                if (!previousActivity || previousActivity.length === 0) {
                    newUserIds.push(userId);
                }
            }
            
            if (newUserIds.length === 0) {
                return null;
            }
            
            // Calculate retention for standard periods
            const retentionPeriods = [0, 1, 7, 14, 30, 60, 90];
            const retentionData = {};
            
            for (const days of retentionPeriods) {
                const checkStart = new Date(cohortStart);
                checkStart.setDate(checkStart.getDate() + days);
                const checkEnd = new Date(checkStart);
                checkEnd.setHours(23, 59, 59, 999);
                
                // Count how many cohort users were active on this day
                const { data: activeUsers } = await this.supabase
                    .from('analytics_events')
                    .select('user_id')
                    .in('user_id', newUserIds)
                    .gte('timestamp', checkStart.toISOString())
                    .lte('timestamp', checkEnd.toISOString());
                
                const activeUserIds = new Set(activeUsers?.map(u => u.user_id) || []);
                retentionData[`day_${days}`] = activeUserIds.size;
            }
            
            return {
                cohort_date: cohortStart.toISOString().split('T')[0],
                total_users: newUserIds.length,
                retention_data: retentionData
            };
            
        } catch (error) {
            console.error('[RetentionService] Error calculating cohort:', error);
            return null;
        }
    }

    /**
     * Update retention cohorts in the database
     */
    async updateRetentionCohorts() {
        try {
            const cohorts = await this.calculateRetentionCohorts();
            
            // Upsert cohorts
            for (const cohort of cohorts) {
                await this.supabase
                    .from('user_retention_cohorts')
                    .upsert(cohort, { onConflict: 'cohort_date' });
            }
            
            console.log(`[RetentionService] Updated ${cohorts.length} retention cohorts`);
            return cohorts;
            
        } catch (error) {
            console.error('[RetentionService] Error updating retention cohorts:', error);
            throw error;
        }
    }
}

module.exports = RetentionService;