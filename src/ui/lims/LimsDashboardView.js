import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';

export class LimsDashboardView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: var(--main-content-background, rgba(0, 0, 0, 0.9));
            color: var(--text-color, #e5e5e7);
            overflow: hidden;
        }

        .dashboard-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .dashboard-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: var(--header-background, rgba(0, 0, 0, 0.8));
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .dashboard-title {
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .dashboard-title .icon {
            width: 24px;
            height: 24px;
            opacity: 0.8;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .icon-button {
            background: transparent;
            border: none;
            color: var(--icon-button-color, rgb(229, 229, 231));
            cursor: pointer;
            padding: 8px;
            border-radius: var(--border-radius, 7px);
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .dashboard-tabs {
            display: flex;
            gap: 4px;
            padding: 12px 24px;
            background: rgba(0, 0, 0, 0.4);
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .tab-button {
            background: transparent;
            border: none;
            color: var(--text-color, #e5e5e7);
            cursor: pointer;
            padding: 8px 16px;
            border-radius: var(--border-radius, 7px);
            transition: all 0.2s;
            font-size: 14px;
            font-weight: 500;
            opacity: 0.7;
        }

        .tab-button:hover {
            opacity: 1;
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .tab-button.active {
            opacity: 1;
            background: var(--focus-border-color, #007aff);
            color: white;
        }

        .dashboard-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }

        .module-card {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            padding: 20px;
            transition: all 0.2s;
        }

        .module-card:hover {
            background: rgba(0, 0, 0, 0.6);
            border-color: var(--focus-border-color, #007aff);
            transform: translateY(-2px);
        }

        .module-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .module-title {
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .module-content {
            font-size: 14px;
            line-height: 1.6;
            opacity: 0.8;
        }

        .metric-value {
            font-size: 32px;
            font-weight: 700;
            margin: 12px 0;
            color: var(--focus-border-color, #007aff);
        }

        .metric-label {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.6;
            letter-spacing: 0.5px;
        }

        .task-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .task-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .task-item:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(4px);
        }

        .task-checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            flex-shrink: 0;
        }

        .task-checkbox.completed {
            background: var(--focus-border-color, #007aff);
            border-color: var(--focus-border-color, #007aff);
        }

        .task-text {
            flex: 1;
            font-size: 14px;
        }

        .task-priority {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-high {
            background: rgba(255, 59, 48, 0.2);
            color: #ff3b30;
        }

        .priority-medium {
            background: rgba(255, 149, 0, 0.2);
            color: #ff9500;
        }

        .priority-low {
            background: rgba(52, 199, 89, 0.2);
            color: #34c759;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            opacity: 0.6;
        }

        .empty-state-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            opacity: 0.4;
        }

        .empty-state-text {
            font-size: 16px;
            margin-bottom: 8px;
        }

        .empty-state-subtext {
            font-size: 14px;
            opacity: 0.8;
        }

        /* Scrollbar styles */
        .dashboard-content::-webkit-scrollbar {
            width: 8px;
        }

        .dashboard-content::-webkit-scrollbar-track {
            background: var(--scrollbar-track, rgba(0, 0, 0, 0.2));
            border-radius: 4px;
        }

        .dashboard-content::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 4px;
        }

        .dashboard-content::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }
    `;

    static properties = {
        activeTab: { type: String },
        tasks: { type: Array },
        metrics: { type: Object }
    };

    constructor() {
        super();
        this.activeTab = 'overview';
        this.tasks = [];
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            activeProjects: 0,
            teamMembers: 0
        };
        this.loadDashboardData();
    }

    async loadDashboardData() {
        if (window.api) {
            try {
                // Load tasks from database
                const tasks = await window.api.lims.getTasks();
                this.tasks = tasks || [];
                
                // Calculate metrics
                this.metrics = {
                    totalTasks: this.tasks.length,
                    completedTasks: this.tasks.filter(t => t.status === 'done').length,
                    activeProjects: await window.api.lims.getActiveProjectsCount(),
                    teamMembers: await window.api.lims.getTeamMembersCount()
                };
            } catch (error) {
                console.error('[LIMS] Error loading dashboard data:', error);
            }
        }
    }

    handleTabChange(tab) {
        this.activeTab = tab;
    }

    async handleClose() {
        if (window.api) {
            await window.api.lims.closeDashboard();
        }
    }

    handleCreateTask() {
        // TODO: Open task creation dialog
        console.log('[LIMS] Create task clicked');
    }

    handleTaskClick(task) {
        // TODO: Open task details
        console.log('[LIMS] Task clicked:', task);
    }

    render() {
        return html`
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        LIMS Dashboard
                    </div>
                    <div class="header-actions">
                        <button class="icon-button" @click=${this.handleCreateTask} title="Create Task">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                        <button class="icon-button" @click=${this.handleClose} title="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="dashboard-tabs">
                    <button 
                        class="tab-button ${this.activeTab === 'overview' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('overview')}
                    >Overview</button>
                    <button 
                        class="tab-button ${this.activeTab === 'tasks' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('tasks')}
                    >Tasks</button>
                    <button 
                        class="tab-button ${this.activeTab === 'projects' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('projects')}
                    >Projects</button>
                    <button 
                        class="tab-button ${this.activeTab === 'analytics' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('analytics')}
                    >Analytics</button>
                </div>

                <div class="dashboard-content">
                    ${this.renderContent()}
                </div>
            </div>
        `;
    }

    renderContent() {
        switch (this.activeTab) {
            case 'overview':
                return this.renderOverview();
            case 'tasks':
                return this.renderTasks();
            case 'projects':
                return this.renderProjects();
            case 'analytics':
                return this.renderAnalytics();
            default:
                return html`<div>Unknown tab</div>`;
        }
    }

    renderOverview() {
        return html`
            <div class="module-grid">
                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            Tasks
                        </div>
                    </div>
                    <div class="module-content">
                        <div class="metric-value">${this.metrics.totalTasks}</div>
                        <div class="metric-label">Total Tasks</div>
                        <div style="margin-top: 8px; font-size: 14px; opacity: 0.8;">
                            ${this.metrics.completedTasks} completed
                        </div>
                    </div>
                </div>

                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                            </svg>
                            Projects
                        </div>
                    </div>
                    <div class="module-content">
                        <div class="metric-value">${this.metrics.activeProjects}</div>
                        <div class="metric-label">Active Projects</div>
                    </div>
                </div>

                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Team
                        </div>
                    </div>
                    <div class="module-content">
                        <div class="metric-value">${this.metrics.teamMembers}</div>
                        <div class="metric-label">Team Members</div>
                    </div>
                </div>
            </div>

            <div class="module-card">
                <div class="module-header">
                    <div class="module-title">Recent Tasks</div>
                </div>
                <div class="module-content">
                    ${this.renderTaskList(this.tasks.slice(0, 5))}
                </div>
            </div>
        `;
    }

    renderTasks() {
        return html`
            <div class="module-card">
                <div class="module-header">
                    <div class="module-title">All Tasks</div>
                </div>
                <div class="module-content">
                    ${this.renderTaskList(this.tasks)}
                </div>
            </div>
        `;
    }

    renderTaskList(tasks) {
        if (!tasks || tasks.length === 0) {
            return html`
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    <div class="empty-state-text">No tasks yet</div>
                    <div class="empty-state-subtext">Create your first task to get started</div>
                </div>
            `;
        }

        return html`
            <div class="task-list">
                ${tasks.map(task => html`
                    <div class="task-item" @click=${() => this.handleTaskClick(task)}>
                        <div class="task-checkbox ${task.status === 'done' ? 'completed' : ''}"></div>
                        <div class="task-text">${task.title}</div>
                        ${task.priority ? html`
                            <div class="task-priority priority-${task.priority}">${task.priority}</div>
                        ` : ''}
                    </div>
                `)}
            </div>
        `;
    }

    renderProjects() {
        return html`
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                </svg>
                <div class="empty-state-text">Projects view coming soon</div>
                <div class="empty-state-subtext">Manage your projects and sprints</div>
            </div>
        `;
    }

    renderAnalytics() {
        return html`
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <div class="empty-state-text">Analytics view coming soon</div>
                <div class="empty-state-subtext">Track your productivity and team performance</div>
            </div>
        `;
    }
}

customElements.define('lims-dashboard-view', LimsDashboardView);