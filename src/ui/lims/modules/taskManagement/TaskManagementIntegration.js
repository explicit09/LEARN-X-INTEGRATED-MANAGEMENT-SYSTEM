import { taskEventBus, TASK_EVENTS } from './utils/TaskEventBus.js';

/**
 * TaskManagementIntegration - Connects modular features to the main task management module
 * This class handles the integration of search, filters, assignees, and bulk operations
 * without modifying the core TaskManagementModuleEnhanced
 */
export class TaskManagementIntegration {
    constructor(hostModule) {
        this.hostModule = hostModule;
        this.originalTasks = [];
        this.filteredTasks = [];
        this.searchQuery = '';
        this.activeFilters = {};
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search events
        taskEventBus.on(TASK_EVENTS.SEARCH_QUERY_CHANGED, (event) => {
            this.handleSearchQueryChanged(event.detail);
        });

        // Filter events
        taskEventBus.on(TASK_EVENTS.FILTER_CHANGED, (event) => {
            this.handleFilterChanged(event.detail);
        });

        // Task events - update our cache when tasks change
        taskEventBus.on(TASK_EVENTS.TASK_CREATED, () => {
            this.refreshTasks();
        });

        taskEventBus.on(TASK_EVENTS.TASK_UPDATED, () => {
            this.refreshTasks();
        });

        taskEventBus.on(TASK_EVENTS.TASK_DELETED, () => {
            this.refreshTasks();
        });
    }

    /**
     * Initialize integration with existing tasks
     */
    initialize(tasks) {
        this.originalTasks = tasks;
        this.filteredTasks = [...tasks];
        this.applySearchAndFilters();
        
        // Notify filter module about available tasks
        taskEventBus.emit(TASK_EVENTS.TASKS_REFRESHED, { tasks: this.originalTasks });
    }

    /**
     * Refresh task list from host module
     */
    refreshTasks() {
        if (this.hostModule && this.hostModule.tasks) {
            this.initialize(this.hostModule.tasks);
        }
    }

    /**
     * Handle search query changes
     */
    handleSearchQueryChanged(detail) {
        this.searchQuery = detail.query || '';
        this.applySearchAndFilters();
    }

    /**
     * Handle filter changes
     */
    handleFilterChanged(detail) {
        console.log('[Integration] Filter changed:', detail.filters);
        this.activeFilters = detail.filters || {};
        this.applySearchAndFilters();
    }

    /**
     * Apply search and filters to tasks
     */
    applySearchAndFilters() {
        let filtered = [...this.originalTasks];

        // Apply search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            const searchFilters = this.parseSearchOperators(this.searchQuery);
            
            // Text search
            const textQuery = this.searchQuery.replace(/\w+:\S+/g, '').trim().toLowerCase();
            if (textQuery) {
                filtered = filtered.filter(task => {
                    return (
                        task.title.toLowerCase().includes(textQuery) ||
                        (task.description && task.description.toLowerCase().includes(textQuery)) ||
                        (task.labels && task.labels.some(label => label.toLowerCase().includes(textQuery)))
                    );
                });
            }

            // Apply search operators
            if (searchFilters.status) {
                filtered = filtered.filter(task => task.status === searchFilters.status);
            }
            if (searchFilters.priority) {
                filtered = filtered.filter(task => task.priority === searchFilters.priority);
            }
            if (searchFilters.assignee) {
                if (searchFilters.assignee === 'me') {
                    // TODO: Get current user ID from auth
                    filtered = filtered.filter(task => task.assignee === 'current-user');
                } else {
                    filtered = filtered.filter(task => task.assignee === searchFilters.assignee);
                }
            }
            if (searchFilters.due) {
                filtered = this.filterByDueDate(filtered, searchFilters.due);
            }
        }

        // Apply filters
        if (this.activeFilters.status && this.activeFilters.status.length > 0) {
            console.log('[Integration] Filtering by status:', this.activeFilters.status);
            console.log('[Integration] Available task statuses:', [...new Set(filtered.map(t => t.status))]);
            const beforeCount = filtered.length;
            filtered = filtered.filter(task => this.activeFilters.status.includes(task.status));
            console.log('[Integration] Status filter: ', beforeCount, '->', filtered.length, 'tasks');
        }

