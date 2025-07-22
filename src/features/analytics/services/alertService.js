/**
 * Analytics Alert Service
 * Handles alert rule evaluation, notifications, and alert history
 */

const EventEmitter = require('events');

class AlertService extends EventEmitter {
    constructor(supabase) {
        super();
        this.supabase = supabase;
        this.alertRules = new Map();
        this.activeAlerts = new Map();
        this.checkInterval = null;
        this.isRunning = false;
    }

    async initialize() {
        console.log('[AlertService] Initializing...');
        
        // Create alert tables if they don't exist
        // Note: Tables should be created via migrations, not runtime
        // await this.createAlertTables();
        
        // Load alert rules from database
        await this.loadAlertRules();
        
        console.log('[AlertService] Initialized successfully');
    }

    async createAlertTables() {
        // Create alert rules table
        await this.supabase.rpc('execute_sql', {
            query: `
            CREATE TABLE IF NOT EXISTS alert_rules (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'anomaly', 'pattern'
                metric VARCHAR(100) NOT NULL,
                condition VARCHAR(20) NOT NULL, -- 'gt', 'lt', 'eq', 'ne', 'gte', 'lte'
                threshold DECIMAL(20,4),
                time_window_minutes INTEGER DEFAULT 5,
                severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
                enabled BOOLEAN DEFAULT true,
                notification_channels JSONB DEFAULT '[]',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);
            CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON alert_rules(metric);
            `
        });

        // Create alert history table
        await this.supabase.rpc('execute_sql', {
            query: `
            CREATE TABLE IF NOT EXISTS alert_history (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
                alert_key VARCHAR(255) NOT NULL,
                metric VARCHAR(100) NOT NULL,
                current_value DECIMAL(20,4),
                threshold_value DECIMAL(20,4),
                severity VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
                triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                acknowledged_at TIMESTAMP WITH TIME ZONE,
                resolved_at TIMESTAMP WITH TIME ZONE,
                notification_sent BOOLEAN DEFAULT false,
                notification_details JSONB DEFAULT '{}',
                metadata JSONB DEFAULT '{}'
            );
            
            CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
            CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at DESC);
            CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(rule_id);
            `
        });

        console.log('[AlertService] Alert tables created successfully');
    }

    async loadAlertRules() {
        try {
            const { data: rules, error } = await this.supabase
                .from('alert_rules')
                .select('*')
                .eq('enabled', true);

            if (error) throw error;

            // Clear and reload rules
            this.alertRules.clear();
            
            rules?.forEach(rule => {
                this.alertRules.set(rule.id, rule);
            });

            console.log(`[AlertService] Loaded ${this.alertRules.size} alert rules`);
        } catch (error) {
            console.error('[AlertService] Error loading alert rules:', error);
        }
    }

    /**
     * Create a new alert rule
     */
    async createAlertRule(rule) {
        const {
            name,
            description = '',
            ruleType = 'threshold',
            metric,
            condition,
            threshold,
            timeWindowMinutes = 5,
            severity = 'medium',
            notificationChannels = [],
            metadata = {}
        } = rule;

        try {
            const { data, error } = await this.supabase
                .from('alert_rules')
                .insert({
                    name,
                    description,
                    rule_type: ruleType,
                    metric,
                    condition,
                    threshold,
                    time_window_minutes: timeWindowMinutes,
                    severity,
                    notification_channels: notificationChannels,
                    metadata
                })
                .select()
                .single();

            if (error) throw error;

            // Add to active rules
            this.alertRules.set(data.id, data);

            console.log(`[AlertService] Alert rule created: ${name}`);
            return data;

        } catch (error) {
            console.error('[AlertService] Error creating alert rule:', error);
            throw error;
        }
    }

    /**
     * Start monitoring for alerts
     */
    start() {
        if (this.isRunning) {
            console.log('[AlertService] Already running');
            return;
        }

        console.log('[AlertService] Starting alert monitoring...');
        
        // Check alerts every minute
        this.checkInterval = setInterval(() => {
            this.checkAlerts();
        }, 60000); // 1 minute

        // Run initial check
        this.checkAlerts();
        
        this.isRunning = true;
        console.log('[AlertService] Alert monitoring started');
    }

    /**
     * Stop monitoring for alerts
     */
    stop() {
        if (!this.isRunning) return;

        console.log('[AlertService] Stopping alert monitoring...');
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        this.isRunning = false;
        console.log('[AlertService] Alert monitoring stopped');
    }

    /**
     * Check all alert rules
     */
    async checkAlerts() {
        console.log('[AlertService] Checking alerts...');
        
        for (const [ruleId, rule] of this.alertRules) {
            try {
                await this.evaluateRule(rule);
            } catch (error) {
                console.error(`[AlertService] Error evaluating rule ${rule.name}:`, error);
            }
        }
    }

    /**
     * Evaluate a single alert rule
     */
    async evaluateRule(rule) {
        const value = await this.getMetricValue(rule.metric, rule.time_window_minutes);
        
        if (value === null) return;

        const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold);
        const alertKey = `${rule.id}_${rule.metric}`;

