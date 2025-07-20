import { html, css } from '../../assets/lit-core-2.7.4.min.js';
import { TaskManagementModuleEnhanced } from './TaskManagementModuleEnhanced.js';
import './taskManagement/search/TaskSearchModule.js';
import './taskManagement/filters/TaskFilterModule.js';
import { createTaskManagementIntegration } from './taskManagement/TaskManagementIntegration.js';
import { taskEventBus, TASK_EVENTS } from './taskManagement/utils/TaskEventBus.js';

/**
 * TaskManagementModuleWithSearch - Extends the enhanced module with modular search and filtering
 * This wrapper adds search, filters, and other modular features without modifying the core module
 */
export class TaskManagementModuleWithSearch extends TaskManagementModuleEnhanced {
    static styles = [
        TaskManagementModuleEnhanced.styles,
        css`
            /* Additional styles for search and filter integration */
            .enhanced-toolbar {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                background: var(--toolbar-background, rgba(0, 0, 0, 0.4));
                border-radius: var(--border-radius, 7px);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            }

            .toolbar-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
            }

            .toolbar-row.search-row {
                flex-wrap: nowrap;
            }

            .search-container {
                flex: 1;
                max-width: 500px;
            }

            .filter-container {
                flex: 1;
            }

            .toolbar-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Results info bar */
            .results-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 16px;
                background: var(--info-background, rgba(0, 122, 255, 0.1));
                border-radius: var(--border-radius, 7px);
                font-size: 13px;
                color: var(--text-color, #e5e5e7);
                margin: -8px 16px 8px 16px;
            }

            .results-count {
                font-weight: 500;
            }

            .clear-filters {
                color: var(--accent-color, #007aff);
                cursor: pointer;
                text-decoration: underline;
            }

            .clear-filters:hover {
                opacity: 0.8;
            }

            /* Loading overlay */
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }

            .loading-overlay.visible {
                opacity: 1;
                pointer-events: auto;
            }
        `
    ];

    static properties = {
        ...TaskManagementModuleEnhanced.properties,
        isSearching: { type: Boolean },
        searchResultsCount: { type: Number },
        hasActiveFilters: { type: Boolean },
        displayedTasks: { type: Array }
    };

