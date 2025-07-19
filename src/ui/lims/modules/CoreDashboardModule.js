import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';

/**
 * Core Dashboard Module
 * Provides overview metrics, analytics, and key insights
 * Foundation for Executive Dashboard with LEARN-X integration
 */
export class CoreDashboardModule extends LIMSModule {
    static styles = [
        LIMSModule.styles,
        css`
            .dashboard-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: 20px;
                padding: 0;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-bottom: 20px;
            }

            .metric-card {
                background: var(--card-background, rgba(0, 0, 0, 0.4));
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: var(--border-radius, 7px);
                padding: 20px;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }

            .metric-card:hover {
                background: var(--card-hover-background, rgba(0, 0, 0, 0.6));
                border-color: var(--accent-color, #007aff);
                transform: translateY(-2px);
            }

            .metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--accent-color, #007aff);
                opacity: 0.8;
            }

            .metric-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
            }

            .metric-title {
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                opacity: 0.9;
            }

            .metric-icon {
                width: 18px;
                height: 18px;
                opacity: 0.8;
            }

            .metric-value {
                font-size: 28px;
                font-weight: 700;
                margin: 8px 0;
                color: var(--accent-color, #007aff);
                line-height: 1;
            }

            .metric-label {
                font-size: 12px;
                text-transform: uppercase;
                opacity: 0.6;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            .metric-change {
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .metric-change.positive {
                color: #34c759;
            }

            .metric-change.negative {
                color: #ff3b30;
            }

            .metric-change.neutral {
                color: var(--text-color, #e5e5e7);
                opacity: 0.7;
            }

            .dashboard-sections {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
                flex: 1;
                min-height: 0;
            }

            .section-card {
                background: var(--card-background, rgba(0, 0, 0, 0.4));
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: var(--border-radius, 7px);
                padding: 20px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            }

            .section-title {
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .section-content {
                flex: 1;
                overflow-y: auto;
            }

            .recent-tasks {
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
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                flex-shrink: 0;
                position: relative;
            }

            .task-checkbox.completed {
                background: var(--accent-color, #007aff);
                border-color: var(--accent-color, #007aff);
            }

            .task-checkbox.completed::after {
                content: '✓';
                position: absolute;
                top: -2px;
                left: 1px;
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .task-text {
                flex: 1;
                font-size: 14px;
            }

            .task-priority {
                padding: 3px 6px;
                border-radius: 3px;
                font-size: 10px;
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

            .activity-feed {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .activity-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 8px 0;
            }

            .activity-icon {
                width: 32px;
                height: 32px;
                background: var(--accent-color, #007aff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .activity-content {
                flex: 1;
            }

            .activity-text {
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 4px;
            }

            .activity-time {
                font-size: 11px;
                opacity: 0.6;
            }

            .quick-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .quick-action-button {
                background: var(--card-background, rgba(0, 0, 0, 0.6));
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                color: var(--text-color, #e5e5e7);
                cursor: pointer;
                padding: 12px;
                border-radius: var(--border-radius, 7px);
                transition: all 0.2s;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                text-align: left;
            }

            .quick-action-button:hover {
                background: var(--accent-color, #007aff);
                border-color: var(--accent-color, #007aff);
                transform: translateY(-1px);
            }

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                text-align: center;
                opacity: 0.6;
            }

            .empty-icon {
                width: 48px;
                height: 48px;
                margin-bottom: 12px;
                opacity: 0.4;
            }

            .empty-text {
                font-size: 14px;
                margin-bottom: 4px;
            }

            .empty-subtext {
                font-size: 12px;
                opacity: 0.8;
            }

            /* Scrollbar styles */
            .section-content::-webkit-scrollbar {
                width: 6px;
            }

            .section-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .section-content::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
                border-radius: 3px;
            }

            .section-content::-webkit-scrollbar-thumb:hover {
                background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
            }
        `
    ];

    static properties = {
        viewMode: { type: String },
        metrics: { type: Object },
        recentTasks: { type: Array },
        recentActivity: { type: Array }
    };

