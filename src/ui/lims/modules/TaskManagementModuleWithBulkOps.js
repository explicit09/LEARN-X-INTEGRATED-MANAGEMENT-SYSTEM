import { html } from '../../assets/lit-core-2.7.4.min.js';
import { TaskManagementModuleWithSearch } from './TaskManagementModuleWithSearch.js';
import { TaskBulkOperationsModule } from './taskManagement/bulk/TaskBulkOperationsModule.js';
import { taskEventBus, TASK_EVENTS } from './taskManagement/utils/TaskEventBus.js';
import { TaskSearchAndFilterIntegration } from './taskManagement/TaskSearchAndFilterIntegration.js';

// Define the bulk operations component
if (!customElements.get('task-bulk-operations-module')) {
    customElements.define('task-bulk-operations-module', TaskBulkOperationsModule);
}

/**
 * TaskManagementModuleWithBulkOps - Extends TaskManagementModuleWithSearch to add bulk operations
 * This wrapper adds bulk operations functionality without modifying the core module
 */
export class TaskManagementModuleWithBulkOps extends TaskManagementModuleWithSearch {
    static properties = {
        ...TaskManagementModuleWithSearch.properties,
        showBulkOperations: { type: Boolean }
    };

    constructor() {
        super();
        this.showBulkOperations = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupBulkOperationsListeners();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeBulkOperationsListeners();
    }

    setupBulkOperationsListeners() {
        // Listen for selection changes from parent
        this.boundHandleSelectionChange = this.handleSelectionChange.bind(this);
        taskEventBus.on(TASK_EVENTS.BULK_SELECTION_CHANGED, this.boundHandleSelectionChange);

        // Listen for refresh requests after bulk operations
        this.boundHandleTasksUpdated = this.handleTasksUpdated.bind(this);
        taskEventBus.on(TASK_EVENTS.TASKS_UPDATED, this.boundHandleTasksUpdated);
        taskEventBus.on(TASK_EVENTS.TASKS_DELETED, this.boundHandleTasksUpdated);

        // Listen for UI messages
        this.boundHandleShowMessage = this.handleShowMessage.bind(this);
        taskEventBus.on(TASK_EVENTS.SHOW_MESSAGE, this.boundHandleShowMessage);

        // Listen for clear selection
        this.boundHandleClearSelection = this.handleClearSelection.bind(this);
        taskEventBus.on(TASK_EVENTS.CLEAR_SELECTION, this.boundHandleClearSelection);
    }

    removeBulkOperationsListeners() {
        if (this.boundHandleSelectionChange) {
            taskEventBus.off(TASK_EVENTS.BULK_SELECTION_CHANGED, this.boundHandleSelectionChange);
        }
        if (this.boundHandleTasksUpdated) {
            taskEventBus.off(TASK_EVENTS.TASKS_UPDATED, this.boundHandleTasksUpdated);
            taskEventBus.off(TASK_EVENTS.TASKS_DELETED, this.boundHandleTasksUpdated);
        }
        if (this.boundHandleShowMessage) {
            taskEventBus.off(TASK_EVENTS.SHOW_MESSAGE, this.boundHandleShowMessage);
        }
        if (this.boundHandleClearSelection) {
            taskEventBus.off(TASK_EVENTS.CLEAR_SELECTION, this.boundHandleClearSelection);
        }
    }

    handleSelectionChange(event) {
        const selectedCount = event.detail?.count || 0;
        this.showBulkOperations = selectedCount > 0;
    }

    handleTasksUpdated() {
        // Reload tasks after bulk operations
        this.loadModuleData();
    }

    handleShowMessage(event) {
        const { type, message } = event.detail;
        // Show notification (you can customize this based on your notification system)
        console.log(`[${type}] ${message}`);
        // TODO: Integrate with your notification system
    }

    handleClearSelection() {
        this.selectedTasks = [];
        this.showBulkOperations = false;
    }

    // Updated method to handle task selection events
    updated(changedProperties) {
        super.updated(changedProperties);
        
        // Watch for selectedTasks changes
        if (changedProperties.has('selectedTasks')) {
            // Emit selection change event
            taskEventBus.emit(TASK_EVENTS.TASKS_SELECTED, {
                tasks: this.selectedTasks.map(id => this.tasks.find(t => t.id === id)).filter(Boolean)
            });
            
            this.showBulkOperations = this.selectedTasks.length > 0;
        }
    }

    // Override render to include bulk operations
    render() {
        // If in reporting view, delegate to parent's render method
        if (this.currentView === 'reporting') {
            console.log('[TaskManagementWithBulkOps] Delegating to parent for reporting view');
            // Use the parent's render method which will call renderModuleContent
            return super.render();
        }

        // Get filtered tasks if available, otherwise use all tasks
        const displayTasks = this.hasActiveFilters ? this.displayedTasks : this.tasks;
        
        return html`
            <div class="task-management-container">
                ${this.renderCommandPalette()}
                ${this.renderTemplatePanel()}
                ${TaskSearchAndFilterIntegration.renderSearchAndFilters()}
                ${this.renderToolbar()}
                ${this.showBulkOperations ? html`
                    <task-bulk-operations-module
                        .selectedTasks=${this.selectedTasks.map(id => this.tasks.find(t => t.id === id))}
                        .teamMembers=${this.teamMembers}
                    ></task-bulk-operations-module>
                ` : ''}
                <div class="task-content">
                    ${this.currentView === 'kanban' ? this.renderEnhancedKanbanView(displayTasks) : this.renderListView(displayTasks)}
                </div>
                ${this.renderKeyboardHint()}
                ${this.renderSelectionCount()}
                ${this.renderValidationErrors()}
            </div>
        `;
    }
}

customElements.define('task-management-module-with-bulk-ops', TaskManagementModuleWithBulkOps);