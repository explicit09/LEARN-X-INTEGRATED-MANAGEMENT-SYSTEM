import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskProjectMoveModule - UI for moving tasks between projects
 * Allows users to select tasks and move them to a different project
 */
export class TaskProjectMoveModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .move-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--background-primary, rgba(0, 0, 0, 0.95));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            padding: 24px;
            width: 90%;
            max-width: 480px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            backdrop-filter: blur(5px);
        }

        .dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .dialog-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary, #e5e5e7);
        }

        .close-button {
            background: none;
            border: none;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .close-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
            color: var(--text-primary, #e5e5e7);
        }

        .dialog-content {
            margin-bottom: 20px;
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, #e5e5e7);
            margin-bottom: 12px;
        }

        .info-text {
            font-size: 14px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            margin-bottom: 16px;
            line-height: 1.5;
        }

        .tasks-summary {
            background: var(--background-secondary, rgba(0, 0, 0, 0.4));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: var(--text-primary, #e5e5e7);
            margin-bottom: 4px;
        }

        .summary-item:last-child {
            margin-bottom: 0;
        }

        .summary-value {
            font-weight: 600;
            color: var(--accent-color, #007aff);
        }

        .project-select {
            width: 100%;
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-primary, #e5e5e7);
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .project-select:hover {
            border-color: var(--border-hover, rgba(255, 255, 255, 0.3));
        }

        .project-select:focus {
            outline: none;
            border-color: var(--accent-color, #007aff);
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
        }

        .project-select option {
            background: var(--background-primary, #000);
            color: var(--text-primary, #e5e5e7);
            padding: 8px;
        }

        .options-section {
            background: var(--background-tertiary, rgba(0, 0, 0, 0.2));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 6px;
            padding: 16px;
        }

        .option-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }

        .option-row:last-child {
            margin-bottom: 0;
        }

        .option-checkbox {
            width: 18px;
            height: 18px;
            margin-right: 10px;
            cursor: pointer;
        }

        .option-label {
            font-size: 13px;
            color: var(--text-primary, #e5e5e7);
            cursor: pointer;
            user-select: none;
            flex: 1;
        }

        .option-description {
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            margin-left: 28px;
            margin-top: 4px;
        }

        .dialog-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .button {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .button-secondary {
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            color: var(--text-primary, #e5e5e7);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .button-secondary:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
            border-color: var(--border-hover, rgba(255, 255, 255, 0.3));
        }

        .button-primary {
            background: var(--accent-color, #007aff);
            color: white;
        }

        .button-primary:hover {
            background: var(--accent-hover, #0051d5);
        }

        .button-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .warning-message {
            background: var(--warning-background, rgba(255, 159, 10, 0.1));
            border: 1px solid var(--warning-color, #ff9f0a);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            color: var(--warning-color, #ff9f0a);
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }

        .warning-icon {
            font-size: 16px;
            flex-shrink: 0;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .error {
            text-align: center;
            padding: 40px;
            color: var(--error-color, #ff3b30);
        }
    `;

    static properties = {
        isOpen: { type: Boolean },
        selectedTasks: { type: Array },
        projects: { type: Array },
        selectedProjectId: { type: String },
        options: { type: Object },
        loading: { type: Boolean },
        error: { type: String }
    };

    constructor() {
        super();
        this.isOpen = false;
        this.selectedTasks = [];
        this.projects = [];
        this.selectedProjectId = '';
        this.options = {
            moveSubtasks: true,
            updateDependencies: true,
            notifyAssignees: false
        };
        this.loading = false;
        this.error = null;
    }

    async open(selectedTasks) {
        console.log('[ProjectMove] Opening with tasks:', selectedTasks);
        this.selectedTasks = selectedTasks;
        this.isOpen = true;
        this.error = null;
        
        // Load projects
        await this.loadProjects();
    }

    close() {
        this.isOpen = false;
        this.selectedTasks = [];
        this.selectedProjectId = '';
        this.error = null;
    }

    async loadProjects() {
        this.loading = true;
        try {
            if (window.api?.lims?.getProjects) {
                const projects = await window.api.lims.getProjects();
                this.projects = projects;
                
                // Pre-select first project that's different from current
                const currentProjectId = this.selectedTasks[0]?.project_id;
                const differentProject = projects.find(p => p.id !== currentProjectId);
                if (differentProject) {
                    this.selectedProjectId = differentProject.id;
                }
            }
        } catch (error) {
            console.error('[ProjectMove] Error loading projects:', error);
            this.error = 'Failed to load projects';
        } finally {
            this.loading = false;
        }
    }

    handleProjectChange(event) {
        this.selectedProjectId = event.target.value;
    }

    handleOptionChange(option, event) {
        this.options = {
            ...this.options,
            [option]: event.target.checked
        };
    }

    async handleMove() {
        if (!this.selectedProjectId) {
            this.error = 'Please select a target project';
            return;
        }

        this.loading = true;
        this.error = null;

        try {
            const taskIds = this.selectedTasks.map(t => t.id);
            console.log('[ProjectMove] Moving tasks:', taskIds, 'to project:', this.selectedProjectId);

            // Move tasks to the new project
            for (const taskId of taskIds) {
                await window.api.lims.updateTask(taskId, {
                    project_id: this.selectedProjectId
                });
            }

            // Handle subtasks if option is selected
            if (this.options.moveSubtasks) {
                const subtasks = await this.getSubtasks(taskIds);
                for (const subtask of subtasks) {
                    await window.api.lims.updateTask(subtask.id, {
                        project_id: this.selectedProjectId
                    });
                }
            }

            // Emit success event
            taskEventBus.emit(TASK_EVENTS.TASKS_UPDATED, {
                tasks: this.selectedTasks,
                changes: { project_id: this.selectedProjectId }
            });

            // Show success message
            taskEventBus.emit(TASK_EVENTS.SHOW_MESSAGE, {
                type: 'success',
                message: `Successfully moved ${taskIds.length} task(s) to the new project`
            });

            this.close();
        } catch (error) {
            console.error('[ProjectMove] Error moving tasks:', error);
            this.error = 'Failed to move tasks. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    async getSubtasks(parentTaskIds) {
        try {
            const allTasks = await window.api.lims.getTasks();
            return allTasks.filter(task => 
                task.parent_task_id && parentTaskIds.includes(task.parent_task_id)
            );
        } catch (error) {
            console.error('[ProjectMove] Error fetching subtasks:', error);
            return [];
        }
    }

    getTasksSummary() {
        const summary = {
            total: this.selectedTasks.length,
            byStatus: {},
            byPriority: {}
        };

        this.selectedTasks.forEach(task => {
            // Count by status
            summary.byStatus[task.status] = (summary.byStatus[task.status] || 0) + 1;
            
            // Count by priority
            summary.byPriority[task.priority] = (summary.byPriority[task.priority] || 0) + 1;
        });

        return summary;
    }

    render() {
        if (!this.isOpen) {
            return html``;
        }

        const summary = this.getTasksSummary();
        const currentProjectId = this.selectedTasks[0]?.project_id;
        const availableProjects = this.projects.filter(p => p.id !== currentProjectId);

        return html`
            <div class="dialog-overlay" @click=${() => this.close()}></div>
            <div class="move-dialog" @click=${(e) => e.stopPropagation()}>
                <div class="dialog-header">
                    <h3 class="dialog-title">Move Tasks to Another Project</h3>
                    <button class="close-button" @click=${() => this.close()}>×</button>
                </div>

                ${this.loading ? html`
                    <div class="loading">Loading...</div>
                ` : this.error ? html`
                    <div class="error">${this.error}</div>
                ` : html`
                    <div class="dialog-content">
                        <div class="section">
                            <div class="info-text">
                                Move ${summary.total} selected task${summary.total !== 1 ? 's' : ''} to a different project.
                            </div>
                            
                            <div class="tasks-summary">
                                <div class="summary-item">
                                    <span>Total tasks:</span>
                                    <span class="summary-value">${summary.total}</span>
                                </div>
                                ${Object.entries(summary.byStatus).map(([status, count]) => html`
                                    <div class="summary-item">
                                        <span>${status}:</span>
                                        <span class="summary-value">${count}</span>
                                    </div>
                                `)}
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">Target Project</div>
                            <select 
                                class="project-select"
                                .value=${this.selectedProjectId}
                                @change=${this.handleProjectChange}
                            >
                                <option value="">Select a project...</option>
                                ${availableProjects.map(project => html`
                                    <option value="${project.id}">${project.name}</option>
                                `)}
                            </select>
                        </div>

                        <div class="section">
                            <div class="section-title">Options</div>
                            <div class="options-section">
                                <div class="option-row">
                                    <input 
                                        type="checkbox" 
                                        id="moveSubtasks"
                                        class="option-checkbox"
                                        ?checked=${this.options.moveSubtasks}
                                        @change=${(e) => this.handleOptionChange('moveSubtasks', e)}
                                    />
                                    <label for="moveSubtasks" class="option-label">
                                        Move subtasks
                                    </label>
                                </div>
                                <div class="option-description">
                                    Also move all subtasks of the selected tasks
                                </div>

                                <div class="option-row">
                                    <input 
                                        type="checkbox" 
                                        id="updateDependencies"
                                        class="option-checkbox"
                                        ?checked=${this.options.updateDependencies}
                                        @change=${(e) => this.handleOptionChange('updateDependencies', e)}
                                    />
                                    <label for="updateDependencies" class="option-label">
                                        Update dependencies
                                    </label>
                                </div>
                                <div class="option-description">
                                    Update task dependencies to maintain relationships
                                </div>

                                <div class="option-row">
                                    <input 
                                        type="checkbox" 
                                        id="notifyAssignees"
                                        class="option-checkbox"
                                        ?checked=${this.options.notifyAssignees}
                                        @change=${(e) => this.handleOptionChange('notifyAssignees', e)}
                                    />
                                    <label for="notifyAssignees" class="option-label">
                                        Notify assignees
                                    </label>
                                </div>
                                <div class="option-description">
                                    Send notifications to task assignees about the move
                                </div>
                            </div>
                        </div>

                        ${this.selectedProjectId && this.options.updateDependencies ? html`
                            <div class="warning-message">
                                <span class="warning-icon">⚠️</span>
                                <div>
                                    Moving tasks with dependencies may affect task relationships. 
                                    Dependencies to tasks in other projects will be maintained.
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `}

                <div class="dialog-footer">
                    <button class="button button-secondary" @click=${() => this.close()}>
                        Cancel
                    </button>
                    <button 
                        class="button button-primary" 
                        @click=${() => this.handleMove()}
                        ?disabled=${!this.selectedProjectId || this.loading}
                    >
                        Move Tasks
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('task-project-move-module', TaskProjectMoveModule);