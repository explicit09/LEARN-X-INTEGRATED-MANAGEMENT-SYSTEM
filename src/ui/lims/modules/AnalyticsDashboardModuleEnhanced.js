import { html, css } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';
// Import Chart.js - will load synchronously
import '../../assets/chart-3.9.1.min.js';

export class AnalyticsDashboardModuleEnhanced extends LIMSModule {
    static styles = css`
        ${super.styles}
        
        :host {
            display: block;
            height: 100%;
            overflow: hidden;
            --chart-background: rgba(255, 255, 255, 0.02);
            --chart-border: rgba(255, 255, 255, 0.1);
            --chart-grid: rgba(255, 255, 255, 0.05);
            position: relative;
        }

        .analytics-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            background: var(--surface-background);
        }

        .analytics-header {
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

        .analytics-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            height: 100%;
            -webkit-overflow-scrolling: touch;
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
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

        .metric-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-bottom: 12px;
        }

        .metric-icon.users {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .metric-icon.active {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }

        .metric-icon.lessons {
            background: rgba(139, 92, 246, 0.1);
            color: #8b5cf6;
        }

        .metric-icon.completion {
            background: rgba(236, 72, 153, 0.1);
            color: #ec4899;
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

        .metric-change.neutral {
            color: var(--text-secondary);
            background: var(--surface-background);
        }

        .chart-section {
            margin-bottom: 24px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .section-actions {
            display: flex;
            gap: 8px;
        }

        .chart-container {
            background: var(--card-background);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid var(--border-color);
            margin-bottom: 16px;
        }

        .chart-wrapper {
            position: relative;
            height: 300px;
        }

        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 16px;
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
            transition: transform 0.2s ease;
        }

        .feature-card:hover {
            transform: translateY(-2px);
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

        .live-events-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16px;
        }

        .events-feed {
            background: var(--card-background);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid var(--border-color);
            max-height: 400px;
            overflow-y: auto;
        }

        .event-item {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            background: var(--surface-background);
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 12px;
            transition: all 0.2s ease;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .event-item:hover {
            background: var(--hover-background);
        }

        .event-content {
            flex: 1;
        }

        .event-type {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .event-details {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .event-time {
            color: var(--text-secondary);
            font-size: 11px;
            white-space: nowrap;
        }

        .event-type-distribution {
            background: var(--card-background);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid var(--border-color);
        }

        .distribution-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 13px;
        }

        .distribution-name {
            color: var(--text-primary);
        }

        .distribution-count {
            font-weight: 600;
            color: var(--primary-color);
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
            animation: pulse 2s infinite;
        }

        .status-indicator.running {
            background: var(--success-color);
        }

        @keyframes pulse {
            0% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
            100% {
                opacity: 1;
            }
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

        /* Scrollbar styles */
        .analytics-content::-webkit-scrollbar,
        .events-feed::-webkit-scrollbar {
            width: 8px;
        }

        .analytics-content::-webkit-scrollbar-track,
        .events-feed::-webkit-scrollbar-track {
            background: var(--scrollbar-track, rgba(0, 0, 0, 0.2));
            border-radius: 4px;
        }

        .analytics-content::-webkit-scrollbar-thumb,
        .events-feed::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 4px;
        }

        .analytics-content::-webkit-scrollbar-thumb:hover,
        .events-feed::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }
    `;

    static properties = {
        timeRange: { type: String },
        metrics: { type: Object },
        featureAdoption: { type: Array },
        recentEvents: { type: Array },
        systemHealth: { type: Object },
        isLoading: { type: Boolean },
        error: { type: String },
        charts: { type: Object },
        eventTypeDistribution: { type: Object },
        isRefreshing: { type: Boolean },
        dauWauMauData: { type: Object },
        activeAlerts: { type: Array },
        retentionData: { type: Array }
    };

