import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskBulkOperationsModule - Bulk operations for multiple selected tasks
 * Features: Bulk status change, priority change, assignment, deletion, etc.
 */
export class TaskBulkOperationsModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .bulk-actions-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: var(--background-elevated, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: var(--border-radius, 7px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .selection-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-right: 16px;
            padding-right: 16px;
            border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .selection-count {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
        }

        .clear-selection {
            background: none;
            border: none;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 12px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .clear-selection:hover {
            color: var(--text-color, #e5e5e7);
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .action-group {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .bulk-action {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--button-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 6px 12px;
            border-radius: var(--border-radius, 7px);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .bulk-action:hover {
            background: var(--button-hover, rgba(255, 255, 255, 0.15));
            border-color: var(--border-hover, rgba(255, 255, 255, 0.3));
            transform: translateY(-1px);
        }

        .bulk-action svg {
            width: 16px;
            height: 16px;
        }

        .bulk-action.destructive {
            color: var(--error-color, #ef4444);
            border-color: var(--error-border, rgba(239, 68, 68, 0.3));
        }

        .bulk-action.destructive:hover {
            background: var(--error-background, rgba(239, 68, 68, 0.1));
            border-color: var(--error-border-hover, rgba(239, 68, 68, 0.5));
        }

        /* Dropdown menus */
        .dropdown {
            position: relative;
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 4px;
            min-width: 200px;
            background: var(--dropdown-background, rgba(0, 0, 0, 0.9));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-8px);
            pointer-events: none;
            transition: all 0.2s;
        }

        .dropdown-menu.active {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        .dropdown-header {
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: none;
            border: none;
            color: var(--text-color, #e5e5e7);
            font-size: 13px;
            cursor: pointer;
            width: 100%;
            text-align: left;
            transition: all 0.2s;
        }

        .dropdown-item:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .dropdown-item svg {
            width: 14px;
            height: 14px;
            opacity: 0.7;
        }

        .dropdown-divider {
            height: 1px;
            background: var(--border-color, rgba(255, 255, 255, 0.1));
            margin: 4px 0;
        }

        /* Status indicators */
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .status-indicator.todo { background: var(--status-todo, #6b7280); }
        .status-indicator.in_progress { background: var(--status-progress, #3b82f6); }
        .status-indicator.review { background: var(--status-review, #f59e0b); }
        .status-indicator.done { background: var(--status-done, #10b981); }

        /* Priority indicators */
        .priority-indicator {
            width: 8px;
            height: 8px;
            border-radius: 2px;
            flex-shrink: 0;
        }

        .priority-indicator.urgent { background: var(--priority-urgent, #ef4444); }
        .priority-indicator.high { background: var(--priority-high, #f97316); }
        .priority-indicator.medium { background: var(--priority-medium, #3b82f6); }
        .priority-indicator.low { background: var(--priority-low, #6b7280); }

        /* Assignee avatars */
        .assignee-avatar {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--avatar-background, #3b82f6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            flex-shrink: 0;
        }

        /* Loading state */
        .loading-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-top-color: var(--accent-color, #007aff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Confirmation dialog */
        .confirmation-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .confirmation-dialog {
            background: var(--background-elevated, rgba(0, 0, 0, 0.9));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            padding: 24px;
            max-width: 400px;
            animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .confirmation-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
            margin-bottom: 8px;
        }

        .confirmation-message {
            font-size: 14px;
            color: var(--text-muted, rgba(255, 255, 255, 0.7));
            margin-bottom: 24px;
            line-height: 1.5;
        }

        .confirmation-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .confirmation-button {
            padding: 8px 16px;
            border-radius: var(--border-radius, 7px);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .confirmation-button.cancel {
            background: var(--button-background, rgba(255, 255, 255, 0.1));
            color: var(--text-color, #e5e5e7);
        }

        .confirmation-button.cancel:hover {
            background: var(--button-hover, rgba(255, 255, 255, 0.15));
        }

        .confirmation-button.confirm {
            background: var(--error-color, #ef4444);
            color: white;
        }

        .confirmation-button.confirm:hover {
            background: var(--error-hover, #dc2626);
        }
    `;

    static properties = {
        selectedTasks: { type: Array },
        activeDropdown: { type: String },
        isProcessing: { type: Boolean },
        showConfirmation: { type: Boolean },
        confirmationAction: { type: Object },
        teamMembers: { type: Array }
    };

    constructor() {
        super();
        this.selectedTasks = [];
        this.activeDropdown = null;
        this.isProcessing = false;
        this.showConfirmation = false;
        this.confirmationAction = null;
        this.teamMembers = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupEventListeners();
        this.loadTeamMembers();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Listen for selection changes
        taskEventBus.on(TASK_EVENTS.TASKS_SELECTED, (event) => {
            this.selectedTasks = event.detail.tasks || [];
        });

        // Close dropdowns on outside click
        this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this.boundHandleOutsideClick);
    }

    removeEventListeners() {
        if (this.boundHandleOutsideClick) {
            document.removeEventListener('click', this.boundHandleOutsideClick);
        }
    }

    async loadTeamMembers() {
        try {
            this.teamMembers = await window.api.lims.getTeamMembers();
        } catch (error) {
            console.error('[TaskBulkOperationsModule] Error loading team members:', error);
            this.teamMembers = [];
        }
    }

    handleOutsideClick(event) {
        if (!this.shadowRoot.contains(event.composedPath()[0])) {
            this.activeDropdown = null;
        }
    }

    toggleDropdown(dropdownName, event) {
        event.stopPropagation();
        this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
    }

    clearSelection() {
        taskEventBus.emit(TASK_EVENTS.CLEAR_SELECTION);
        this.selectedTasks = [];
    }

    async updateStatus(status) {
        this.activeDropdown = null;
        await this.performBulkUpdate({ status }, `status to ${status}`);
    }

    async updatePriority(priority) {
        this.activeDropdown = null;
        await this.performBulkUpdate({ priority }, `priority to ${priority}`);
    }

    async assignTo(assigneeId, assigneeName) {
        this.activeDropdown = null;
        await this.performBulkUpdate({ assignee_id: assigneeId }, `to ${assigneeName}`);
    }

    async addLabels() {
        // TODO: Implement label management UI
        console.log('[TaskBulkOperationsModule] Label management not yet implemented');
    }

    async moveToProject() {
        // TODO: Implement project selection UI
        console.log('[TaskBulkOperationsModule] Project move not yet implemented');
    }

    async archiveTasks() {
        this.activeDropdown = null;
        await this.performBulkUpdate({ archived: true }, 'as archived');
    }

    confirmDelete() {
        this.confirmationAction = {
            type: 'delete',
            title: 'Delete Tasks',
            message: `Are you sure you want to delete ${this.selectedTasks.length} task${this.selectedTasks.length > 1 ? 's' : ''}? This action cannot be undone.`,
            action: () => this.deleteTasks()
        };
        this.showConfirmation = true;
    }

    async deleteTasks() {
        this.showConfirmation = false;
        this.isProcessing = true;

        try {
            const promises = this.selectedTasks.map(task => 
                window.api.lims.deleteTask(task.id)
            );

            await Promise.all(promises);

            // Emit success event
            taskEventBus.emit(TASK_EVENTS.TASKS_DELETED, {
                count: this.selectedTasks.length
            });

            // Clear selection
            this.clearSelection();

            // Show success message
            this.showSuccessMessage(`Deleted ${this.selectedTasks.length} task${this.selectedTasks.length > 1 ? 's' : ''}`);
        } catch (error) {
            console.error('[TaskBulkOperationsModule] Error deleting tasks:', error);
            this.showErrorMessage('Failed to delete some tasks');
        } finally {
            this.isProcessing = false;
        }
    }

    async performBulkUpdate(updates, description) {
        this.isProcessing = true;

        try {
            const promises = this.selectedTasks.map(task => 
                window.api.lims.updateTask(task.id, {
                    ...updates,
                    user_name: 'Bulk Update' // For activity tracking
                })
            );

            await Promise.all(promises);

            // Emit success event
            taskEventBus.emit(TASK_EVENTS.TASKS_UPDATED, {
                tasks: this.selectedTasks,
                updates
            });

            // Show success message
            this.showSuccessMessage(`Updated ${description} for ${this.selectedTasks.length} task${this.selectedTasks.length > 1 ? 's' : ''}`);
        } catch (error) {
            console.error('[TaskBulkOperationsModule] Error updating tasks:', error);
            this.showErrorMessage('Failed to update some tasks');
        } finally {
            this.isProcessing = false;
        }
    }

    showSuccessMessage(message) {
        // Emit event for parent to handle
        taskEventBus.emit(TASK_EVENTS.SHOW_MESSAGE, {
            type: 'success',
            message
        });
    }

    showErrorMessage(message) {
        // Emit event for parent to handle
        taskEventBus.emit(TASK_EVENTS.SHOW_MESSAGE, {
            type: 'error',
            message
        });
    }

    cancelConfirmation() {
        this.showConfirmation = false;
        this.confirmationAction = null;
    }

    executeConfirmation() {
        if (this.confirmationAction?.action) {
            this.confirmationAction.action();
        }
    }

    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    generateAvatarColor(name) {
        if (!name) return '#6b7280';
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6',
            '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
            '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
            '#f43f5e'
        ];
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    render() {
        if (this.selectedTasks.length === 0) {
            return html``;
        }

        return html`
            <div class="bulk-actions-bar">
                <div class="selection-info">
                    <span class="selection-count">${this.selectedTasks.length} selected</span>
                    <button class="clear-selection" @click=${this.clearSelection}>
                        Clear
                    </button>
                </div>

                <div class="action-group">
                    <!-- Status -->
                    <div class="dropdown">
                        <button 
                            class="bulk-action" 
                            @click=${(e) => this.toggleDropdown('status', e)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9 12l2 2 4-4"></path>
                            </svg>
                            Status
                        </button>
                        <div class="dropdown-menu ${this.activeDropdown === 'status' ? 'active' : ''}">
                            <div class="dropdown-header">Change Status</div>
                            <button class="dropdown-item" @click=${() => this.updateStatus('todo')}>
                                <span class="status-indicator todo"></span>
                                To Do
                            </button>
                            <button class="dropdown-item" @click=${() => this.updateStatus('in_progress')}>
                                <span class="status-indicator in_progress"></span>
                                In Progress
                            </button>
                            <button class="dropdown-item" @click=${() => this.updateStatus('review')}>
                                <span class="status-indicator review"></span>
                                Review
                            </button>
                            <button class="dropdown-item" @click=${() => this.updateStatus('done')}>
                                <span class="status-indicator done"></span>
                                Done
                            </button>
                        </div>
                    </div>

                    <!-- Priority -->
                    <div class="dropdown">
                        <button 
                            class="bulk-action" 
                            @click=${(e) => this.toggleDropdown('priority', e)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"></path>
                            </svg>
                            Priority
                        </button>
                        <div class="dropdown-menu ${this.activeDropdown === 'priority' ? 'active' : ''}">
                            <div class="dropdown-header">Change Priority</div>
                            <button class="dropdown-item" @click=${() => this.updatePriority('urgent')}>
                                <span class="priority-indicator urgent"></span>
                                Urgent
                            </button>
                            <button class="dropdown-item" @click=${() => this.updatePriority('high')}>
                                <span class="priority-indicator high"></span>
                                High
                            </button>
                            <button class="dropdown-item" @click=${() => this.updatePriority('medium')}>
                                <span class="priority-indicator medium"></span>
                                Medium
                            </button>
                            <button class="dropdown-item" @click=${() => this.updatePriority('low')}>
                                <span class="priority-indicator low"></span>
                                Low
                            </button>
                        </div>
                    </div>

                    <!-- Assign -->
                    <div class="dropdown">
                        <button 
                            class="bulk-action" 
                            @click=${(e) => this.toggleDropdown('assign', e)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <path d="M20 8v6m3-3h-6"></path>
                            </svg>
                            Assign
                        </button>
                        <div class="dropdown-menu ${this.activeDropdown === 'assign' ? 'active' : ''}">
                            <div class="dropdown-header">Assign To</div>
                            <button class="dropdown-item" @click=${() => this.assignTo(null, 'Unassigned')}>
                                <span class="assignee-avatar" style="background: #6b7280">-</span>
                                Unassigned
                            </button>
                            <div class="dropdown-divider"></div>
                            ${this.teamMembers.map(member => html`
                                <button 
                                    class="dropdown-item" 
                                    @click=${() => this.assignTo(member.id, member.name)}
                                >
                                    <span 
                                        class="assignee-avatar" 
                                        style="background: ${this.generateAvatarColor(member.name)}"
                                    >
                                        ${this.getInitials(member.name)}
                                    </span>
                                    ${member.name}
                                </button>
                            `)}
                        </div>
                    </div>

                    <!-- More actions -->
                    <div class="dropdown">
                        <button 
                            class="bulk-action" 
                            @click=${(e) => this.toggleDropdown('more', e)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                        <div class="dropdown-menu ${this.activeDropdown === 'more' ? 'active' : ''}">
                            <button class="dropdown-item" @click=${this.addLabels}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                Add Labels
                            </button>
                            <button class="dropdown-item" @click=${this.moveToProject}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                Move to Project
                            </button>
                            <button class="dropdown-item" @click=${this.archiveTasks}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 8v13H3V8m18 0l-1.5-4.5A2 2 0 0 0 17.5 2h-11a2 2 0 0 0-1.9 1.5L3 8"></path>
                                    <path d="M10 12h4"></path>
                                </svg>
                                Archive
                            </button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item" @click=${this.confirmDelete}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                ${this.isProcessing ? html`
                    <div class="loading-spinner"></div>
                ` : ''}
            </div>

            ${this.showConfirmation ? html`
                <div class="confirmation-overlay" @click=${this.cancelConfirmation}>
                    <div class="confirmation-dialog" @click=${(e) => e.stopPropagation()}>
                        <div class="confirmation-title">${this.confirmationAction?.title}</div>
                        <div class="confirmation-message">${this.confirmationAction?.message}</div>
                        <div class="confirmation-actions">
                            <button class="confirmation-button cancel" @click=${this.cancelConfirmation}>
                                Cancel
                            </button>
                            <button class="confirmation-button confirm" @click=${this.executeConfirmation}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('task-bulk-operations-module', TaskBulkOperationsModule);