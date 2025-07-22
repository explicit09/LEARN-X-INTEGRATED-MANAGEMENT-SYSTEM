const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');

class PGMQConsumer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Configuration
        this.config = {
            queueName: config.queueName || 'analytics_events',
            batchSize: config.batchSize || 10,
            visibilityTimeout: config.visibilityTimeout || 30,
            pollInterval: config.pollInterval || 5000,
            maxRetries: config.maxRetries || 3,
            ...config
        };
        
        // LIMS Supabase connection for both reading queue and writing to DB
        // LEARN-X sends events TO our queue, so we read from our own PGMQ
        this.limsUrl = process.env.SUPABASE_URL;
        this.limsKey = process.env.SUPABASE_SERVICE_KEY;
        
        // Initialize client
        this.limsSupabase = null;
        
        // Processing state
        this.isRunning = false;
        this.processingTimer = null;
        this.stats = {
            eventsProcessed: 0,
            errors: 0,
            lastProcessedAt: null,
            queueDepth: 0,
            isRunning: false,
            eventsPerMinute: 0
        };
        
        // Event rate tracking
        this.eventTimestamps = [];
    }

    async connect() {
        try {
            if (!this.limsUrl || !this.limsKey) {
                throw new Error('LIMS Supabase credentials not configured');
            }
            
            // Create LIMS client for both reading queue and writing to database
            // LEARN-X sends events to our PGMQ, so we only need one client
            this.limsSupabase = createClient(this.limsUrl, this.limsKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
            
            // Test connections
            await this.testConnection();
            
            console.log('[PGMQConsumer] Connected successfully');
            return true;
        } catch (error) {
            console.error('[PGMQConsumer] Connection failed:', error);
            return false;
        }
    }

    async testConnection() {
        // Test LIMS connection and queue
        const { data: queueMetrics, error: queueError } = await this.limsSupabase.rpc('pgmq_metrics', {
            p_queue_name: this.config.queueName
        });
        
        if (queueError) {
            throw new Error(`Queue connection test failed: ${queueError.message}`);
        }
        
        this.stats.queueDepth = queueMetrics?.queue_length || 0;
        console.log(`[PGMQConsumer] Queue depth: ${this.stats.queueDepth}`);
        
        // Test analytics_events table access
        const { error: tableError } = await this.limsSupabase
            .from('analytics_events')
            .select('count')
            .limit(1);
        
        if (tableError) {
            throw new Error(`Analytics table test failed: ${tableError.message}`);
        }
        
        console.log('[PGMQConsumer] Connection tests passed');
    }

    async start() {
        if (this.isRunning) {
            console.log('[PGMQConsumer] Already running');
            return;
        }
        
        if (!this.limsSupabase) {
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to database');
            }
        }
        
        this.isRunning = true;
        this.stats.isRunning = true;
        console.log('[PGMQConsumer] Starting consumer...');
        
        // Start processing loop
        this.processMessages();
    }

    async stop() {
        console.log('[PGMQConsumer] Stopping consumer...');
        this.isRunning = false;
        this.stats.isRunning = false;
        
        if (this.processingTimer) {
            clearTimeout(this.processingTimer);
            this.processingTimer = null;
        }
        
        console.log('[PGMQConsumer] Stopped');
    }

    async processMessages() {
        if (!this.isRunning) return;
        
        try {
            // Read messages from LIMS queue (where LEARN-X sends events)
            const { data: messages, error } = await this.limsSupabase.rpc('pgmq_read', {
                p_queue_name: this.config.queueName,
                p_vt: this.config.visibilityTimeout,
                p_qty: this.config.batchSize
            });
            
            if (error) {
                console.error('[PGMQConsumer] Error reading from queue:', error);
                this.stats.errors++;
                this.emit('error', error);
            } else if (messages && messages.length > 0) {
                console.log(`[PGMQConsumer] Processing ${messages.length} messages`);
                
                for (const message of messages) {
                    try {
                        await this.processEvent(message.message);
                        
                        // Delete message from queue after successful processing
                        await this.limsSupabase.rpc('pgmq_delete', {
                            queue_name: this.config.queueName,
                            msg_id: message.msg_id
                        });
                        
                        this.stats.eventsProcessed++;
                        this.stats.lastProcessedAt = new Date();
                        this.trackEventRate();
                        
                        this.emit('event_processed', message.message);
                    } catch (error) {
                        console.error('[PGMQConsumer] Error processing message:', error);
                        this.stats.errors++;
                        
                        // Handle retry logic
                        const retryCount = message.read_ct || 0;
                        if (retryCount >= this.config.maxRetries) {
                            console.error('[PGMQConsumer] Max retries exceeded, archiving message');
                            await this.archiveFailedMessage(message);
                        }
                    }
                }
                
                // Update queue metrics
                await this.updateQueueMetrics();
            }
        } catch (error) {
            console.error('[PGMQConsumer] Error in processing loop:', error);
            this.stats.errors++;
            this.emit('error', error);
        }
        
        // Schedule next poll
        this.processingTimer = setTimeout(() => {
            this.processMessages();
        }, this.config.pollInterval);
    }

    async processEvent(event) {
        // Validate event
        if (!event || !event.event_type) {
            throw new Error('Invalid event: missing event_type');
        }
        
        // Handle nested data structure from LEARN-X
        const eventData = event.data || event;
        
        // Extract data from various possible locations
        const data = event.data || eventData || {};
        
        // Transform event for storage matching Glass LIMS schema
        const transformedEvent = {
            event_id: event.event_id || data.event_id || `${event.event_type}_${Date.now()}`,
            event_type: event.event_type,
            user_id: event.user_id || data.user_id || null,
            session_id: event.session_id || data.session_id || null,
            timestamp: event.timestamp || data.timestamp || new Date().toISOString(),
            
            // Store full raw data for flexibility
            raw_data: {
                ...event,
                event_category: this.categorizeEvent(event.event_type),
                properties: data.properties || {},
                context: data.context || {},
                // Extract commonly used fields for easier querying
                lesson_id: data.lesson_id || data.properties?.lesson_id || null,
                lesson_title: data.lesson_title || data.properties?.lesson_title || null,
                file_name: data.file_name || data.properties?.file_name || null,
                voice_id: data.voice_id || data.properties?.voice_id || null,
                canvas_course_id: data.canvas_course_id || data.properties?.canvas_course_id || null,
                duration_seconds: data.duration_seconds || data.properties?.duration || null,
                cost_usd: data.cost_usd || data.properties?.cost || null,
                tokens_used: data.tokens_used || data.properties?.tokens || null,
                error_message: data.error_message || data.properties?.error_message || null,
            },
            
            // Fields matching Glass LIMS schema
            service: 'learn-x',
            processed: false,
            processed_at: null,
            
            // Common fields for direct querying
            user_tier: data.user_tier || data.properties?.user_tier || null,
            user_created_at: data.user_created_at || data.properties?.user_created_at || null,
            lesson_id: data.lesson_id || data.properties?.lesson_id || null,
            lesson_title: data.lesson_title || data.properties?.lesson_title || null,
            file_name: data.file_name || data.properties?.file_name || null,
            file_size: data.file_size || data.properties?.file_size || null,
            file_type: data.file_type || data.properties?.file_type || null,
            processing_time_seconds: data.processing_time_seconds || data.properties?.processing_time_seconds || null,
            response_time_ms: data.response_time_ms || data.properties?.response_time_ms || null
        };
        
        // Store in LIMS analytics_events table
        const { error } = await this.limsSupabase
            .from('analytics_events')
            .upsert(transformedEvent, {
                onConflict: 'event_id'
            });
        
        if (error) {
            throw new Error(`Failed to store event: ${error.message}`);
        }
        
        // Mark as processed
        await this.limsSupabase
            .from('analytics_events')
            .update({ 
                processed: true, 
                processed_at: new Date().toISOString() 
            })
            .eq('event_id', transformedEvent.event_id);
        
        // Trigger aggregation updates
        await this.triggerAggregations(transformedEvent);
        
        // Check for alerts
        await this.checkAlerts(transformedEvent);
    }

    categorizeEvent(eventType) {
        const categories = {
            // User Lifecycle
            'user_registered': 'user_lifecycle',
            'user_registration': 'user_lifecycle', // Glass alternative
            'user_logged_in': 'user_lifecycle',
            'user_login': 'user_lifecycle', // LEARN-X uses USER_LOGIN
            'user_logged_out': 'user_lifecycle',
            'user_logout': 'user_lifecycle', // LEARN-X uses USER_LOGOUT
            'session_started': 'user_lifecycle',
            'session_ended': 'user_lifecycle',
            'email_verified': 'user_lifecycle',
            
            // Learning Engagement
            'lesson_generated': 'learning_engagement',
            'lesson_started': 'learning_engagement',
            'lesson_completed': 'learning_engagement',
            'lesson_progress': 'learning_engagement',
            'lesson_progress_updated': 'learning_engagement',
            'lesson_abandoned': 'learning_engagement',
            'session_viewed': 'learning_engagement',
            
            // Document Processing
            'document_uploaded': 'document_processing',
            'document_processed': 'document_processing',
            'document_deleted': 'document_processing',
            'processing_started': 'document_processing',
            'document_processing_started': 'document_processing', // Glass alternative
            'topic_analysis_completed': 'document_processing',
            'lesson_generation_started': 'document_processing',
            'processing_completed': 'document_processing',
            'processing_failed': 'document_processing',
            'file_processing_error': 'document_processing',
            
            // Interactive Features
            'highlight_created': 'interactive_features',
            'text_highlighted': 'interactive_features', // LEARN-X name
            'note_created': 'interactive_features',
            'note_updated': 'interactive_features',
            'note_deleted': 'interactive_features',
            'chat_message_sent': 'interactive_features',
            'chat_response_received': 'interactive_features',
            'ai_suggestion_clicked': 'interactive_features',
            'ai_suggestion_accepted': 'interactive_features',
            'ai_suggestion_displayed': 'interactive_features',
            'ai_suggestion_used': 'interactive_features',
            
            // Voice & Audio
            'voice_generated': 'voice_audio',
            'voice_played': 'voice_audio',
            'voice_playback_paused': 'voice_audio',
            'voice_quota_exceeded': 'voice_audio',
            'voice_cache_hit': 'voice_audio',
            'voice_generation_failed': 'voice_audio',
            
            // Canvas Integration
            'canvas_sync_started': 'canvas_integration',
            'canvas_sync_completed': 'canvas_integration',
            'canvas_sync_failed': 'canvas_integration',
            'canvas_course_imported': 'canvas_integration',
            'canvas_assignment_imported': 'canvas_integration',
            'canvas_import_completed': 'canvas_integration', // Glass alternative
            
            // Quiz & Assessment
            'quiz_started': 'quiz_assessment',
            'quiz_question_answered': 'quiz_assessment',
            'quiz_completed': 'quiz_assessment',
            'quiz_abandoned': 'quiz_assessment',
            'quiz_performance_calculated': 'quiz_assessment',
            
            // Onboarding
            'onboarding_started': 'onboarding',
            'onboarding_step_completed': 'onboarding',
            'onboarding_completed': 'onboarding',
            'onboarding_skipped': 'onboarding',
            'persona_created': 'onboarding',
            'persona_updated': 'onboarding',
            'feature_discovered': 'onboarding',
            'feature_used': 'onboarding',
            
            // Feedback & Rating
            'feedback_submitted': 'feedback_rating',
            'lesson_rated': 'feedback_rating',
            'lesson_rating_displayed': 'feedback_rating',
            'content_quality_rating': 'feedback_rating',
            'feedback_skipped': 'feedback_rating',
            'user_reported_issue': 'feedback_rating',
            'nps_survey_completed': 'feedback_rating',
            
            // Landing Page Events
            'landing_page_viewed': 'landing_page',
            'page_view': 'landing_page', // Glass alternative
            'landing_section_viewed': 'landing_page',
            'section_view': 'landing_page', // Glass alternative
            'landing_button_clicked': 'landing_page',
            'button_click': 'landing_page', // Glass alternative
            'landing_video_interaction': 'landing_page',
            'landing_scroll_depth': 'landing_page',
            'scroll_depth': 'landing_page', // Glass alternative
            'page_viewed': 'landing_page',
            
            // System Performance
            'api_request': 'system_performance',
            'api_error': 'system_performance',
            'database_query': 'system_performance',
            'database_error': 'system_performance',
            'ai_request': 'system_performance',
            'llm_response_received': 'system_performance',
            'llm_request_failed': 'system_performance',
            'vector_search': 'system_performance',
            'embedding_generation': 'system_performance',
            'slow_response_detected': 'system_performance',
            'processing_timeout': 'system_performance',
            'health_check_failed': 'system_performance',
            'system_health_report': 'system_performance',
            
            // Business Intelligence
            'user_retention': 'business_intelligence',
            'feature_adoption': 'business_intelligence',
            'dau_calculated': 'business_intelligence',
            'mau_calculated': 'business_intelligence',
            'retention_calculated': 'business_intelligence',
            'completion_rate_calculated': 'business_intelligence',
            'time_to_complete_calculated': 'business_intelligence',
            'learning_progress_calculated': 'business_intelligence',
            'churn_analysis_completed': 'business_intelligence',
            'user_churn_risk_high': 'business_intelligence',
            'low_engagement_detected': 'business_intelligence',
            
            // Subscription & Payment
            'subscription_created': 'subscription_payment',
            'subscription_upgraded': 'subscription_payment',
            'subscription_downgraded': 'subscription_payment',
            'subscription_cancelled': 'subscription_payment',
            'payment_processed': 'subscription_payment',
            'payment_failed': 'subscription_payment',
            
            // Critical Alerts
            'processing_pipeline_failure': 'critical_alerts',
            'ai_service_unavailable': 'critical_alerts',
            'authentication_failure_spike': 'critical_alerts',
            'database_connection_lost': 'critical_alerts',
            'storage_capacity_warning': 'critical_alerts',
            'high_error_rate': 'critical_alerts',
            'queue_backlog_growing': 'critical_alerts',
            'cost_threshold_exceeded': 'critical_alerts'
        };
        
        // Handle both uppercase and lowercase event names
        const normalizedEventType = eventType.toLowerCase();
        return categories[normalizedEventType] || categories[eventType] || 'other';
    }

    async triggerAggregations(event) {
        try {
            // Update feature adoption
            if (this.isFeatureAdoptionEvent(event.event_type)) {
                await this.updateFeatureAdoption(event);
            }
            
            // Update metrics
            await this.updateMetrics(event);
            
            this.emit('metrics_updated', {
                event_type: event.event_type,
                user_id: event.user_id
            });
        } catch (error) {
            console.error('[PGMQConsumer] Error updating aggregations:', error);
        }
    }

    isFeatureAdoptionEvent(eventType) {
        const adoptionEvents = [
            // Document features
            'document_uploaded',
            'document_processed',
            'processing_started',
            
            // Lesson features
            'lesson_generated',
            'lesson_started',
            'lesson_generation_started',
            
            // Voice features
            'voice_generated',
            'voice_played',
            
            // Canvas features
            'canvas_sync_started',
            'canvas_sync_completed',
            'canvas_course_imported',
            
            // Interactive features
            'highlight_created',
            'text_highlighted',
            'note_created',
            'note_updated',
            
            // Chat features
            'chat_message_sent',
            'chat_response_received',
            
            // Quiz features
            'quiz_started',
            'quiz_completed',
            
            // AI features
            'ai_suggestion_clicked',
            'ai_suggestion_used',
            
            // Onboarding
            'onboarding_started',
            'persona_created'
        ];
        
        // Handle case variations
        const normalizedEventType = eventType.toLowerCase();
        return adoptionEvents.includes(normalizedEventType) || adoptionEvents.includes(eventType);
    }

    async updateFeatureAdoption(event) {
        const featureMap = {
            // Document features
            'document_uploaded': 'first_document_date',
            'document_processed': 'first_document_date',
            'processing_started': 'first_document_date',
            
            // Lesson features
            'lesson_generated': 'first_lesson_date',
            'lesson_started': 'first_lesson_date',
            'lesson_generation_started': 'first_lesson_date',
            
            // Voice features
            'voice_generated': 'first_voice_date',
            'voice_played': 'first_voice_date',
            
            // Canvas features
            'canvas_sync_started': 'first_canvas_sync_date',
            'canvas_sync_completed': 'first_canvas_sync_date',
            'canvas_course_imported': 'first_canvas_sync_date',
            
            // Interactive features - highlights
            'highlight_created': 'first_highlight_date',
            'text_highlighted': 'first_highlight_date',
            
            // Interactive features - notes
            'note_created': 'first_note_date',
            'note_updated': 'first_note_date',
            
            // Chat features
            'chat_message_sent': 'first_chat_date',
            'chat_response_received': 'first_chat_date',
            
            // Quiz features
            'quiz_started': 'first_quiz_date',
            'quiz_completed': 'first_quiz_date',
            
            // AI features
            'ai_suggestion_clicked': 'first_chat_date', // Group with chat
            'ai_suggestion_used': 'first_chat_date',
            
            // Onboarding
            'onboarding_started': 'first_login_date',
            'persona_created': 'first_login_date'
        };
        
        // Handle case variations
        const normalizedEventType = event.event_type.toLowerCase();
        const field = featureMap[normalizedEventType] || featureMap[event.event_type];
        if (!field || !event.user_id) return;
        
        // Update feature adoption table
        const { error } = await this.limsSupabase.rpc('update_feature_adoption', {
            p_user_id: event.user_id,
            p_field: field,
            p_timestamp: event.timestamp
        });
        
        if (error) {
            console.error('[PGMQConsumer] Error updating feature adoption:', error);
        }
    }

    async updateMetrics(event) {
        // This would typically update various metric tables
        // For now, we'll emit an event for the metrics service to handle
        this.emit('metric_event', event);
    }

    async checkAlerts(event) {
        // List of events that should trigger alerts
        const alertTriggers = [
            // Resource limits
            'voice_quota_exceeded',
            'storage_capacity_warning',
            'cost_threshold_exceeded',
            
            // System errors
            'api_error',
            'database_error',
            'processing_timeout',
            'processing_failed',
            'file_processing_error',
            'voice_generation_failed',
            'canvas_sync_failed',
            'llm_request_failed',
            
            // Critical system events
            'processing_pipeline_failure',
            'ai_service_unavailable',
            'authentication_failure_spike',
            'database_connection_lost',
            'high_error_rate',
            'queue_backlog_growing',
            'health_check_failed',
            
            // Business critical
            'payment_failed',
            'subscription_cancelled',
            'user_churn_risk_high',
            'low_engagement_detected'
        ];
        
        const normalizedEventType = event.event_type.toLowerCase();
        
        if (alertTriggers.includes(normalizedEventType) || alertTriggers.includes(event.event_type)) {
            this.emit('alert_triggered', {
                type: event.event_type,
                event: event,
                severity: this.getAlertSeverity(event.event_type),
                timestamp: new Date().toISOString()
            });
            
            // Also store in alert history
            try {
                await this.limsSupabase
                    .from('alert_history')
                    .insert({
                        alert_type: event.event_type,
                        event_data: event,
                        triggered_at: new Date().toISOString(),
                        resolved_at: null,
                        acknowledged_at: null
                    });
            } catch (error) {
                console.error('[PGMQConsumer] Error storing alert:', error);
            }
        }
    }
    
    getAlertSeverity(eventType) {
        const severityMap = {
            // Critical
            'processing_pipeline_failure': 'critical',
            'ai_service_unavailable': 'critical',
            'database_connection_lost': 'critical',
            'authentication_failure_spike': 'critical',
            'payment_failed': 'critical',
            
            // High
            'high_error_rate': 'high',
            'queue_backlog_growing': 'high',
            'storage_capacity_warning': 'high',
            'cost_threshold_exceeded': 'high',
            'subscription_cancelled': 'high',
            
            // Medium
            'voice_quota_exceeded': 'medium',
            'processing_failed': 'medium',
            'canvas_sync_failed': 'medium',
            'user_churn_risk_high': 'medium',
            
            // Low
            'low_engagement_detected': 'low',
            'api_error': 'low',
            'processing_timeout': 'low'
        };
        
        return severityMap[eventType] || 'medium';
    }

    async archiveFailedMessage(message) {
        try {
            // Archive to a failed messages table or send to DLQ
            await this.limsSupabase.rpc('pgmq_archive', {
                queue_name: this.config.queueName,
                msg_id: message.msg_id
            });
        } catch (error) {
            console.error('[PGMQConsumer] Error archiving message:', error);
        }
    }

    async updateQueueMetrics() {
        try {
            const { data: metrics } = await this.limsSupabase.rpc('pgmq_metrics', {
                p_queue_name: this.config.queueName
            });
            
            if (metrics) {
                this.stats.queueDepth = metrics.queue_length || 0;
            }
        } catch (error) {
            console.error('[PGMQConsumer] Error updating queue metrics:', error);
        }
    }

    trackEventRate() {
        const now = Date.now();
        this.eventTimestamps.push(now);
        
        // Keep only last minute of timestamps
        const oneMinuteAgo = now - 60000;
        this.eventTimestamps = this.eventTimestamps.filter(ts => ts > oneMinuteAgo);
        
        // Calculate events per minute
        this.stats.eventsPerMinute = this.eventTimestamps.length;
    }

    getStats() {
        return { ...this.stats };
    }
}

module.exports = { PGMQConsumer };