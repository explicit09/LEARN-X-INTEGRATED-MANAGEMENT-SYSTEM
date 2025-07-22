import { html, css } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';

export class AnalyticsDashboardModule extends LIMSModule {
    static styles = css`
        ${super.styles}
        
            :host {
                display: block;
                height: 100%;
                overflow: hidden;
            }

            .analytics-container {
                height: 100%;
                display: flex;
                flex-direction: column;
                background: var(--surface-background);
            }

            .analytics-header {
                padding: 16px 20px;
                border-bottom: 1px solid var(--border-color);
                background: var(--surface-background);
            }

            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-title {
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .time-range-selector {
                display: flex;
                gap: 8px;
            }

            .time-range-button {
                padding: 6px 12px;
                border-radius: 6px;
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-secondary);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .time-range-button:hover {
                background: var(--hover-background);
                color: var(--text-primary);
            }

            .time-range-button.active {
                background: var(--primary-color);
                border-color: var(--primary-color);
                color: white;
            }

            .analytics-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .metric-card {
                background: var(--card-background);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid var(--border-color);
                position: relative;
                overflow: hidden;
            }

            .metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--primary-color);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .metric-card:hover::before {
                opacity: 1;
            }

            .metric-label {
                font-size: 12px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            .metric-value {
                font-size: 28px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .metric-change {
                font-size: 12px;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 6px;
                border-radius: 4px;
            }

            .metric-change.positive {
                color: var(--success-color);
                background: rgba(46, 204, 113, 0.1);
            }

            .metric-change.negative {
                color: var(--error-color);
                background: rgba(231, 76, 60, 0.1);
            }

            .chart-section {
                margin-bottom: 24px;
            }

            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 16px;
            }

            .chart-container {
                background: var(--card-background);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid var(--border-color);
                margin-bottom: 16px;
                min-height: 300px;
            }

            .chart-placeholder {
                height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                font-size: 14px;
                border: 2px dashed var(--border-color);
                border-radius: 6px;
            }

            .feature-adoption-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .feature-card {
                background: var(--card-background);
                border-radius: 8px;
                padding: 16px;
                border: 1px solid var(--border-color);
            }

            .feature-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--text-primary);
                margin-bottom: 8px;
            }

            .feature-adoption-rate {
                font-size: 24px;
                font-weight: 600;
                color: var(--primary-color);
                margin-bottom: 4px;
            }

            .feature-users {
                font-size: 12px;
                color: var(--text-secondary);
            }

            .progress-bar {
                height: 4px;
                background: var(--border-color);
                border-radius: 2px;
                margin-top: 8px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: var(--primary-color);
                border-radius: 2px;
                transition: width 0.3s ease;
            }

            .loading-state {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
            }

            .error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                gap: 12px;
            }

            .error-message {
                color: var(--error-color);
                font-size: 14px;
            }

            .retry-button {
                padding: 8px 16px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s ease;
            }

            .retry-button:hover {
                opacity: 0.8;
            }

            .consumer-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: var(--text-secondary);
            }

            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--error-color);
            }

            .status-indicator.running {
                background: var(--success-color);
            }

            .events-feed {
                max-height: 400px;
                overflow-y: auto;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px;
                background: var(--surface-background);
            }

            .event-item {
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 8px;
                background: var(--card-background);
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .event-type {
                font-weight: 500;
                color: var(--text-primary);
            }

            .event-time {
                color: var(--text-secondary);
                font-size: 11px;
            }
        `;

    static properties = {
        timeRange: { type: String },
        metrics: { type: Object },
        featureAdoption: { type: Array },
        recentEvents: { type: Array },
        systemHealth: { type: Object },
        isLoading: { type: Boolean },
        error: { type: String }
    };

    constructor() {
        super();
        this.moduleId = 'analytics-dashboard';
        this.moduleName = 'Analytics Dashboard';
        this.moduleIcon = '📊';
        
        this.timeRange = '7d';
        this.metrics = null;
        this.featureAdoption = [];
        this.recentEvents = [];
        this.systemHealth = null;
        this.isLoading = true;
        this.error = null;
        
        this._refreshInterval = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.initializeAnalytics();
        await this.loadData();
        
        // Set up auto-refresh every 30 seconds
        this._refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
    }

    async initializeAnalytics() {
        try {
            await window.api.analytics.initialize();
            console.log('[AnalyticsDashboard] Analytics service initialized');
        } catch (error) {
            console.error('[AnalyticsDashboard] Failed to initialize analytics:', error);
            this.error = 'Failed to initialize analytics service';
        }
    }

