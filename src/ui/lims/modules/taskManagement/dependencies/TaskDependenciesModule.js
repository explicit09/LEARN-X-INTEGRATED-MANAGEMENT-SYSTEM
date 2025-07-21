import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * TaskDependenciesModule - Manage task blocking/dependency relationships
 * Allows tasks to depend on other tasks being completed first
 */
export class TaskDependenciesModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .dependencies-container {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 16px;
        }

        .dependencies-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .dependencies-title {
            font-size: 14px;
            font-weight: 600;
            color: #e5e5e7;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .dependency-icon {
            width: 16px;
            height: 16px;
            opacity: 0.7;
        }

        .add-dependency-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #e5e5e7;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .add-dependency-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: #007aff;
        }

        .dependencies-section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .dependency-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .dependency-item {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s;
        }

        .dependency-item:hover {
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(0, 0, 0, 0.3);
        }

        .dependency-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .dependency-status.completed {
            background: #10b981;
        }

        .dependency-status.in-progress {
            background: #3b82f6;
        }

        .dependency-status.blocked {
            background: #ef4444;
        }

        .dependency-status.pending {
            background: rgba(255, 255, 255, 0.3);
        }

        .dependency-info {
            flex: 1;
            min-width: 0;
        }

        .dependency-task-title {
            font-size: 13px;
            color: #e5e5e7;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .dependency-task-meta {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .dependency-actions {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            background: transparent;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
            transition: all 0.2s;
            border-radius: 4px;
        }

        .action-btn:hover {
            color: rgba(255, 255, 255, 1);
            background: rgba(255, 255, 255, 0.1);
        }

        .remove-btn:hover {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
            text-align: center;
            padding: 24px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 13px;
        }

        .dependency-selector-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            backdrop-filter: blur(4px);
        }

        .dependency-selector-content {
            background: rgba(30, 30, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            width: 500px;
            max-width: 90vw;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .selector-header {
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .selector-title {
            font-size: 16px;
            font-weight: 600;
            color: #e5e5e7;
        }

        .close-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e7;
        }

        .selector-search {
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            color: #e5e5e7;
            outline: none;
        }

        .search-input:focus {
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.6);
        }

        .task-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .task-option {
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 4px;
        }

        .task-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .task-option.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .task-option-title {
            font-size: 14px;
            color: #e5e5e7;
            margin-bottom: 4px;
        }

        .task-option-meta {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        .circular-dependency-warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
            padding: 12px;
            border-radius: 6px;
            margin: 12px 20px;
            font-size: 13px;
        }
    `;

    static properties = {
        taskId: { type: String, attribute: 'task-id' },
        dependencies: { type: Array },
        dependents: { type: Array },
        allTasks: { type: Array },
        showSelector: { type: Boolean },
        searchQuery: { type: String },
        loading: { type: Boolean }
    };

    constructor() {
        super();
        this.taskId = null;
        this.dependencies = []; // Tasks this task depends on
        this.dependents = []; // Tasks that depend on this task
        this.allTasks = [];
        this.showSelector = false;
        this.searchQuery = '';
        this.loading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.taskId) {
            this.loadDependencies();
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('taskId') && this.taskId) {
            console.log('[TaskDependenciesModule] TaskId updated to:', this.taskId);
            this.loadDependencies();
        }
    }

    async loadDependencies() {
        this.loading = true;
        try {
            // Load all tasks for the selector
            if (window.api?.lims?.getTasks) {
                this.allTasks = await window.api.lims.getTasks();
            }

            // Load dependencies for this task
            if (window.api?.lims?.getTaskDependencies) {
                const deps = await window.api.lims.getTaskDependencies(this.taskId);
                this.dependencies = deps.dependencies || [];
                this.dependents = deps.dependents || [];
            } else {
                // Demo data
                this.dependencies = this.getDemoDependencies();
                this.dependents = this.getDemoDependents();
            }
        } catch (error) {
            console.error('[TaskDependencies] Error loading dependencies:', error);
        } finally {
            this.loading = false;
        }
    }

    getDemoDependencies() {
        // Demo dependencies - tasks this task depends on
        return [
            {
                id: 'dep-1',
                task_id: this.taskId,
                depends_on_task_id: 'task-1',
                task: {
                    id: 'task-1',
                    title: 'Setup development environment',
                    status: 'done',
                    assignee: { name: 'John Doe' }
                }
            },
            {
                id: 'dep-2',
                task_id: this.taskId,
                depends_on_task_id: 'task-2',
                task: {
                    id: 'task-2',
                    title: 'Create database schema',
                    status: 'in_progress',
                    assignee: { name: 'Jane Smith' }
                }
            }
        ];
    }

    getDemoDependents() {
        // Demo dependents - tasks that depend on this task
        return [
            {
                id: 'dep-3',
                task_id: 'task-3',
                depends_on_task_id: this.taskId,
                task: {
                    id: 'task-3',
                    title: 'Deploy to production',
                    status: 'todo',
                    assignee: { name: 'Bob Johnson' }
                }
            }
        ];
    }

    async openDependencySelector() {
        this.showSelector = true;
        this.searchQuery = '';
        
        // Reload tasks when opening selector to ensure we have the latest
        if (window.api?.lims?.getTasks && this.allTasks.length === 0) {
            this.loading = true;
            try {
                this.allTasks = await window.api.lims.getTasks();
                console.log('[TaskDependenciesModule] Loaded', this.allTasks.length, 'tasks for selector');
            } catch (error) {
                console.error('[TaskDependenciesModule] Error loading tasks:', error);
            } finally {
                this.loading = false;
            }
        }
    }

    closeSelector() {
        this.showSelector = false;
        this.searchQuery = '';
    }

    async addDependency(dependsOnTaskId) {
        console.log('[TaskDependencies] Adding dependency - taskId:', this.taskId, 'dependsOn:', dependsOnTaskId);
        
        if (!this.taskId) {
            console.error('[TaskDependencies] No taskId set, cannot add dependency');
            alert('Error: No task selected. Please try closing and reopening the task.');
            return;
        }
        
        // Check for circular dependency
        if (this.wouldCreateCircularDependency(dependsOnTaskId)) {
            alert('Cannot add this dependency as it would create a circular dependency');
            return;
        }

        try {
            if (window.api?.lims?.addTaskDependency) {
                await window.api.lims.addTaskDependency(this.taskId, dependsOnTaskId);
                // Reload dependencies after adding
                await this.loadDependencies();
            } else {
                // Demo mode - add locally
                const task = this.allTasks.find(t => t.id === dependsOnTaskId);
                if (task) {
                    this.dependencies = [...this.dependencies, {
                        id: Date.now().toString(),
                        task_id: this.taskId,
                        depends_on_task_id: dependsOnTaskId,
                        task: task
                    }];
                }
            }

            this.closeSelector();
            
            // Dispatch event to update task list
            console.log('[TaskDependencies] Dispatching dependencies-updated event');
            this.dispatchEvent(new CustomEvent('dependencies-updated', {
                detail: { taskId: this.taskId, dependencies: this.dependencies },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[TaskDependencies] Error adding dependency:', error);
            console.error('[TaskDependencies] Error details:', error.message, error.stack);
            alert(`Failed to add dependency: ${error.message || 'Unknown error'}`);
        }
    }

    async removeDependency(dependencyId) {
        console.log('[TaskDependencies] Removing dependency:', dependencyId);
        if (!confirm('Remove this dependency?')) {
            return;
        }

        try {
            if (window.api?.lims?.removeTaskDependency) {
                await window.api.lims.removeTaskDependency(dependencyId);
                // Reload dependencies after removal
                await this.loadDependencies();
            } else {
                // Demo mode - remove locally
                this.dependencies = this.dependencies.filter(d => d.id !== dependencyId);
            }

            // Dispatch event to update task list
            console.log('[TaskDependencies] Dispatching dependencies-updated event after removal');
            this.dispatchEvent(new CustomEvent('dependencies-updated', {
                detail: { taskId: this.taskId, dependencies: this.dependencies },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[TaskDependencies] Error removing dependency:', error);
            alert(`Failed to remove dependency: ${error.message || 'Unknown error'}`);
        }
    }

    wouldCreateCircularDependency(targetTaskId) {
        // Simple check - in production, you'd want a more thorough graph traversal
        return this.dependents.some(d => d.task_id === targetTaskId);
    }

    getTaskStatus(status) {
        const statusMap = {
            'done': 'completed',
            'in_progress': 'in-progress',
            'blocked': 'blocked',
            'todo': 'pending'
        };
        return statusMap[status] || 'pending';
    }

    getFilteredTasks() {
        if (!this.searchQuery) {
            return this.allTasks;
        }

        const query = this.searchQuery.toLowerCase();
        return this.allTasks.filter(task =>
            task.title.toLowerCase().includes(query) ||
            task.id.toLowerCase().includes(query)
        );
    }

    isTaskSelectable(task) {
        // Can't depend on self
        if (task.id === this.taskId) return false;

        // Can't depend on tasks already in dependencies
        if (this.dependencies && this.dependencies.some(d => d.depends_on_task_id === task.id)) return false;

        // Can't create circular dependencies
        if (this.wouldCreateCircularDependency(task.id)) return false;

        return true;
    }

    render() {
        return html`
            <div class="dependencies-container">
                <div class="dependencies-header">
                    <h3 class="dependencies-title">
                        <svg class="dependency-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        Task Dependencies
                    </h3>
                    <button class="add-dependency-btn" @click=${this.openDependencySelector}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Dependency
                    </button>
                </div>

                ${this.dependencies && this.dependencies.length > 0 ? html`
                    <div class="dependencies-section">
                        <div class="section-title">This task depends on</div>
                        <div class="dependency-list">
                            ${this.dependencies.map(dep => html`
                                <div class="dependency-item">
                                    <div class="dependency-status ${this.getTaskStatus(dep.task?.status)}"></div>
                                    <div class="dependency-info">
                                        <div class="dependency-task-title">${dep.task?.title || 'Unknown Task'}</div>
                                        <div class="dependency-task-meta">
                                            <span>${dep.task?.status || 'unknown'}</span>
                                            ${dep.task?.assignee ? html`
                                                <span>• ${dep.task.assignee.name}</span>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div class="dependency-actions">
                                        <button 
                                            class="action-btn remove-btn" 
                                            @click=${() => this.removeDependency(dep.id)}
                                            title="Remove dependency"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                ` : ''}

                ${this.dependents && this.dependents.length > 0 ? html`
                    <div class="dependencies-section">
                        <div class="section-title">Tasks that depend on this</div>
                        <div class="dependency-list">
                            ${this.dependents.map(dep => html`
                                <div class="dependency-item">
                                    <div class="dependency-status ${this.getTaskStatus(dep.task?.status)}"></div>
                                    <div class="dependency-info">
                                        <div class="dependency-task-title">${dep.task?.title || 'Unknown Task'}</div>
                                        <div class="dependency-task-meta">
                                            <span>${dep.task?.status || 'unknown'}</span>
                                            ${dep.task?.assignee ? html`
                                                <span>• ${dep.task.assignee.name}</span>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                ` : ''}

                ${(!this.dependencies || this.dependencies.length === 0) && (!this.dependents || this.dependents.length === 0) ? html`
                    <div class="empty-state">
                        No dependencies configured for this task
                    </div>
                ` : ''}
            </div>

            ${this.showSelector ? html`
                <div class="dependency-selector-modal" @click=${(e) => e.target === e.currentTarget && this.closeSelector()}>
                    <div class="dependency-selector-content">
                        <div class="selector-header">
                            <h3 class="selector-title">Add Task Dependency</h3>
                            <button class="close-btn" @click=${this.closeSelector}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div class="selector-search">
                            <input
                                type="text"
                                class="search-input"
                                placeholder="Search tasks..."
                                .value=${this.searchQuery}
                                @input=${(e) => this.searchQuery = e.target.value}
                            />
                        </div>

                        <div class="task-list">
                            ${this.loading ? html`
                                <div class="empty-state">Loading tasks...</div>
                            ` : this.allTasks.length === 0 ? html`
                                <div class="empty-state">No tasks found</div>
                            ` : this.getFilteredTasks().length === 0 ? html`
                                <div class="empty-state">No tasks match your search</div>
                            ` : this.getFilteredTasks().map(task => {
                                const selectable = this.isTaskSelectable(task);
                                return html`
                                    <div 
                                        class="task-option ${!selectable ? 'disabled' : ''}"
                                        @click=${() => selectable && this.addDependency(task.id)}
                                    >
                                        <div class="task-option-title">${task.title}</div>
                                        <div class="task-option-meta">
                                            ${task.project?.name || 'No project'} • ${task.status}
                                            ${!selectable ? ' • Cannot select' : ''}
                                        </div>
                                    </div>
                                `;
                            })}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('task-dependencies-module', TaskDependenciesModule);