        if (shouldAlert) {
            if (!this.activeAlerts.has(alertKey)) {
                // New alert
                await this.triggerAlert(rule, value);
            }
        } else {
            if (this.activeAlerts.has(alertKey)) {
                // Alert resolved
                await this.resolveAlert(rule, alertKey);
            }
        }
    }

    /**
     * Get current metric value
     */
    async getMetricValue(metric, timeWindowMinutes) {
        const startTime = new Date();
        startTime.setMinutes(startTime.getMinutes() - timeWindowMinutes);

        try {
            switch (metric) {
                case 'error_rate':
                    return await this.calculateErrorRate(startTime);
                
                case 'response_time':
                    return await this.calculateAvgResponseTime(startTime);
                
                case 'active_users':
                    return await this.calculateActiveUsers(startTime);
                
                case 'queue_depth':
                    return await this.getQueueDepth();
                
                case 'events_per_minute':
                    return await this.calculateEventsPerMinute(startTime);
                
                case 'failed_logins':
                    return await this.calculateFailedLogins(startTime);
                
                default:
                    // Try to get from time series metrics
                    return await this.getTimeSeriesMetric(metric, startTime);
            }
        } catch (error) {
            console.error(`[AlertService] Error getting metric ${metric}:`, error);
            return null;
        }
    }

    /**
     * Evaluate alert condition
     */
    evaluateCondition(value, condition, threshold) {
        switch (condition) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'ne': return value !== threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    }

    /**
     * Trigger a new alert
     */
    async triggerAlert(rule, currentValue) {
        const alertKey = `${rule.id}_${rule.metric}`;
        
        console.log(`[AlertService] ALERT TRIGGERED: ${rule.name} (${currentValue} ${rule.condition} ${rule.threshold})`);
        
        try {
            // Record in database
            const { data: alert, error } = await this.supabase
                .from('alert_history')
                .insert({
                    rule_id: rule.id,
                    alert_key: alertKey,
                    metric: rule.metric,
                    current_value: currentValue,
                    threshold_value: rule.threshold,
                    severity: rule.severity,
                    status: 'active',
                    metadata: {
                        rule_name: rule.name,
                        condition: rule.condition
                    }
                })
                .select()
                .single();

            if (error) throw error;

            // Add to active alerts
            this.activeAlerts.set(alertKey, {
                alert,
                rule,
                triggeredAt: new Date()
            });

            // Send notifications
            await this.sendNotifications(rule, alert, currentValue);

            // Emit event
            this.emit('alert_triggered', {
                rule,
                alert,
                currentValue
            });

        } catch (error) {
            console.error('[AlertService] Error triggering alert:', error);
        }
    }

    /**
     * Resolve an active alert
     */
    async resolveAlert(rule, alertKey) {
        const activeAlert = this.activeAlerts.get(alertKey);
        if (!activeAlert) return;

        console.log(`[AlertService] Alert resolved: ${rule.name}`);

        try {
            // Update in database
            await this.supabase
                .from('alert_history')
                .update({
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                })
                .eq('id', activeAlert.alert.id);

            // Remove from active alerts
            this.activeAlerts.delete(alertKey);

            // Emit event
            this.emit('alert_resolved', {
                rule,
                alert: activeAlert.alert
            });

        } catch (error) {
            console.error('[AlertService] Error resolving alert:', error);
        }
    }

    /**
     * Send alert notifications
     */
    async sendNotifications(rule, alert, currentValue) {
        const channels = rule.notification_channels || [];
        
        for (const channel of channels) {
            try {
                switch (channel.type) {
                    case 'email':
                        await this.sendEmailNotification(channel, rule, alert, currentValue);
                        break;
                    
                    case 'webhook':
                        await this.sendWebhookNotification(channel, rule, alert, currentValue);
                        break;
                    
                    case 'slack':
                        await this.sendSlackNotification(channel, rule, alert, currentValue);
                        break;
                    
                    default:
                        console.warn(`[AlertService] Unknown notification channel: ${channel.type}`);
                }
            } catch (error) {
                console.error(`[AlertService] Error sending ${channel.type} notification:`, error);
            }
        }

        // Update notification status
        await this.supabase
            .from('alert_history')
            .update({
                notification_sent: true,
                notification_details: {
                    channels: channels.map(c => c.type),
                    sent_at: new Date().toISOString()
                }
            })
            .eq('id', alert.id);
    }

    /**
     * Send email notification (stub - implement with actual email service)
     */
    async sendEmailNotification(channel, rule, alert, currentValue) {
        console.log(`[AlertService] Sending email to ${channel.recipients}:`);
        console.log(`  Subject: Alert: ${rule.name}`);
        console.log(`  Body: ${rule.metric} is ${currentValue} (threshold: ${rule.threshold})`);
        
        // TODO: Implement actual email sending
        // Example: use SendGrid, AWS SES, etc.
    }

    /**
     * Send webhook notification
     */
    async sendWebhookNotification(channel, rule, alert, currentValue) {
        const payload = {
            alert_id: alert.id,
            rule_name: rule.name,
            metric: rule.metric,
            current_value: currentValue,
            threshold: rule.threshold,
            severity: rule.severity,
            triggered_at: alert.triggered_at,
            message: `Alert: ${rule.name} - ${rule.metric} is ${currentValue} (threshold: ${rule.threshold})`
        };

        console.log(`[AlertService] Sending webhook to ${channel.url}`);
        
        // TODO: Implement actual webhook sending
        // Example: use fetch or axios to POST to webhook URL
    }

    /**
     * Send Slack notification (stub - implement with Slack API)
     */
    async sendSlackNotification(channel, rule, alert, currentValue) {
        const message = {
            text: `🚨 Alert: ${rule.name}`,
            attachments: [{
                color: this.getSeverityColor(rule.severity),
                fields: [
                    {
                        title: 'Metric',
                        value: rule.metric,
                        short: true
                    },
                    {
                        title: 'Current Value',
                        value: currentValue.toString(),
                        short: true
                    },
                    {
                        title: 'Threshold',
                        value: `${rule.condition} ${rule.threshold}`,
                        short: true
                    },
                    {
                        title: 'Severity',
                        value: rule.severity.toUpperCase(),
                        short: true
                    }
                ],
                footer: 'Analytics Alert System',
                ts: Math.floor(Date.now() / 1000)
            }]
        };

        console.log(`[AlertService] Sending Slack message to ${channel.webhook_url}`);
        
        // TODO: Implement actual Slack sending
        // Example: POST to Slack webhook URL
    }

    // Metric calculation methods
    async calculateErrorRate(startTime) {
        const { data } = await this.supabase
            .from('analytics_events')
            .select('event_type')
            .gte('timestamp', startTime.toISOString())
            .in('event_type', ['error', 'api_error', 'exception']);
        
        const errorCount = data?.length || 0;
        
        const { count: totalCount } = await this.supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', startTime.toISOString());
        
        return totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
    }

    async calculateAvgResponseTime(startTime) {
        const { data } = await this.supabase
            .from('analytics_events')
            .select('metadata')
            .eq('event_type', 'api_request')
            .gte('timestamp', startTime.toISOString());
        
        if (!data || data.length === 0) return 0;
        
        const responseTimes = data
            .map(e => e.metadata?.response_time_ms)
            .filter(rt => rt !== undefined && rt !== null);
        
        if (responseTimes.length === 0) return 0;
        
        return responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    }

    async calculateActiveUsers(startTime) {
        const { data } = await this.supabase
            .from('analytics_events')
            .select('user_id')
            .gte('timestamp', startTime.toISOString())
            .not('user_id', 'is', null);
        
        return new Set(data?.map(e => e.user_id) || []).size;
    }

    async getQueueDepth() {
        const { data } = await this.supabase.rpc('pgmq_metrics', {
            p_queue_name: 'analytics_events'
        });
        
        return data?.[0]?.queue_length || 0;
    }

    async calculateEventsPerMinute(startTime) {
        const { count } = await this.supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', startTime.toISOString());
        
        const minutes = (Date.now() - startTime.getTime()) / 60000;
        return minutes > 0 ? Math.round(count / minutes) : 0;
    }

    async calculateFailedLogins(startTime) {
        const { count } = await this.supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'login_failed')
            .gte('timestamp', startTime.toISOString());
        
        return count || 0;
    }

    async getTimeSeriesMetric(metric, startTime) {
        const { data } = await this.supabase
            .from('time_series_metrics')
            .select('value')
            .eq('metric_name', metric)
            .gte('timestamp', startTime.toISOString())
            .order('timestamp', { ascending: false })
            .limit(1);
        
        return data?.[0]?.value || 0;
    }

    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return '#ff0000';
            case 'high': return '#ff9900';
            case 'medium': return '#ffcc00';
            case 'low': return '#00cc00';
            default: return '#cccccc';
        }
    }

    /**
     * Get active alerts
     */
    async getActiveAlerts() {
        const { data } = await this.supabase
            .from('alert_history')
            .select(`
                *,
                alert_rules (
                    name,
                    description,
                    metric,
                    condition,
                    threshold
                )
            `)
            .eq('status', 'active')
            .order('triggered_at', { ascending: false });
        
        return data || [];
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId) {
        const { error } = await this.supabase
            .from('alert_history')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString()
            })
            .eq('id', alertId);
        
        if (error) throw error;
        
        console.log(`[AlertService] Alert ${alertId} acknowledged`);
    }

    /**
     * Get alert statistics
     */
    async getAlertStatistics(timeRange = '7d') {
        const startDate = new Date();
        const days = timeRange === '1d' ? 1 : timeRange === '30d' ? 30 : 7;
        startDate.setDate(startDate.getDate() - days);

        const { data: alerts } = await this.supabase
            .from('alert_history')
            .select('severity, status')
            .gte('triggered_at', startDate.toISOString());

        const stats = {
            total: alerts?.length || 0,
            active: 0,
            acknowledged: 0,
            resolved: 0,
            bySeverity: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            }
        };

        alerts?.forEach(alert => {
            stats[alert.status]++;
            stats.bySeverity[alert.severity]++;
        });

        return stats;
    }
}

module.exports = AlertService;