        if (this.activeFilters.priority && this.activeFilters.priority.length > 0) {
            console.log('[Integration] Filtering by priority:', this.activeFilters.priority);
            console.log('[Integration] Available task priorities:', [...new Set(filtered.map(t => t.priority))]);
            const beforeCount = filtered.length;
            filtered = filtered.filter(task => this.activeFilters.priority.includes(task.priority));
            console.log('[Integration] Priority filter: ', beforeCount, '->', filtered.length, 'tasks');
        }

        if (this.activeFilters.labels && this.activeFilters.labels.length > 0) {
            filtered = filtered.filter(task => {
                return task.labels && task.labels.some(label => this.activeFilters.labels.includes(label));
            });
        }

        if (this.activeFilters.assignee) {
            if (this.activeFilters.assignee === 'me') {
                // TODO: Get current user ID from auth
                filtered = filtered.filter(task => task.assignee === 'current-user');
            } else if (this.activeFilters.assignee === 'unassigned') {
                filtered = filtered.filter(task => !task.assignee);
            } else {
                filtered = filtered.filter(task => task.assignee === this.activeFilters.assignee);
            }
        }

        if (this.activeFilters.dateRange) {
            filtered = this.filterByDateRange(filtered, this.activeFilters.dateRange);
        }

        this.filteredTasks = filtered;
        
        console.log('[Integration] Applied filters, showing', filtered.length, 'of', this.originalTasks.length, 'tasks');
        
        // Force re-render of host module with filtered tasks
        if (this.hostModule) {
            this.hostModule.requestUpdate();
        }
    }

    /**
     * Parse search operators from query
     */
    parseSearchOperators(query) {
        const filters = {};
        const operators = {
            'status:': 'status',
            'priority:': 'priority',
            'assignee:': 'assignee',
            'due:': 'due'
        };

        for (const [operator, filterKey] of Object.entries(operators)) {
            const match = query.match(new RegExp(`${operator}(\\S+)`));
            if (match) {
                filters[filterKey] = match[1];
            }
        }

        return filters;
    }

    /**
     * Filter tasks by due date keyword
     */
    filterByDueDate(tasks, dueKeyword) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        switch (dueKeyword) {
            case 'today':
                return tasks.filter(task => {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate.getTime() === today.getTime();
                });
            case 'tomorrow':
                return tasks.filter(task => {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate.getTime() === tomorrow.getTime();
                });
            case 'overdue':
                return tasks.filter(task => {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    return dueDate < today;
                });
            case 'week':
                return tasks.filter(task => {
                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date);
                    return dueDate >= today && dueDate <= nextWeek;
                });
            default:
                return tasks;
        }
    }

    /**
     * Filter tasks by date range
     */
    filterByDateRange(tasks, dateRange) {
        if (!dateRange.start && !dateRange.end) return tasks;

        return tasks.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            
            if (dateRange.start && dueDate < dateRange.start) return false;
            if (dateRange.end && dueDate > dateRange.end) return false;
            
            return true;
        });
    }

    /**
     * Get filtered tasks
     */
    getFilteredTasks() {
        return this.filteredTasks;
    }

    /**
     * Clear all filters and search
     */
    clearAll() {
        this.searchQuery = '';
        this.activeFilters = {};
        this.filteredTasks = [...this.originalTasks];
        
        taskEventBus.emit(TASK_EVENTS.FILTER_RESET);
        
        if (this.hostModule && this.hostModule.updateDisplayedTasks) {
            this.hostModule.updateDisplayedTasks(this.filteredTasks);
        }
    }

    /**
     * Destroy integration and clean up
     */
    destroy() {
        taskEventBus.clear();
    }
}

// Export as singleton factory
export function createTaskManagementIntegration(hostModule) {
    return new TaskManagementIntegration(hostModule);
}