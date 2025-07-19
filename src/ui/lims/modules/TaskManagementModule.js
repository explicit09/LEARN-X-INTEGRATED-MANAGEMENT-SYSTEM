import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { LIMSModule } from '../core/LIMSModule.js';

/**
 * Task Management Module - Flagship LIMS Module
 * Comprehensive task management system to replace ClickUp
 * Features: Kanban boards, sprint planning, real-time collaboration
 */
export class TaskManagementModule extends LIMSModule {
    static styles = [
        LIMSModule.styles,
        css`
            .task-management-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: 16px;
            }

            .task-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                background: var(--toolbar-background, rgba(0, 0, 0, 0.4));
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            }

            .toolbar-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .view-switcher {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 4px;
                gap: 2px;
            }

            .view-button {
                background: transparent;
                border: none;
                color: var(--text-color, #e5e5e7);
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 13px;
                font-weight: 500;
                opacity: 0.7;
            }

            .view-button:hover {
                opacity: 1;
                background: var(--hover-background, rgba(255, 255, 255, 0.1));
            }

            .view-button.active {
                opacity: 1;
                background: var(--accent-color, #007aff);
                color: white;
            }

            .toolbar-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .filter-dropdown {
                position: relative;
                display: inline-block;
            }

            .filter-button {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                color: var(--text-color, #e5e5e7);
                cursor: pointer;
                padding: 8px 12px;
                border-radius: var(--border-radius, 7px);
                transition: all 0.2s;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filter-button:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .create-task-button {
                background: var(--accent-color, #007aff);
                border: none;
                color: white;
                cursor: pointer;
                padding: 10px 16px;
                border-radius: var(--border-radius, 7px);
                transition: all 0.2s;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .create-task-button:hover {
                background: var(--accent-hover, #0056cc);
                transform: translateY(-1px);
            }

            .task-content {
                flex: 1;
                overflow: hidden;
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                background: var(--content-background, rgba(0, 0, 0, 0.3));
            }

            /* Kanban Board Styles */
            .kanban-board {
                display: flex;
                height: 100%;
                gap: 16px;
                padding: 16px;
                overflow-x: auto;
            }

            .kanban-column {
                min-width: 300px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                display: flex;
                flex-direction: column;
                height: fit-content;
                max-height: calc(100vh - 200px);
            }

            .kanban-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .column-title {
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .task-count {
                background: rgba(255, 255, 255, 0.2);
                color: var(--text-color, #e5e5e7);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }

            .kanban-tasks {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .task-card {
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: var(--border-radius, 7px);
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }

            .task-card:hover {
                background: rgba(0, 0, 0, 0.8);
                border-color: var(--accent-color, #007aff);
                transform: translateY(-2px);
            }

            .task-card.dragging {
                opacity: 0.5;
                transform: rotate(5deg);
            }

            .task-title {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                line-height: 1.3;
            }

            .task-description {
                font-size: 12px;
                opacity: 0.7;
                margin-bottom: 12px;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .task-meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 8px;
            }

            .task-priority {
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .priority-high {
                background: rgba(255, 59, 48, 0.2);
                color: #ff3b30;
                border: 1px solid rgba(255, 59, 48, 0.3);
            }

            .priority-medium {
                background: rgba(255, 149, 0, 0.2);
                color: #ff9500;
                border: 1px solid rgba(255, 149, 0, 0.3);
            }

            .priority-low {
                background: rgba(52, 199, 89, 0.2);
                color: #34c759;
                border: 1px solid rgba(52, 199, 89, 0.3);
            }

            .task-assignee {
                width: 24px;
                height: 24px;
                background: var(--accent-color, #007aff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                color: white;
            }

            .task-tags {
                display: flex;
                gap: 4px;
                margin-top: 8px;
                flex-wrap: wrap;
            }

            .task-tag {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color, #e5e5e7);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 500;
            }

            /* List View Styles */
            .task-list-view {
                padding: 16px;
                height: 100%;
                overflow-y: auto;
            }

            .task-list-header {
                display: grid;
                grid-template-columns: 3fr 1fr 1fr 1fr 120px;
                gap: 16px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: var(--border-radius, 7px);
                margin-bottom: 8px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                opacity: 0.8;
            }

            .task-list-item {
                display: grid;
                grid-template-columns: 3fr 1fr 1fr 1fr 120px;
                gap: 16px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                border-radius: var(--border-radius, 7px);
                margin-bottom: 4px;
                cursor: pointer;
                transition: all 0.2s;
                align-items: center;
            }

            .task-list-item:hover {
                background: rgba(0, 0, 0, 0.5);
                border-color: var(--accent-color, #007aff);
                transform: translateX(4px);
            }

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 60%;
                text-align: center;
                opacity: 0.6;
            }

            .empty-icon {
                width: 64px;
                height: 64px;
                margin-bottom: 16px;
                opacity: 0.4;
            }

            .empty-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .empty-subtitle {
                font-size: 14px;
                opacity: 0.8;
                margin-bottom: 24px;
            }

            /* Scrollbar styles */
            .kanban-tasks::-webkit-scrollbar,
            .task-list-view::-webkit-scrollbar {
                width: 6px;
            }

            .kanban-tasks::-webkit-scrollbar-track,
            .task-list-view::-webkit-scrollbar-track {
                background: transparent;
            }

            .kanban-tasks::-webkit-scrollbar-thumb,
            .task-list-view::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
                border-radius: 3px;
            }

            .kanban-tasks::-webkit-scrollbar-thumb:hover,
            .task-list-view::-webkit-scrollbar-thumb:hover {
                background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
            }
        `
    ];