    constructor() {
        super();
        this.moduleId = 'analytics-dashboard-enhanced';
        this.moduleName = 'Analytics Dashboard';
        this.moduleIcon = '📊';
        
        this.timeRange = '7d';
        this.metrics = null;
        this.featureAdoption = [];
        this.recentEvents = [];
        this.systemHealth = null;
        this.isLoading = true;
        this.error = null;
        this.charts = {};
        this.eventTypeDistribution = {};
        this.isRefreshing = false;
        this.dauWauMauData = null;
        this.activeAlerts = [];
        this.retentionData = [];
        
        this._refreshInterval = null;
        this._eventSubscription = null;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.initializeAnalytics();
        await this.loadData();
        
        // Set up auto-refresh every 30 seconds
        this._refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
        
        // Subscribe to real-time events
        this._eventSubscription = window.api.analytics.subscribeToEvents((event) => {
            this.handleNewEvent(event);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
        
        if (this._eventSubscription) {
            this._eventSubscription();
            this._eventSubscription = null;
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
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
            const [metrics, featureAdoption, recentEvents, systemHealth, timeSeriesData, dauWauMauData, activeAlerts] = await Promise.all([
                window.api.analytics.getSummaryMetrics(this.timeRange),
                window.api.analytics.getFeatureAdoption(),
                window.api.analytics.getRecentEvents(50),
                window.api.analytics.getSystemHealth(),
                this.loadTimeSeriesData(),
                this.loadDAUWAUMAUData(),
                window.api.analytics.getActiveAlerts()
            ]);
            
            this.metrics = metrics;
            this.featureAdoption = featureAdoption;
            this.recentEvents = recentEvents;
            this.systemHealth = systemHealth;
            this.dauWauMauData = dauWauMauData;
            this.activeAlerts = activeAlerts;
            
            // Calculate event type distribution
            this.calculateEventTypeDistribution();
            
            // Update charts after render
            this.updateComplete.then(() => {
                this.initializeCharts(timeSeriesData);
                this.initializeDAUChart();
            });
            
            console.log('[AnalyticsDashboard] Data loaded successfully');
        } catch (error) {
            console.error('[AnalyticsDashboard] Error loading data:', error);
            this.error = 'Failed to load analytics data';
        } finally {
            this.isLoading = false;
        }
    }

    async loadTimeSeriesData() {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (this.timeRange) {
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
        
        const interval = this.timeRange === '1d' ? 'hour' : 'day';
        
        const [userActivity, lessonActivity] = await Promise.all([
            window.api.analytics.getTimeSeriesData('active_users', startDate, endDate, interval),
            window.api.analytics.getTimeSeriesData('lesson_completions', startDate, endDate, interval)
        ]);
        
        return { userActivity, lessonActivity };
    }

    async loadDAUWAUMAUData() {
        try {
            // Get DAU/WAU/MAU data from aggregation service
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 30); // Get last 30 days for trend
            
            // Call the aggregation service to get DAU/WAU/MAU data
            const dauWauMauData = await window.api.analytics.getDAUWAUMAU(startDate, endDate);
            
            return dauWauMauData;
        } catch (error) {
            console.error('[AnalyticsDashboard] Error loading DAU/WAU/MAU data:', error);
            return null;
        }
    }

    calculateEventTypeDistribution() {
        const distribution = {};
        
        this.recentEvents.forEach(event => {
            distribution[event.event_type] = (distribution[event.event_type] || 0) + 1;
        });
        
        // Sort by count and take top 10
        this.eventTypeDistribution = Object.entries(distribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
    }

    initializeCharts(timeSeriesData) {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('[AnalyticsDashboard] Chart.js not available - charts disabled');
            return;
        }
        
        // User Activity Chart
        const userActivityCanvas = this.shadowRoot.getElementById('userActivityChart');
        if (userActivityCanvas) {
            if (this.charts.userActivity) {
                this.charts.userActivity.destroy();
            }
            
            this.charts.userActivity = new Chart(userActivityCanvas, {
                type: 'line',
                data: {
                    labels: timeSeriesData.userActivity.map(d => {
                        const date = new Date(d.period);
                        return this.timeRange === '1d' 
                            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }),
                    datasets: [{
                        label: 'Active Users',
                        data: timeSeriesData.userActivity.map(d => d.value),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
        
        // Lesson Activity Chart
        const lessonActivityCanvas = this.shadowRoot.getElementById('lessonActivityChart');
        if (lessonActivityCanvas) {
            if (this.charts.lessonActivity) {
                this.charts.lessonActivity.destroy();
            }
            
            this.charts.lessonActivity = new Chart(lessonActivityCanvas, {
                type: 'bar',
                data: {
                    labels: timeSeriesData.lessonActivity.map(d => {
                        const date = new Date(d.period);
                        return this.timeRange === '1d' 
                            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }),
                    datasets: [{
                        label: 'Lessons Completed',
                        data: timeSeriesData.lessonActivity.map(d => d.value),
                        backgroundColor: 'rgba(139, 92, 246, 0.5)',
                        borderColor: '#8b5cf6',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    initializeDAUChart() {
        if (typeof Chart === 'undefined' || !this.dauWauMauData?.dau) {
            return;
        }
        
        const dauTrendCanvas = this.shadowRoot.getElementById('dauTrendChart');
        if (dauTrendCanvas) {
            if (this.charts.dauTrend) {
                this.charts.dauTrend.destroy();
            }
            
            this.charts.dauTrend = new Chart(dauTrendCanvas, {
                type: 'line',
                data: {
                    labels: this.dauWauMauData.dau.map(d => {
                        const date = new Date(d.date);
                        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }),
                    datasets: [
                        {
                            label: 'Total DAU',
                            data: this.dauWauMauData.dau.map(d => d.dau),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'New Users',
                            data: this.dauWauMauData.dau.map(d => d.newUsers),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Returning Users',
                            data: this.dauWauMauData.dau.map(d => d.returningUsers),
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                font: { size: 11 }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                stepSize: 1
                            }
                        }
                    }
                }
            });
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

    handleNewEvent(event) {
        // Add new event to the beginning of the list
        this.recentEvents = [event, ...this.recentEvents].slice(0, 50);
        
        // Update event type distribution
        this.calculateEventTypeDistribution();
        
        // Request update
        this.requestUpdate();
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

    formatEventType(eventType) {
        return eventType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    render() {
        return html`
            <div class="analytics-container">
                <div class="analytics-header">
                    <div class="header-content">
                        <h2 class="header-title">
                            <span>${this.moduleIcon}</span>
                            Analytics Dashboard
                        </h2>
                        <div class="header-controls">
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
                        </div>
                    </div>
                    ${this.systemHealth ? html`
                        <div class="consumer-status">
                            <span class="status-indicator ${this.systemHealth.consumer_status?.is_running ? 'running' : ''}"></span>
                            <span>PGMQ Consumer: ${this.systemHealth.consumer_status?.is_running ? 'Running' : 'Stopped'}</span>
                            <span>• ${this.systemHealth.consumer_status?.events_processed || 0} events processed</span>
                            <span>• ${this.systemHealth.consumer_status?.events_per_minute || 0} events/min</span>
                            <span>• Queue depth: ${this.systemHealth.queue_depth || 0}</span>
                            ${this.systemHealth.queue_depth > 1000 ? html`
                                <span style="color: var(--warning-color); font-weight: 500;">⚠️ High queue depth</span>
                            ` : ''}
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
                        ${this.renderDAUWAUMAU()}
                        ${this.renderActiveAlerts()}
                        ${this.renderQueueMonitoring()}
                        ${this.renderCharts()}
                        ${this.renderFeatureAdoption()}
                        ${this.renderLiveEvents()}
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
                    <div class="metric-icon users">👥</div>
                    <div class="metric-label">Total Users</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.totalUsers)}</div>
                    <div class="metric-change ${this.getChangeClass(this.metrics.trends?.users)}">
                        ${this.metrics.trends?.users || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon active">✨</div>
                    <div class="metric-label">Active Today</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.activeToday)}</div>
                    <div class="metric-change ${this.getChangeClass(this.metrics.trends?.active)}">
                        ${this.metrics.trends?.active || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon lessons">📚</div>
                    <div class="metric-label">Lessons Created</div>
                    <div class="metric-value">${this.formatNumber(this.metrics.lessonsCreated)}</div>
                    <div class="metric-change ${this.getChangeClass(this.metrics.trends?.lessons)}">
                        ${this.metrics.trends?.lessons || '0%'}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon completion">🎯</div>
                    <div class="metric-label">Completion Rate</div>
                    <div class="metric-value">${this.metrics.completionRate}%</div>
                    <div class="metric-change ${this.getChangeClass(this.metrics.trends?.completion)}">
                        ${this.metrics.trends?.completion || '0%'}
                    </div>
                </div>
            </div>
        `;
    }

    renderDAUWAUMAU() {
        if (!this.dauWauMauData || !this.dauWauMauData.latest) return '';
        
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">User Engagement Metrics</h3>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon active">📊</div>
                        <div class="metric-label">Daily Active Users</div>
                        <div class="metric-value">${this.formatNumber(this.dauWauMauData.latest.dau)}</div>
                        <div class="metric-change positive">DAU</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon users">📈</div>
                        <div class="metric-label">Weekly Active Users</div>
                        <div class="metric-value">${this.formatNumber(this.dauWauMauData.latest.wau)}</div>
                        <div class="metric-change positive">WAU</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon lessons">📉</div>
                        <div class="metric-label">Monthly Active Users</div>
                        <div class="metric-value">${this.formatNumber(this.dauWauMauData.latest.mau)}</div>
                        <div class="metric-change positive">MAU</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon completion">🔄</div>
                        <div class="metric-label">DAU/MAU Ratio</div>
                        <div class="metric-value">${this.dauWauMauData.latest.mau > 0 ? 
                            ((this.dauWauMauData.latest.dau / this.dauWauMauData.latest.mau) * 100).toFixed(1) : 0}%</div>
                        <div class="metric-change neutral">Stickiness</div>
                    </div>
                </div>
                
                ${this.dauWauMauData.dau && this.dauWauMauData.dau.length > 0 ? html`
                    <div class="chart-container">
                        <h4 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">DAU Trend (Last 30 Days)</h4>
                        <div class="chart-wrapper">
                            <canvas id="dauTrendChart"></canvas>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderActiveAlerts() {
        if (!this.activeAlerts || this.activeAlerts.length === 0) return '';
        
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">🚨 Active Alerts (${this.activeAlerts.length})</h3>
                    <div class="section-actions">
                        <button class="time-range-button" @click=${() => window.api.navigation.navigate('alerts')}>
                            View All Alerts
                        </button>
                    </div>
                </div>
                <div class="alerts-grid" style="display: grid; gap: 12px;">
                    ${this.activeAlerts.slice(0, 5).map(alert => html`
                        <div class="alert-card" style="
                            background: var(--card-background);
                            border-radius: 8px;
                            padding: 16px;
                            border: 1px solid ${this.getAlertBorderColor(alert.severity)};
                            border-left-width: 4px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <div>
                                <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">
                                    ${alert.alert_rules?.name || 'Unknown Alert'}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">
                                    ${alert.metric}: ${alert.current_value} ${alert.alert_rules?.condition} ${alert.alert_rules?.threshold}
                                </div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                                    Triggered ${this.formatTimeAgo(alert.triggered_at)}
                                </div>
                            </div>
                            <div style="
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 11px;
                                font-weight: 500;
                                background: ${this.getAlertBackground(alert.severity)};
                                color: ${this.getAlertColor(alert.severity)};
                            ">
                                ${alert.severity.toUpperCase()}
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    getAlertBorderColor(severity) {
        switch (severity) {
            case 'critical': return '#ff0000';
            case 'high': return '#ff9900';
            case 'medium': return '#ffcc00';
            case 'low': return '#00cc00';
            default: return 'var(--border-color)';
        }
    }

    getAlertBackground(severity) {
        switch (severity) {
            case 'critical': return 'rgba(255, 0, 0, 0.1)';
            case 'high': return 'rgba(255, 153, 0, 0.1)';
            case 'medium': return 'rgba(255, 204, 0, 0.1)';
            case 'low': return 'rgba(0, 204, 0, 0.1)';
            default: return 'var(--surface-background)';
        }
    }

    getAlertColor(severity) {
        switch (severity) {
            case 'critical': return '#ff0000';
            case 'high': return '#ff9900';
            case 'medium': return '#ffcc00';
            case 'low': return '#00cc00';
            default: return 'var(--text-secondary)';
        }
    }

    renderQueueMonitoring() {
        if (!this.systemHealth) return '';
        
        const queueStatus = this.systemHealth.queue_depth <= 100 ? 'healthy' :
                          this.systemHealth.queue_depth <= 1000 ? 'moderate' : 'high';
        
        const statusColor = queueStatus === 'healthy' ? 'var(--success-color)' :
                          queueStatus === 'moderate' ? 'var(--warning-color)' : 'var(--error-color)';
        
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">📊 Queue Monitoring</h3>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                            📨
                        </div>
                        <div class="metric-label">Queue Depth</div>
                        <div class="metric-value">${this.formatNumber(this.systemHealth.queue_depth || 0)}</div>
                        <div class="metric-change" style="color: ${statusColor};">
                            ${queueStatus.toUpperCase()}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
                            ⚡
                        </div>
                        <div class="metric-label">Processing Rate</div>
                        <div class="metric-value">${this.systemHealth.consumer_status?.events_per_minute || 0}</div>
                        <div class="metric-change neutral">events/min</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
                            ✅
                        </div>
                        <div class="metric-label">Total Processed</div>
                        <div class="metric-value">${this.formatNumber(this.systemHealth.consumer_status?.events_processed || 0)}</div>
                        <div class="metric-change positive">lifetime</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon" style="background: ${this.systemHealth.consumer_status?.is_running ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; 
                                                      color: ${this.systemHealth.consumer_status?.is_running ? '#10b981' : '#ef4444'};">
                            ${this.systemHealth.consumer_status?.is_running ? '🟢' : '🔴'}
                        </div>
                        <div class="metric-label">Consumer Status</div>
                        <div class="metric-value" style="font-size: 20px;">
                            ${this.systemHealth.consumer_status?.is_running ? 'Running' : 'Stopped'}
                        </div>
                        <div class="metric-change ${this.systemHealth.consumer_status?.is_running ? 'positive' : 'negative'}">
                            ${this.systemHealth.consumer_status?.is_running ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>
                </div>
                
                ${this.systemHealth.queue_depth > 1000 ? html`
                    <div style="
                        margin-top: 16px;
                        padding: 12px 16px;
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid var(--error-color);
                        border-radius: 8px;
                        color: var(--error-color);
                        font-size: 14px;
                    ">
                        ⚠️ <strong>High Queue Depth Alert:</strong> The message queue has ${this.formatNumber(this.systemHealth.queue_depth)} pending events. 
                        Consider scaling up the consumer or investigating processing bottlenecks.
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCharts() {
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">Activity Trends</h3>
                </div>
                <div class="chart-grid">
                    <div class="chart-container">
                        <h4 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">User Activity</h4>
                        <div class="chart-wrapper">
                            <canvas id="userActivityChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4 style="font-size: 14px; margin-bottom: 16px; color: var(--text-secondary);">Lesson Completions</h4>
                        <div class="chart-wrapper">
                            <canvas id="lessonActivityChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFeatureAdoption() {
        if (!this.featureAdoption?.length) return '';
        
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">Feature Adoption</h3>
                </div>
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

    renderLiveEvents() {
        return html`
            <div class="chart-section">
                <div class="section-header">
                    <h3 class="section-title">Live Activity</h3>
                </div>
                <div class="live-events-section">
                    <div class="events-feed">
                        <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">Recent Events</h4>
                        ${this.recentEvents.slice(0, 20).map(event => html`
                            <div class="event-item">
                                <div class="event-content">
                                    <div class="event-type">${this.formatEventType(event.event_type)}</div>
                                    <div class="event-details">
                                        ${event.user_id ? html`User: ${event.user_id.substring(0, 8)}...` : 'Anonymous'}
                                        ${event.lesson_id ? html` • Lesson: ${event.lesson_id}` : ''}
                                    </div>
                                </div>
                                <span class="event-time">${this.formatTimeAgo(event.timestamp)}</span>
                            </div>
                        `)}
                    </div>
                    <div class="event-type-distribution">
                        <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">Event Distribution</h4>
                        ${Object.entries(this.eventTypeDistribution).map(([type, count]) => html`
                            <div class="distribution-item">
                                <span class="distribution-name">${this.formatEventType(type)}</span>
                                <span class="distribution-count">${count}</span>
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

    getChangeClass(trend) {
        if (!trend) return 'neutral';
        if (trend.startsWith('+')) return 'positive';
        if (trend.startsWith('-')) return 'negative';
        return 'neutral';
    }
}

customElements.define('analytics-dashboard-module-enhanced', AnalyticsDashboardModuleEnhanced);