    async loadData() {
        this.isLoading = true;
        this.error = null;
        
        try {
            // Load all data in parallel
            const [metrics, featureAdoption, recentEvents, systemHealth] = await Promise.all([
                window.api.analytics.getSummaryMetrics(this.timeRange),
                window.api.analytics.getFeatureAdoption(),
                window.api.analytics.getRecentEvents(50),
                window.api.analytics.getSystemHealth()
            ]);
            
            this.metrics = metrics;
            this.featureAdoption = featureAdoption;
            this.recentEvents = recentEvents;
            this.systemHealth = systemHealth;
            
            console.log('[AnalyticsDashboard] Data loaded successfully');
        } catch (error) {
            console.error('[AnalyticsDashboard] Error loading data:', error);
            this.error = 'Failed to load analytics data';
        } finally {
            this.isLoading = false;
        }
    }

    async changeTimeRange(range) {
        this.timeRange = range;
        await this.loadData();
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }

    render() {
        return html`
            <div class="analytics-container">
                <div class="analytics-header">
                    <div class="header-content">
                        <h2 class="header-title">Analytics Dashboard</h2>
                        <div class="time-range-selector">
                            ${['1d', '7d', '30d', '90d'].map(range => html`
                                <button 
                                    class="time-range-button ${this.timeRange === range ? 'active' : ''}"
                                    @click=${() => this.changeTimeRange(range)}
                                >
                                    ${range === '1d' ? 'Today' : 
                                      range === '7d' ? '7 Days' : 
                                      range === '30d' ? '30 Days' : '90 Days'}
                                </button>
                            `)}
                        </div>
                    </div>
                    ${this.systemHealth ? html`
                        <div class="consumer-status">
                            <span class="status-indicator ${this.systemHealth.consumer_status?.is_running ? 'running' : ''}"></span>
                            <span>PGMQ Consumer: ${this.systemHealth.consumer_status?.is_running ? 'Running' : 'Stopped'}</span>
                            <span>• ${this.systemHealth.consumer_status?.events_processed || 0} events processed</span>
                            <span>• ${this.systemHealth.consumer_status?.events_per_minute || 0} events/min</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="analytics-content">
                    ${this.isLoading ? html`
                        <div class="loading-state">Loading analytics data...</div>
                    ` : this.error ? html`
                        <div class="error-state">
                            <div class="error-message">${this.error}</div>
                            <button class="retry-button" @click=${this.loadData}>Retry</button>
                        </div>
                    ` : html`
                        ${this.renderMetrics()}
                        ${this.renderFeatureAdoption()}
                        ${this.renderRecentEvents()}
                    `}
                </div>
            </div>
        `;
    }

    renderMetrics() {
        if (!this.metrics) return '';
        
        return html`
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Total Users</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.totalUsers)}</div>
                    <div class="metric-change ${this.metrics.trends?.users?.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.metrics.trends?.users || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-label">Active Today</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.activeToday)}</div>
                    <div class="metric-change ${this.metrics.trends?.active?.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.metrics.trends?.active || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-label">Lessons Created</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.lessonsCreated)}</div>
                    <div class="metric-change ${this.metrics.trends?.lessons?.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.metrics.trends?.lessons || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-label">Completion Rate</div>
                    <div class="metric-value">${this.metrics.completionRate}%</div>
                    <div class="metric-change ${this.metrics.trends?.completion?.startsWith('+') ? 'positive' : 'negative'}">
                        ${this.metrics.trends?.completion || '0%'}
                    </div>
                </div>
            </div>
        `;
    }

    renderFeatureAdoption() {
        if (!this.featureAdoption?.length) return '';
        
        return html`
            <div class="chart-section">
                <h3 class="section-title">Feature Adoption</h3>
                <div class="feature-adoption-grid">
                    ${this.featureAdoption.map(feature => html`
                        <div class="feature-card">
                            <div class="feature-name">${feature.feature}</div>
                            <div class="feature-adoption-rate">${feature.adoption_rate}%</div>
                            <div class="feature-users">${feature.users} of ${feature.total_users} users</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${feature.adoption_rate}%"></div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderRecentEvents() {
        if (!this.recentEvents?.length) return '';
        
        return html`
            <div class="chart-section">
                <h3 class="section-title">Recent Events</h3>
                <div class="events-feed">
                    ${this.recentEvents.slice(0, 20).map(event => html`
                        <div class="event-item">
                            <span class="event-type">${event.event_type}</span>
                            <span class="event-time">${this.formatTimeAgo(event.timestamp)}</span>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define('analytics-dashboard-module', AnalyticsDashboardModule);