    static properties = {
        currentView: { type: String },
        tasks: { type: Array },
        projects: { type: Array },
        filterStatus: { type: String },
        filterProject: { type: String },
        selectedTask: { type: Object }
    };

    constructor() {
        super();
        this.moduleId = 'task-management';
        this.displayName = 'Task Management';
        this.category = 'business';
        this.learnXIntegration = true;
        
        this.currentView = 'kanban';
        this.tasks = [];
        this.projects = [];
        this.filterStatus = 'all';
        this.filterProject = 'all';
        this.selectedTask = null;
        
        this.kanbanColumns = [
            { id: 'todo', title: 'To Do', status: 'todo' },
            { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
            { id: 'review', title: 'Review', status: 'review' },
            { id: 'done', title: 'Done', status: 'done' }
        ];
    }

    async loadModuleData() {
        try {
            this.setLoading(true, 'Loading tasks and projects...');
            
            if (window.api) {
                // Load tasks and projects from database
                const [tasks, projects] = await Promise.all([
                    window.api.lims.getTasks(),
                    window.api.lims.getProjects()
                ]);
                
                this.tasks = tasks || [];
                this.projects = projects || [];
                
                console.log(`[TaskManagement] Loaded ${this.tasks.length} tasks and ${this.projects.length} projects`);
            }
            
            this.setLoading(false);
        } catch (error) {
            this.handleError(error, 'Loading task data');
        }
    }

    handleViewChange(view) {
        this.currentView = view;
        console.log(`[TaskManagement] View changed to: ${view}`);
    }

    handleFilterChange(type, value) {
        if (type === 'status') {
            this.filterStatus = value;
        } else if (type === 'project') {
            this.filterProject = value;
        }
        console.log(`[TaskManagement] Filter changed: ${type} = ${value}`);
    }

    async handleCreateTask() {
        console.log('[TaskManagement] Create task clicked');
        // TODO: Open task creation modal
        // For now, create a sample task
        const newTask = {
            title: `New Task ${this.tasks.length + 1}`,
            description: 'Task created from LIMS dashboard',
            status: 'todo',
            priority: 'medium',
            assignee_id: 'current-user',
            project_id: this.projects[0]?.id || null
        };
        
        try {
            if (window.api) {
                const createdTask = await window.api.lims.createTask(newTask);
                this.tasks = [...this.tasks, createdTask];
                console.log('[TaskManagement] Task created:', createdTask);
            }
        } catch (error) {
            this.handleError(error, 'Creating task');
        }
    }

    handleTaskClick(task) {
        this.selectedTask = task;
        console.log('[TaskManagement] Task selected:', task);
        // TODO: Open task details modal
    }

    async handleTaskStatusChange(task, newStatus) {
        try {
            if (window.api) {
                const updatedTask = await window.api.lims.updateTask(task.id, { status: newStatus });
                
                // Update local task list
                this.tasks = this.tasks.map(t => 
                    t.id === task.id ? { ...t, status: newStatus } : t
                );
                
                console.log(`[TaskManagement] Task ${task.id} status changed to: ${newStatus}`);
            }
        } catch (error) {
            this.handleError(error, 'Updating task status');
        }
    }

    getTasksByStatus(status) {
        return this.tasks.filter(task => {
            const statusMatch = task.status === status;
            const projectMatch = this.filterProject === 'all' || task.project_id === this.filterProject;
            return statusMatch && projectMatch;
        });
    }

    renderModuleIcon() {
        return html`
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        `;
    }

    renderModuleActions() {
        return html`
            ${super.renderModuleActions()}
            <button class="action-button" @click=${this.handleCreateTask} title="Create Task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        `;
    }

    renderModuleContent() {
        if (!this.tasks.length && !this.loading) {
            return this.renderEmptyState();
        }

        return html`
            <div class="task-management-container">
                ${this.renderToolbar()}
                <div class="task-content">
                    ${this.currentView === 'kanban' ? this.renderKanbanView() : this.renderListView()}
                </div>
            </div>
        `;
    }

    renderToolbar() {
        return html`
            <div class="task-toolbar">
                <div class="toolbar-left">
                    <div class="view-switcher">
                        <button 
                            class="view-button ${this.currentView === 'kanban' ? 'active' : ''}"
                            @click=${() => this.handleViewChange('kanban')}
                        >
                            Kanban
                        </button>
                        <button 
                            class="view-button ${this.currentView === 'list' ? 'active' : ''}"
                            @click=${() => this.handleViewChange('list')}
                        >
                            List
                        </button>
                    </div>
                </div>
                
                <div class="toolbar-right">
                    <div class="filter-dropdown">
                        <button class="filter-button">
                            <span>All Projects</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <button class="create-task-button" @click=${this.handleCreateTask}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Task
                    </button>
                </div>
            </div>
        `;
    }

    renderKanbanView() {
        return html`
            <div class="kanban-board">
                ${this.kanbanColumns.map(column => this.renderKanbanColumn(column))}
            </div>
        `;
    }

    renderKanbanColumn(column) {
        const tasks = this.getTasksByStatus(column.status);
        
        return html`
            <div class="kanban-column">
                <div class="kanban-header">
                    <div class="column-title">
                        ${column.title}
                        <span class="task-count">${tasks.length}</span>
                    </div>
                </div>
                <div class="kanban-tasks">
                    ${tasks.map(task => this.renderTaskCard(task))}
                </div>
            </div>
        `;
    }

    renderTaskCard(task) {
        return html`
            <div class="task-card" @click=${() => this.handleTaskClick(task)}>
                <div class="task-title">${task.title}</div>
                ${task.description ? html`
                    <div class="task-description">${task.description}</div>
                ` : ''}
                
                <div class="task-meta">
                    ${task.priority ? html`
                        <div class="task-priority priority-${task.priority}">
                            ${task.priority}
                        </div>
                    ` : ''}
                    
                    ${task.assignee_id ? html`
                        <div class="task-assignee">
                            ${task.assignee_id.charAt(0).toUpperCase()}
                        </div>
                    ` : ''}
                </div>
                
                ${task.labels ? html`
                    <div class="task-tags">
                        ${task.labels.split(',').map(tag => html`
                            <span class="task-tag">${tag.trim()}</span>
                        `)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderListView() {
        return html`
            <div class="task-list-view">
                <div class="task-list-header">
                    <div>Task</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div>Assignee</div>
                    <div>Actions</div>
                </div>
                
                ${this.tasks.map(task => html`
                    <div class="task-list-item" @click=${() => this.handleTaskClick(task)}>
                        <div>
                            <div style="font-weight: 500; margin-bottom: 4px;">${task.title}</div>
                            ${task.description ? html`
                                <div style="font-size: 12px; opacity: 0.7;">${task.description}</div>
                            ` : ''}
                        </div>
                        <div>
                            <span class="task-priority priority-${task.status || 'low'}">${task.status || 'todo'}</span>
                        </div>
                        <div>
                            ${task.priority ? html`
                                <span class="task-priority priority-${task.priority}">${task.priority}</span>
                            ` : ''}
                        </div>
                        <div>
                            ${task.assignee_id ? html`
                                <div class="task-assignee">${task.assignee_id.charAt(0).toUpperCase()}</div>
                            ` : ''}
                        </div>
                        <div>
                            <button class="action-button" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    renderEmptyState() {
        return html`
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                <div class="empty-title">No Tasks Yet</div>
                <div class="empty-subtitle">Create your first task to start managing your work with LIMS</div>
                <button class="create-task-button" @click=${this.handleCreateTask}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create First Task
                </button>
            </div>
        `;
    }
}

customElements.define('task-management-module', TaskManagementModule);