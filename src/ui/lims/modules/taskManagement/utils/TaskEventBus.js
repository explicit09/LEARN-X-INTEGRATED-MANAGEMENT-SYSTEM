/**
 * TaskEventBus - Central event system for task management modules
 * Enables loose coupling between search, filter, assignee, and bulk operation modules
 */
export class TaskEventBus extends EventTarget {
    constructor() {
        super();
        this._listeners = new Map();
    }

    /**
     * Emit an event with data
     * @param {string} eventName - Name of the event
     * @param {*} data - Event data
     */
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { 
            detail: data,
            bubbles: false,
            cancelable: true
        });
        this.dispatchEvent(event);
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} handler - Event handler
     * @returns {Function} Unsubscribe function
     */
    on(eventName, handler) {
        this.addEventListener(eventName, handler);
        
        // Track listeners for cleanup
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, new Set());
        }
        this._listeners.get(eventName).add(handler);
        
        // Return unsubscribe function
        return () => this.off(eventName, handler);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} handler - Event handler
     */
    off(eventName, handler) {
        this.removeEventListener(eventName, handler);
        
        if (this._listeners.has(eventName)) {
            this._listeners.get(eventName).delete(handler);
            if (this._listeners.get(eventName).size === 0) {
                this._listeners.delete(eventName);
            }
        }
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName - Name of the event
     * @param {Function} handler - Event handler
     */
    once(eventName, handler) {
        const onceHandler = (event) => {
            handler(event);
            this.off(eventName, onceHandler);
        };
        this.on(eventName, onceHandler);
    }

    /**
     * Clear all listeners
     */
    clear() {
        for (const [eventName, handlers] of this._listeners) {
            for (const handler of handlers) {
                this.removeEventListener(eventName, handler);
            }
        }
        this._listeners.clear();
    }
}

// Singleton instance
export const taskEventBus = new TaskEventBus();

// Event names constants
export const TASK_EVENTS = {
    // Search events
    SEARCH_QUERY_CHANGED: 'search:queryChanged',
    SEARCH_RESULTS_UPDATED: 'search:resultsUpdated',
    
    // Filter events
    FILTER_CHANGED: 'filter:changed',
    FILTER_RESET: 'filter:reset',
    FILTER_PRESET_SAVED: 'filter:presetSaved',
    
    // Assignee events
    ASSIGNEE_SELECTED: 'assignee:selected',
    ASSIGNEE_REMOVED: 'assignee:removed',
    ASSIGNEES_LOADED: 'assignees:loaded',
    
    // Bulk operation events
    BULK_SELECTION_CHANGED: 'bulk:selectionChanged',
    BULK_OPERATION_EXECUTE: 'bulk:execute',
    BULK_SELECT_ALL: 'bulk:selectAll',
    BULK_DESELECT_ALL: 'bulk:deselectAll',
    
    // Task events
    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    TASKS_REFRESHED: 'tasks:refreshed',
    TASKS_SORT_CHANGED: 'tasks:sortChanged',
    
    // Due date events
    DUE_DATE_SET: 'dueDate:set',
    DUE_DATE_CLEARED: 'dueDate:cleared',
    OVERDUE_TASKS_FOUND: 'dueDate:overdue',
    
    // UI events
    VIEW_CHANGED: 'ui:viewChanged',
    MODAL_OPENED: 'ui:modalOpened',
    MODAL_CLOSED: 'ui:modalClosed'
};