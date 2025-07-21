import { html, css, LitElement } from '../../../assets/lit-core-2.7.4.min.js';
import { limsIntegration, INTEGRATION_EVENTS } from './LIMSModuleIntegration.js';

/**
 * IntegrationDemo - Demonstrates LIMS module integration capabilities
 * Shows how modules can communicate and share data
 */
export class IntegrationDemo extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .demo-header {
            margin-bottom: 30px;
        }

        .demo-header h1 {
            font-size: 28px;
            color: var(--text-primary, #e5e5e7);
            margin: 0 0 10px 0;
        }

        .demo-header p {
            font-size: 16px;
            color: var(--text-secondary, rgba(255, 255, 255, 0.7));
            margin: 0;
        }

        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .demo-card {
            background: var(--card-background, rgba(0, 0, 0, 0.4));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 8px;
            padding: 20px;
        }

        .demo-card h3 {
            font-size: 18px;
            color: var(--text-primary, #e5e5e7);
            margin: 0 0 15px 0;
        }

        .demo-section {
            margin-bottom: 20px;
        }

        .demo-section h4 {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary, rgba(255, 255, 255, 0.7));
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .action-button {
            background: var(--accent-color, #007aff);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            margin-right: 10px;
            margin-bottom: 10px;
        }

        .action-button:hover {
            background: var(--accent-hover, #0051d5);
        }

        .action-button.secondary {
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .action-button.secondary:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .status-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-light, rgba(255, 255, 255, 0.05));
            font-size: 14px;
            color: var(--text-primary, #e5e5e7);
        }

        .status-item:last-child {
            border-bottom: none;
        }

        .status-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-badge.active {
            background: var(--success-background, rgba(52, 199, 89, 0.2));
            color: var(--success-color, #34c759);
        }

        .status-badge.inactive {
            background: var(--muted-background, rgba(255, 255, 255, 0.1));
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .event-log {
            background: var(--background-tertiary, rgba(0, 0, 0, 0.2));
            border-radius: 6px;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
        }

        .event-item {
            font-size: 13px;
            color: var(--text-secondary, rgba(255, 255, 255, 0.7));
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-light, rgba(255, 255, 255, 0.05));
        }

        .event-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .event-time {
            font-size: 11px;
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
        }

        .shared-state {
            font-family: monospace;
            font-size: 13px;
            background: var(--background-tertiary, rgba(0, 0, 0, 0.2));
            padding: 10px;
            border-radius: 4px;
            color: var(--text-primary, #e5e5e7);
        }

        .integration-status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 12px;
            background: var(--success-background, rgba(52, 199, 89, 0.2));
            color: var(--success-color, #34c759);
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
        }

        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;

    static properties = {
        modules: { type: Array },
        events: { type: Array },
        sharedState: { type: Object }
    };

    constructor() {
        super();
        this.modules = [];
        this.events = [];
        this.sharedState = {};
        this.maxEvents = 20;
    }

    connectedCallback() {
        super.connectedCallback();
        this.refreshStatus();
        this.setupEventListeners();
        
        // Refresh status periodically
        this.refreshInterval = setInterval(() => this.refreshStatus(), 5000);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    setupEventListeners() {
        // Listen for all integration events
        const eventTypes = Object.values(INTEGRATION_EVENTS);
        eventTypes.forEach(eventType => {
            limsIntegration.on('demo', eventType, (data, source) => {
                this.logEvent(eventType, data, source);
            });
        });
    }

    logEvent(eventType, data, source) {
        const event = {
            type: eventType,
            data,
            source,
            timestamp: new Date()
        };

        this.events = [event, ...this.events].slice(0, this.maxEvents);
        this.requestUpdate();
    }

    refreshStatus() {
        const status = limsIntegration.getStatus();
        this.modules = status.modules;
        
        // Get shared state
        this.sharedState = {};
        status.sharedStateKeys.forEach(key => {
            this.sharedState[key] = limsIntegration.sharedState(key);
        });
        
        this.requestUpdate();
    }

    // Demo actions
    async demoCreateTask() {
        const taskModule = limsIntegration.getModule('taskManagement');
        if (!taskModule) {
            alert('Task Management module not found. Please open the Tasks module first.');
            return;
        }

        try {
            const result = await limsIntegration.requestFromModule('taskManagement', 'createTask', {
                title: 'Integration Demo Task',
                description: 'This task was created via module integration',
                priority: 'high',
                labels: ['integration-demo']
            });
            
            console.log('Task created:', result);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error creating task: ' + error.message);
        }
    }

    async demoRequestStatistics() {
        try {
            const stats = await limsIntegration.requestFromModule('taskManagement', 'getStatistics', {});
            console.log('Task statistics:', stats);
            alert(`Task Statistics:\n
Total Tasks: ${stats.total}
By Status: ${JSON.stringify(stats.byStatus, null, 2)}
By Priority: ${JSON.stringify(stats.byPriority, null, 2)}
Overdue Tasks: ${stats.overdueTasks}`);
        } catch (error) {
            console.error('Error getting statistics:', error);
            alert('Error: Task Management module not available');
        }
    }

    demoUpdateSharedState() {
        const newProject = prompt('Enter project ID to set as active:');
        if (newProject) {
            limsIntegration.sharedState('activeProject', newProject);
            this.refreshStatus();
        }
    }

    demoBroadcastEvent() {
        limsIntegration.broadcastEvent('demo:test', {
            message: 'Hello from Integration Demo!',
            timestamp: new Date()
        });
    }

    demoCrossModuleAction() {
        limsIntegration.createCrossModuleAction('filter-sync', {
            filters: {
                status: 'in_progress',
                priority: 'high'
            },
            sourceModule: 'demo'
        });
    }

    formatEventData(data) {
        if (!data) return 'null';
        if (typeof data === 'string') return data;
        return JSON.stringify(data, null, 2).substring(0, 100) + '...';
    }

    render() {
        return html`
            <div class="demo-container">
                <div class="demo-header">
                    <h1>LIMS Module Integration Demo</h1>
                    <p>Demonstrates cross-module communication and data sharing capabilities</p>
                    <div class="integration-status">
                        <span class="status-indicator"></span>
                        Integration Hub Active
                    </div>
                </div>

                <div class="demo-grid">
                    <!-- Registered Modules -->
                    <div class="demo-card">
                        <h3>Registered Modules</h3>
                        <ul class="status-list">
                            ${this.modules.map(module => html`
                                <li class="status-item">
                                    <span>${module.id}</span>
                                    <span class="status-badge ${module.status}">
                                        ${module.status}
                                    </span>
                                </li>
                            `)}
                            ${this.modules.length === 0 ? html`
                                <li class="status-item">
                                    <span style="color: var(--text-muted, rgba(255, 255, 255, 0.5))">
                                        No modules registered yet
                                    </span>
                                </li>
                            ` : ''}
                        </ul>
                    </div>

                    <!-- Demo Actions -->
                    <div class="demo-card">
                        <h3>Integration Actions</h3>
                        
                        <div class="demo-section">
                            <h4>Cross-Module Requests</h4>
                            <button class="action-button" @click=${this.demoCreateTask}>
                                Create Task via Integration
                            </button>
                            <button class="action-button" @click=${this.demoRequestStatistics}>
                                Request Task Statistics
                            </button>
                        </div>

                        <div class="demo-section">
                            <h4>Shared State</h4>
                            <button class="action-button secondary" @click=${this.demoUpdateSharedState}>
                                Update Active Project
                            </button>
                            <button class="action-button secondary" @click=${this.demoBroadcastEvent}>
                                Broadcast Test Event
                            </button>
                        </div>

                        <div class="demo-section">
                            <h4>Cross-Module Actions</h4>
                            <button class="action-button secondary" @click=${this.demoCrossModuleAction}>
                                Sync Filters Across Modules
                            </button>
                        </div>
                    </div>

                    <!-- Shared State -->
                    <div class="demo-card">
                        <h3>Shared State</h3>
                        <div class="shared-state">
                            ${Object.entries(this.sharedState).map(([key, value]) => html`
                                <div>
                                    <strong>${key}:</strong> 
                                    ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                </div>
                            `)}
                        </div>
                    </div>

                    <!-- Event Log -->
                    <div class="demo-card">
                        <h3>Integration Events</h3>
                        <div class="event-log">
                            ${this.events.map(event => html`
                                <div class="event-item">
                                    <strong>${event.type}</strong> from ${event.source}<br>
                                    <span class="event-time">
                                        ${event.timestamp.toLocaleTimeString()}
                                    </span><br>
                                    <small>${this.formatEventData(event.data)}</small>
                                </div>
                            `)}
                            ${this.events.length === 0 ? html`
                                <div class="event-item">
                                    <span style="color: var(--text-muted, rgba(255, 255, 255, 0.5))">
                                        No events yet. Try some integration actions!
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('integration-demo', IntegrationDemo);