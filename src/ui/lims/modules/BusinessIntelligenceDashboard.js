import { html, css } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';

export class BusinessIntelligenceDashboard extends LIMSModule {
    static styles = css`
        ${super.styles}
        
        :host {
            display: block;
            height: 100%;
            overflow: hidden;
            position: relative;
        }

        .bi-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            background: var(--surface-background);
        }

        .bi-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            background: var(--surface-background);
            flex-shrink: 0;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .header-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
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

        .refresh-button {
            padding: 6px 12px;
            border-radius: 6px;
            background: var(--surface-background);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .refresh-button:hover {
            background: var(--hover-background);
            color: var(--text-primary);
        }

        .refresh-button.refreshing {
            animation: spin 1s linear infinite;
        }

        .bi-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            height: 100%;
            -webkit-overflow-scrolling: touch;
        }

        /* Scrollbar styles */
        .bi-content::-webkit-scrollbar {
            width: 8px;
        }

        .bi-content::-webkit-scrollbar-track {
            background: var(--scrollbar-track, rgba(0, 0, 0, 0.2));
            border-radius: 4px;
        }

        .bi-content::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 4px;
        }

        .bi-content::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* KPI Cards */
        .kpi-section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .kpi-card {
            background: var(--card-background);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid var(--border-color);
        }

        .kpi-label {
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .kpi-value {
            font-size: 32px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .kpi-change {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .kpi-change.positive {
            color: var(--success-color);
        }

        .kpi-change.negative {
            color: var(--error-color);
        }

        /* Conversion Funnel */
        .funnel-container {
            background: var(--card-background);
            border-radius: 8px;
            padding: 32px;
            border: 1px solid var(--border-color);
            margin-bottom: 24px;
        }

        .funnel-visualization {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .funnel-stage {
            position: relative;
        }

        .funnel-stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .funnel-stage-info {
            display: flex;
            align-items: baseline;
            gap: 12px;
        }

        .funnel-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .funnel-users {
            font-size: 14px;
            color: var(--text-secondary);
        }

        .funnel-percentage {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-color);
        }

        .funnel-bar-container {
            position: relative;
            background: var(--surface-background);
            border-radius: 8px;
            height: 48px;
            overflow: hidden;
        }

        .funnel-bar {
            height: 100%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark, #0056b3));
            border-radius: 8px;
            transition: width 0.5s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .funnel-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
            pointer-events: none;
        }

        .funnel-dropoff {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(231, 76, 60, 0.1);
            color: var(--error-color);
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .funnel-dropoff::before {
            content: '↓';
            font-size: 16px;
        }

        .funnel-stage-connector {
            position: absolute;
            left: 50%;
            bottom: -24px;
            transform: translateX(-50%);
            width: 2px;
            height: 24px;
            background: var(--border-color);
            z-index: 1;
        }

        .funnel-stage:last-child .funnel-stage-connector {
            display: none;
        }

        .funnel-stage:nth-child(1) .funnel-bar {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .funnel-stage:nth-child(2) .funnel-bar {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .funnel-stage:nth-child(3) .funnel-bar {
            background: linear-gradient(135deg, #ec4899, #db2777);
        }

        .funnel-stage:nth-child(4) .funnel-bar {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .funnel-stage:nth-child(5) .funnel-bar {
            background: linear-gradient(135deg, #10b981, #059669);
        }

        .funnel-summary {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }

        .funnel-summary-item {
            text-align: center;
        }

        .funnel-summary-label {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .funnel-summary-value {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
        }

        /* Insights Cards */
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
        }

        .insight-card {
            background: var(--card-background);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }

        .insight-card.critical {
            border-left: 4px solid var(--error-color);
        }

        .insight-card.warning {
            border-left: 4px solid #f39c12;
        }

        .insight-card.success {
            border-left: 4px solid var(--success-color);
        }

        .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
        }

        .insight-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .insight-priority {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .insight-priority.critical {
            background: rgba(231, 76, 60, 0.2);
            color: var(--error-color);
        }

        .insight-priority.high {
            background: rgba(243, 156, 18, 0.2);
            color: #f39c12;
        }

        .insight-description {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
            line-height: 1.5;
        }

        .insight-recommendation {
            font-size: 14px;
            color: var(--text-primary);
            padding: 12px;
            background: var(--surface-background);
            border-radius: 6px;
            margin-bottom: 8px;
        }

        .insight-impact {
            font-size: 12px;
            color: var(--success-color);
            font-weight: 500;
        }

        /* Learning Analytics */
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .analytics-card {
            background: var(--card-background);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid var(--border-color);
        }

        .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
        }

        .metric-row:last-child {
            border-bottom: none;
        }

        .metric-label {
            font-size: 14px;
            color: var(--text-secondary);
        }

        .metric-value {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        /* Loading and Error States */
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

        @media (max-width: 768px) {
            .analytics-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    static properties = {
        timeRange: { type: String },
        businessKPIs: { type: Object },
        conversionFunnel: { type: Object },
        learningAnalytics: { type: Object },
        actionableInsights: { type: Array },
        isLoading: { type: Boolean },
        error: { type: String },
        isRefreshing: { type: Boolean },
        retentionCohorts: { type: Array },
        isGeneratingReport: { type: Boolean }
    };

    constructor() {
        super();
        this.moduleId = 'business-intelligence';
        this.moduleName = 'Business Intelligence';
        this.moduleIcon = '📈';
        
        this.timeRange = '7d';
        this.businessKPIs = null;
        this.conversionFunnel = null;
        this.learningAnalytics = null;
        this.actionableInsights = [];
        this.isLoading = true;
        this.error = null;
        this.isRefreshing = false;
        this.retentionCohorts = [];
        this.isGeneratingReport = false;
        
        this._refreshInterval = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
        
        // Refresh every 5 minutes
        this._refreshInterval = setInterval(() => {
            this.loadData();
        }, 300000);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
    }

    async loadData() {
        this.isLoading = true;
        this.error = null;
        
        try {
            const [kpis, funnel, learning, insights] = await Promise.all([
                window.api.analytics.getBusinessKPIs(this.timeRange),
                window.api.analytics.getConversionFunnel(this.timeRange),
                window.api.analytics.getLearningAnalytics(this.timeRange),
                window.api.analytics.getActionableInsights(this.timeRange)
            ]);
            
            this.businessKPIs = kpis;
            this.conversionFunnel = funnel;
            this.learningAnalytics = learning;
            this.actionableInsights = insights;
            
            console.log('[BusinessIntelligence] Data loaded successfully');
        } catch (error) {
            console.error('[BusinessIntelligence] Error loading data:', error);
            this.error = 'Failed to load business intelligence data';
        } finally {
            this.isLoading = false;
        }
    }

    async changeTimeRange(range) {
        this.timeRange = range;
        await this.loadData();
    }

    async refreshData() {
        this.isRefreshing = true;
        await this.loadData();
        this.isRefreshing = false;
    }

    async generateReport() {
        this.isGeneratingReport = true;
        
        try {
            // Generate comprehensive BI report
            const report = await window.api.analytics.generateReport({
                reportType: 'business_intelligence',
                timeRange: this.timeRange,
                format: 'pdf',
                sections: [
                    'executive_summary',
                    'kpis',
                    'user_engagement',
                    'conversion_funnel',
                    'retention_analysis',
                    'revenue_metrics',
                    'recommendations'
                ]
            });
            
            // Download the report
            if (report.downloadUrl) {
                const a = document.createElement('a');
                a.href = report.downloadUrl;
                a.download = `BI_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Show success message
                console.log('[BusinessIntelligence] Report generated successfully');
            }
            
        } catch (error) {
            console.error('[BusinessIntelligence] Error generating report:', error);
            this.error = 'Failed to generate report';
        } finally {
            this.isGeneratingReport = false;
        }
    }

    render() {
        return html`
            <div class="bi-container">
                <div class="bi-header">
                    <div class="header-content">
                        <h2 class="header-title">
                            <span>${this.moduleIcon}</span>
                            Business Intelligence Dashboard
                        </h2>
                        <div class="header-controls">
                            <div class="time-range-selector">
                                ${['7d', '30d', '90d'].map(range => html`
                                    <button 
                                        class="time-range-button ${this.timeRange === range ? 'active' : ''}"
                                        @click=${() => this.changeTimeRange(range)}
                                    >
                                        ${range === '7d' ? '7 Days' : 
                                          range === '30d' ? '30 Days' : '90 Days'}
                                    </button>
                                `)}
                            </div>
                            <button 
                                class="refresh-button ${this.isRefreshing ? 'refreshing' : ''}"
                                @click=${this.refreshData}
                                ?disabled=${this.isRefreshing}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64L21 3v6h-6"/>
                                </svg>
                                ${this.isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button 
                                class="time-range-button"
                                @click=${this.generateReport}
                                ?disabled=${this.isGeneratingReport}
                                style="background: var(--success-color); border-color: var(--success-color); color: white;"
                            >
                                ${this.isGeneratingReport ? html`
                                    <span style="display: flex; align-items: center; gap: 6px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                        Generating...
                                    </span>
                                ` : html`
                                    <span style="display: flex; align-items: center; gap: 6px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                            <polyline points="10 9 9 9 8 9"/>
                                        </svg>
                                        Generate Report
                                    </span>
                                `}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bi-content">
                    ${this.isLoading ? html`
                        <div class="loading-state">Loading business intelligence data...</div>
                    ` : this.error ? html`
                        <div class="error-state">
                            <div class="error-message">${this.error}</div>
                            <button class="retry-button" @click=${this.loadData}>Retry</button>
                        </div>
                    ` : html`
                        ${this.renderActionableInsights()}
                        ${this.renderKPIs()}
                        ${this.renderConversionFunnel()}
                        ${this.renderRetentionCohorts()}
                        ${this.renderLearningAnalytics()}
                    `}
                </div>
            </div>
        `;
    }

    renderActionableInsights() {
        if (!this.actionableInsights?.length) return '';
        
        return html`
            <div class="kpi-section">
                <h3 class="section-title">🎯 Actionable Insights</h3>
                <div class="insights-grid">
                    ${this.actionableInsights.slice(0, 6).map(insight => html`
                        <div class="insight-card ${insight.type}">
                            <div class="insight-header">
                                <div class="insight-title">${insight.title}</div>
                                <div class="insight-priority ${insight.priority}">${insight.priority}</div>
                            </div>
                            <div class="insight-description">${insight.description}</div>
                            <div class="insight-recommendation">
                                💡 ${insight.recommendation}
                            </div>
                            <div class="insight-impact">
                                Expected Impact: ${insight.potentialImpact}
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderKPIs() {
        if (!this.businessKPIs) return '';
        
        return html`
            <div class="kpi-section">
                <h3 class="section-title">📊 Key Performance Indicators</h3>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">User Growth</div>
                        <div class="kpi-value">${this.businessKPIs.userGrowth?.totalUsers || 0}</div>
                        <div class="kpi-change ${this.businessKPIs.userGrowth?.rate >= 0 ? 'positive' : 'negative'}">
                            ${this.businessKPIs.userGrowth?.rate > 0 ? '+' : ''}${this.businessKPIs.userGrowth?.rate || 0}% vs last period
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-label">7-Day Retention</div>
                        <div class="kpi-value">${this.businessKPIs.retention?.day7 || 0}%</div>
                        <div class="kpi-change">
                            Target: 40%+
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-label">Completion Rate</div>
                        <div class="kpi-value">${this.businessKPIs.completionRate || 0}%</div>
                        <div class="kpi-change">
                            Avg time: ${this.businessKPIs.avgTimeToComplete?.minutes || 0} min
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-label">Feature Stickiness</div>
                        <div class="kpi-value">${this.businessKPIs.featureStickiness?.score || 0}%</div>
                        <div class="kpi-change ${this.businessKPIs.featureStickiness?.trend?.startsWith('+') ? 'positive' : 'negative'}">
                            ${this.businessKPIs.featureStickiness?.trend || '0%'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderConversionFunnel() {
        if (!this.conversionFunnel) return '';
        
        const maxUsers = this.conversionFunnel.stages[0]?.users || 1;
        const totalConversion = this.conversionFunnel.stages[this.conversionFunnel.stages.length - 1]?.percentage || 0;
        const avgDropoff = this.conversionFunnel.dropoffPoints.reduce((sum, d) => sum + parseFloat(d.dropoffRate), 0) / 
                          (this.conversionFunnel.dropoffPoints.length || 1);
        
        return html`
            <div class="kpi-section">
                <h3 class="section-title">🔀 User Conversion Funnel</h3>
                <div class="funnel-container">
                    <div class="funnel-visualization">
                        ${this.conversionFunnel.stages.map((stage, index) => {
                            const width = (stage.users / maxUsers) * 100;
                            const dropoff = index > 0 ? this.conversionFunnel.dropoffPoints.find(
                                d => d.to === stage.name
                            ) : null;
                            
                            return html`
                                <div class="funnel-stage">
                                    <div class="funnel-stage-header">
                                        <div class="funnel-stage-info">
                                            <div class="funnel-name">${stage.name}</div>
                                            <div class="funnel-users">${stage.users.toLocaleString()} users</div>
                                        </div>
                                        <div class="funnel-percentage">${stage.percentage.toFixed(1)}%</div>
                                    </div>
                                    <div class="funnel-bar-container">
                                        <div class="funnel-bar" style="width: ${width}%">
                                            ${width > 20 ? html`${stage.users.toLocaleString()}` : ''}
                                        </div>
                                        ${dropoff ? html`
                                            <div class="funnel-dropoff">
                                                ${dropoff.dropoffRate}%
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="funnel-stage-connector"></div>
                                </div>
                            `;
                        })}
                    </div>
                    
                    <div class="funnel-summary">
                        <div class="funnel-summary-item">
                            <div class="funnel-summary-label">Total Conversion</div>
                            <div class="funnel-summary-value">${totalConversion.toFixed(1)}%</div>
                        </div>
                        <div class="funnel-summary-item">
                            <div class="funnel-summary-label">Avg Drop-off</div>
                            <div class="funnel-summary-value">${avgDropoff.toFixed(1)}%</div>
                        </div>
                        <div class="funnel-summary-item">
                            <div class="funnel-summary-label">Biggest Drop</div>
                            <div class="funnel-summary-value">
                                ${this.conversionFunnel.dropoffPoints.reduce((max, d) => 
                                    parseFloat(d.dropoffRate) > parseFloat(max.dropoffRate) ? d : max
                                , this.conversionFunnel.dropoffPoints[0] || {dropoffRate: '0'}).from || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRetentionCohorts() {
        if (!this.retentionCohorts || this.retentionCohorts.length === 0) {
            // Load retention data if not available
            this.loadRetentionData();
            return html`
                <div class="kpi-section">
                    <h3 class="section-title">🔄 User Retention Analysis</h3>
                    <div class="loading-state">Loading retention data...</div>
                </div>
            `;
        }
        
        return html`
            <div class="kpi-section">
                <h3 class="section-title">🔄 User Retention Analysis</h3>
                <div class="kpi-grid">
                    <div class="kpi-card" style="grid-column: 1 / -1;">
                        <h4 class="subsection-title">Cohort Retention Table</h4>
                        <div style="overflow-x: auto; margin-top: 16px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background: var(--surface-background);">
                                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">
                                            Cohort
                                        </th>
                                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color);">
                                            Users
                                        </th>
                                        ${[0, 1, 7, 14, 30, 60, 90].map(day => html`
                                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color);">
                                                Day ${day}
                                            </th>
                                        `)}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.retentionCohorts.map(cohort => html`
                                        <tr style="border-bottom: 1px solid var(--border-color);">
                                            <td style="padding: 12px; font-weight: 500;">
                                                ${new Date(cohort.cohort_date).toLocaleDateString([], { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    year: '2-digit'
                                                })}
                                            </td>
                                            <td style="padding: 12px; text-align: center;">
                                                ${cohort.total_users}
                                            </td>
                                            ${[0, 1, 7, 14, 30, 60, 90].map(day => {
                                                const retention = cohort.retention_data?.[`day_${day}`] || 0;
                                                const percentage = cohort.total_users > 0 
                                                    ? (retention / cohort.total_users * 100).toFixed(1)
                                                    : 0;
                                                const color = this.getRetentionColor(percentage);
                                                
                                                return html`
                                                    <td style="
                                                        padding: 12px; 
                                                        text-align: center;
                                                        background: ${color};
                                                        color: ${percentage > 50 ? 'white' : 'var(--text-primary)'};
                                                        font-weight: ${day === 0 ? '600' : '400'};
                                                    ">
                                                        ${percentage}%
                                                    </td>
                                                `;
                                            })}
                                        </tr>
                                    `)}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="funnel-summary" style="margin-top: 24px;">
                            <div class="funnel-summary-item">
                                <div class="funnel-summary-label">Avg. Day 1 Retention</div>
                                <div class="funnel-summary-value">
                                    ${this.calculateAvgRetention(1)}%
                                </div>
                            </div>
                            <div class="funnel-summary-item">
                                <div class="funnel-summary-label">Avg. Day 7 Retention</div>
                                <div class="funnel-summary-value">
                                    ${this.calculateAvgRetention(7)}%
                                </div>
                            </div>
                            <div class="funnel-summary-item">
                                <div class="funnel-summary-label">Avg. Day 30 Retention</div>
                                <div class="funnel-summary-value">
                                    ${this.calculateAvgRetention(30)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getRetentionColor(percentage) {
        const p = parseFloat(percentage);
        if (p >= 80) return 'rgba(16, 185, 129, 0.8)';  // Green
        if (p >= 60) return 'rgba(59, 130, 246, 0.8)';  // Blue
        if (p >= 40) return 'rgba(251, 191, 36, 0.8)';  // Yellow
        if (p >= 20) return 'rgba(245, 158, 11, 0.8)';  // Orange
        return 'rgba(239, 68, 68, 0.8)';  // Red
    }

    calculateAvgRetention(day) {
        if (!this.retentionCohorts || this.retentionCohorts.length === 0) return 0;
        
        const total = this.retentionCohorts.reduce((sum, cohort) => {
            const retention = cohort.retention_data?.[`day_${day}`] || 0;
            const percentage = cohort.total_users > 0 
                ? (retention / cohort.total_users * 100)
                : 0;
            return sum + percentage;
        }, 0);
        
        return (total / this.retentionCohorts.length).toFixed(1);
    }

    async loadRetentionData() {
        try {
            const retentionData = await window.api.analytics.getRetentionCohorts(this.timeRange);
            this.retentionCohorts = retentionData || [];
            this.requestUpdate();
        } catch (error) {
            console.error('[BusinessIntelligence] Error loading retention data:', error);
            this.retentionCohorts = [];
            this.requestUpdate();
        }
    }

    renderLearningAnalytics() {
        if (!this.learningAnalytics) return '';
        
        return html`
            <div class="kpi-section">
                <h3 class="section-title">📚 Learning Analytics</h3>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4 style="margin-bottom: 16px;">Engagement Patterns</h4>
                        <div class="metric-row">
                            <span class="metric-label">Peak Usage</span>
                            <span class="metric-value">${this.learningAnalytics.peakUsageHours?.peak || 'N/A'}</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Avg Session</span>
                            <span class="metric-value">${this.learningAnalytics.avgStudySessionLength?.minutes || 0} min</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Weekday Usage</span>
                            <span class="metric-value">${this.learningAnalytics.weekdayVsWeekend?.weekday || 0}%</span>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4 style="margin-bottom: 16px;">Learning Outcomes</h4>
                        <div class="metric-row">
                            <span class="metric-label">Avg Quiz Score</span>
                            <span class="metric-value">${this.learningAnalytics.avgQuizScore?.score || 0}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Improvement Rate</span>
                            <span class="metric-value">${this.learningAnalytics.improvementRate?.rate || 0}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Optimal Lesson Length</span>
                            <span class="metric-value">${this.learningAnalytics.optimalLessonLength?.minutes || 0} min</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('business-intelligence-dashboard', BusinessIntelligenceDashboard);