    constructor() {
        super();
        this.integration = null;
        this.isSearching = false;
        this.searchResultsCount = 0;
        this.hasActiveFilters = false;
        this.displayedTasks = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.initializeIntegration();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.integration) {
            this.integration.destroy();
        }
    }

    /**
     * Initialize the modular integration
     */
    async initializeIntegration() {
        // Create integration instance
        this.integration = createTaskManagementIntegration(this);
        
        // Ensure tasks are loaded first
        if (!this.tasks || this.tasks.length === 0) {
            await this.loadModuleData();
        }
        
        // Initialize with current tasks
        this.integration.initialize(this.tasks);
        
        // Listen for search/filter updates
        taskEventBus.on(TASK_EVENTS.SEARCH_RESULTS_UPDATED, () => {
            this.isSearching = false;
            this.updateResultsInfo();
        });
        
        taskEventBus.on(TASK_EVENTS.FILTER_CHANGED, () => {
            this.updateResultsInfo();
        });
        
        taskEventBus.on(TASK_EVENTS.FILTER_RESET, () => {
            this.hasActiveFilters = false;
            this.updateResultsInfo();
        });
    }

    /**
     * Override loadModuleData to update integration
     */
    async loadModuleData() {
        await super.loadModuleData();
        if (this.integration) {
            this.integration.initialize(this.tasks);
        }
    }

    /**
     * Update displayed tasks based on search/filter results
     */
    updateDisplayedTasks(filteredTasks) {
        this.displayedTasks = filteredTasks;
        this.searchResultsCount = filteredTasks.length;
        this.requestUpdate();
    }

    /**
     * Update results info
     */
    updateResultsInfo() {
        const filtered = this.integration ? this.integration.getFilteredTasks() : this.tasks;
        this.searchResultsCount = filtered.length;
        this.hasActiveFilters = this.integration && (
            this.integration.searchQuery || 
            Object.values(this.integration.activeFilters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== null
            )
        );
    }

    /**
     * Clear all filters and search
     */
    clearAllFilters() {
        if (this.integration) {
            this.integration.clearAll();
        }
        this.hasActiveFilters = false;
        this.searchResultsCount = this.tasks.length;
    }

    /**
     * Override render to add search and filter UI
     */
    render() {
        // Use filtered tasks for display, default to all tasks if no filters
        const tasksToDisplay = this.hasActiveFilters 
            ? this.displayedTasks 
            : this.tasks;

        return html`
            <div class="task-management-container">
                <div class="lims-module-header">
                    <h2>Task Management</h2>
                    <div class="header-actions">
                        <button class="icon-button" @click=${this.createDemoTasks} title="Generate demo tasks">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Enhanced Toolbar with Search and Filters -->
                <div class="enhanced-toolbar">
                    <!-- Search Row -->
                    <div class="toolbar-row search-row">
                        <div class="search-container">
                            <task-search-module></task-search-module>
                        </div>
                        <div class="toolbar-actions">
                            ${this._renderOriginalToolbarActions()}
                        </div>
                    </div>
                    
                    <!-- Filter Row -->
                    <div class="toolbar-row">
                        <div class="filter-container">
                            <task-filter-module></task-filter-module>
                        </div>
                    </div>
                </div>

                <!-- Results Info Bar -->
                ${this.hasActiveFilters ? html`
                    <div class="results-info">
                        <span class="results-count">
                            Showing ${this.searchResultsCount} of ${this.tasks.length} tasks
                        </span>
                        <span class="clear-filters" @click=${this.clearAllFilters}>
                            Clear all filters
                        </span>
                    </div>
                ` : ''}

                <!-- Task Content Area -->
                <div class="task-content">
                    ${this.currentView === 'kanban' 
                        ? this._renderKanbanViewWithTasks(tasksToDisplay)
                        : this._renderListViewWithTasks(tasksToDisplay)
                    }
                </div>

                <!-- Loading Overlay -->
                <div class="loading-overlay ${this.isSearching ? 'visible' : ''}">
                    <div class="loading-spinner"></div>
                </div>

                <!-- Modals (using existing portal implementation) -->
                ${this.renderModalInPortal()}

                <!-- Help and shortcuts (existing) -->
                ${this.renderHelp()}
                ${this.renderShortcutIndicator()}
            </div>
        `;
    }

    /**
     * Render original toolbar actions (view switcher, create button)
     */
    _renderOriginalToolbarActions() {
        return html`
            <div class="view-switcher">
                <button 
                    class="view-button ${this.currentView === 'kanban' ? 'active' : ''}"
                    @click=${() => this.switchView('kanban')}
                    title="Kanban view (K)"
                >
                    <span>Kanban</span>
                </button>
                <button 
                    class="view-button ${this.currentView === 'list' ? 'active' : ''}"
                    @click=${() => this.switchView('list')}
                    title="List view (L)"
                >
                    <span>List</span>
                </button>
            </div>
            
            <button 
                class="primary-button"
                @click=${this.openTaskCreationModal}
                title="Create new task (C)"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Create Task</span>
            </button>
        `;
    }

    /**
     * Render kanban view with specific tasks
     */
    _renderKanbanViewWithTasks(tasks) {
        const columns = ['todo', 'in-progress', 'review', 'done'];
        const columnTasks = this.groupTasksByStatus(tasks);

        return html`
            <div class="kanban-board" @dragover=${this.handleDragOver}>
                ${columns.map(status => this.renderKanbanColumn(status, columnTasks[status] || []))}
            </div>
        `;
    }

    /**
     * Render list view with specific tasks
     */
    _renderListViewWithTasks(tasks) {
        return html`
            <div class="list-view">
                <div class="list-header">
                    <div class="list-cell" style="width: 40px;">
                        <input 
                            type="checkbox" 
                            @change=${this.toggleSelectAll}
                            .checked=${this.selectedTaskIds.size === tasks.length && tasks.length > 0}
                        />
                    </div>
                    <div class="list-cell" style="flex: 2;">Title</div>
                    <div class="list-cell" style="width: 120px;">Status</div>
                    <div class="list-cell" style="width: 100px;">Priority</div>
                    <div class="list-cell" style="width: 120px;">Due Date</div>
                    <div class="list-cell" style="width: 80px;">Actions</div>
                </div>
                <div class="list-body">
                    ${this.virtualScrollEnabled 
                        ? this.renderVirtualListItems(tasks)
                        : tasks.map(task => this.renderListItem(task))
                    }
                </div>
            </div>
        `;
    }

    /**
     * Group tasks by status for kanban view
     */
    groupTasksByStatus(tasks) {
        return tasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {});
    }
}

customElements.define('task-management-module-with-search', TaskManagementModuleWithSearch);