    constructor() {
        super();
        this.moduleId = 'core-dashboard';
        this.displayName = 'Dashboard Overview';
        this.category = 'core';
        this.learnXIntegration = true;
        
        this.viewMode = 'overview'; // 'overview' or 'analytics'
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            activeProjects: 0,
            teamMembers: 0,
            completionRate: 0,
            avgTaskTime: 0
        };
        this.recentTasks = [];
        this.recentActivity = [];
    }

    async loadModuleData() {
        try {
            this.setLoading(true, 'Loading dashboard data...');
            
            if (window.api) {
                // Load dashboard data
                const [tasks, projects, teamCount] = await Promise.all([
                    window.api.lims.getTasks(),
                    window.api.lims.getProjects(),
                    window.api.lims.getTeamMembersCount()
                ]);
                
                // Calculate metrics
                const completedTasks = tasks.filter(t => t.status === 'done').length;
                const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
                
                this.metrics = {
                    totalTasks: tasks.length,
                    completedTasks,
                    activeProjects: projects.length,
                    teamMembers: teamCount,
                    completionRate,
                    avgTaskTime: 2.5 // TODO: Calculate from actual data
                };
                
                // Get recent tasks (last 5)
                this.recentTasks = tasks
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);
                
                // Generate sample activity (TODO: Replace with real activity feed)
                this.recentActivity = this.generateSampleActivity();
                
                console.log(`[CoreDashboard] Loaded dashboard data: ${tasks.length} tasks, ${projects.length} projects`);
            }
            
            this.setLoading(false);
        } catch (error) {
            this.handleError(error, 'Loading dashboard data');
        }
    }

    generateSampleActivity() {
        // TODO: Replace with real activity feed from database
        return [
            {
                id: 1,
                type: 'task_created',
                text: 'New task "Update documentation" created',
                time: '2 minutes ago',
                icon: 'plus'
            },
            {
                id: 2,
                type: 'task_completed',
                text: 'Task "Fix login bug" marked as completed',
                time: '15 minutes ago',
                icon: 'check'
            },
            {
                id: 3,
                type: 'project_updated',
                text: 'LEARN-X Platform project updated',
                time: '1 hour ago',
                icon: 'edit'
            }
        ];
    }

    handleTaskClick(task) {
        console.log('[CoreDashboard] Task clicked:', task);
        // Dispatch event to switch to task management module
        this.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { moduleId: 'task-management', data: { selectedTask: task } },
            bubbles: true
        }));
    }

    handleQuickAction(action) {
        console.log(`[CoreDashboard] Quick action: ${action}`);
        
        switch (action) {
            case 'create-task':
                this.dispatchEvent(new CustomEvent('navigate-to-module', {
                    detail: { moduleId: 'task-management', action: 'create-task' },
                    bubbles: true
                }));
                break;
            case 'view-analytics':
                this.viewMode = 'analytics';
                break;
            case 'manage-projects':
                // TODO: Navigate to project management
                break;
            default:
                console.log(`Unknown quick action: ${action}`);
        }
    }

    renderModuleIcon() {
        return html`
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="m9 9 3 3L22 4" />
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            </svg>
        `;
    }

    renderModuleContent() {
        if (this.viewMode === 'analytics') {
            return this.renderAnalyticsView();
        }
        
        return this.renderOverviewDashboard();
    }

    renderOverviewDashboard() {
        return html`
            <div class="dashboard-container">
                ${this.renderMetricsGrid()}
                ${this.renderDashboardSections()}
            </div>
        `;
    }

    renderMetricsGrid() {
        return html`
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        <div class="metric-title">
                            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            Tasks
                        </div>
                    </div>
                    <div class="metric-label">Total Tasks</div>
                    <div class="metric-value">${this.metrics.totalTasks}</div>
                    <div class="metric-change neutral">
                        ${this.metrics.completedTasks} completed
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <div class="metric-title">
                            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                            </svg>
                            Projects
                        </div>
                    </div>
                    <div class="metric-label">Active Projects</div>
                    <div class="metric-value">${this.metrics.activeProjects}</div>
                    <div class="metric-change positive">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                        </svg>
                        +2 this week
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <div class="metric-title">
                            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Team
                        </div>
                    </div>
                    <div class="metric-label">Team Members</div>
                    <div class="metric-value">${this.metrics.teamMembers}</div>
                    <div class="metric-change neutral">
                        All active
                    </div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <div class="metric-title">
                            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                            Performance
                        </div>
                    </div>
                    <div class="metric-label">Completion Rate</div>
                    <div class="metric-value">${this.metrics.completionRate}%</div>
                    <div class="metric-change positive">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                        </svg>
                        +5% this week
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboardSections() {
        return html`
            <div class="dashboard-sections">
                <div class="section-card">
                    <div class="section-header">
                        <div class="section-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            Recent Tasks
                        </div>
                    </div>
                    <div class="section-content">
                        ${this.renderRecentTasks()}
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <div class="section-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Quick Actions
                        </div>
                    </div>
                    <div class="section-content">
                        ${this.renderQuickActions()}
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentTasks() {
        if (!this.recentTasks.length) {
            return html`
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                    <div class="empty-text">No recent tasks</div>
                    <div class="empty-subtext">Create your first task to get started</div>
                </div>
            `;
        }

        return html`
            <div class="recent-tasks">
                ${this.recentTasks.map(task => html`
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

    renderQuickActions() {
        return html`
            <div class="quick-actions">
                <button class="quick-action-button" @click=${() => this.handleQuickAction('create-task')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create New Task
                </button>
                
                <button class="quick-action-button" @click=${() => this.handleQuickAction('view-analytics')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    View Analytics
                </button>
                
                <button class="quick-action-button" @click=${() => this.handleQuickAction('manage-projects')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                    </svg>
                    Manage Projects
                </button>
            </div>
        `;
    }

    renderAnalyticsView() {
        return html`
            <div class="dashboard-container">
                <div style="text-align: center; padding: 60px 20px; opacity: 0.6;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 16px; opacity: 0.4;">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <h3>Advanced Analytics Coming Soon</h3>
                    <p>Detailed analytics and reporting features will be available in the next update.</p>
                    <button class="quick-action-button" @click=${() => this.viewMode = 'overview'} style="margin-top: 16px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Back to Overview
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('core-dashboard-module', CoreDashboardModule);