import { taskEventBus, TASK_EVENTS } from '../taskManagement/utils/TaskEventBus.js';

/**
 * LIMSModuleIntegration - Central integration hub for all LIMS modules
 * Provides cross-module communication and data sharing capabilities
 */
export class LIMSModuleIntegration {
    static instance = null;
    
    constructor() {
        if (LIMSModuleIntegration.instance) {
            return LIMSModuleIntegration.instance;
        }
        
        this.modules = new Map();
        this.eventHandlers = new Map();
        this.sharedState = new Map();
        this.crossModuleListeners = new Map();
        
        LIMSModuleIntegration.instance = this;
        this.initialize();
    }
    
    static getInstance() {
        if (!LIMSModuleIntegration.instance) {
            LIMSModuleIntegration.instance = new LIMSModuleIntegration();
        }
        return LIMSModuleIntegration.instance;
    }
    
    initialize() {
        console.log('[LIMSIntegration] Initializing module integration hub');
        
        // Set up global event listeners for cross-module communication
        this.setupGlobalListeners();
        
        // Initialize shared state
        this.initializeSharedState();
    }
    
    /**
     * Register a module with the integration hub
     * @param {string} moduleId - Unique identifier for the module
     * @param {Object} moduleInstance - The module instance
     * @param {Object} config - Module configuration
     */
    registerModule(moduleId, moduleInstance, config = {}) {
        console.log(`[LIMSIntegration] Registering module: ${moduleId}`);
        
        this.modules.set(moduleId, {
            instance: moduleInstance,
            config,
            status: 'active',
            registeredAt: new Date()
        });
        
        // Notify other modules about the registration
        this.broadcastEvent('module:registered', {
            moduleId,
            config,
            capabilities: config.capabilities || []
        });
    }
    
    /**
     * Unregister a module
     * @param {string} moduleId - Module to unregister
     */
    unregisterModule(moduleId) {
        console.log(`[LIMSIntegration] Unregistering module: ${moduleId}`);
        
        if (this.modules.has(moduleId)) {
            this.modules.delete(moduleId);
            
            // Clean up event handlers
            this.eventHandlers.delete(moduleId);
            this.crossModuleListeners.delete(moduleId);
            
            // Notify other modules
            this.broadcastEvent('module:unregistered', { moduleId });
        }
    }
    
    /**
     * Get a registered module
     * @param {string} moduleId - Module identifier
     * @returns {Object|null} Module instance or null
     */
    getModule(moduleId) {
        const module = this.modules.get(moduleId);
        return module ? module.instance : null;
    }
    
    /**
     * Check if a module is registered
     * @param {string} moduleId - Module identifier
     * @returns {boolean} True if module is registered
     */
    hasModule(moduleId) {
        return this.modules.has(moduleId);
    }
    
    /**
     * Register an event handler for cross-module events
     * @param {string} moduleId - Module registering the handler
     * @param {string} eventType - Event type to listen for
     * @param {Function} handler - Event handler function
     */
    on(moduleId, eventType, handler) {
        if (!this.eventHandlers.has(moduleId)) {
            this.eventHandlers.set(moduleId, new Map());
        }
        
        const moduleHandlers = this.eventHandlers.get(moduleId);
        if (!moduleHandlers.has(eventType)) {
            moduleHandlers.set(eventType, []);
        }
        
        moduleHandlers.get(eventType).push(handler);
    }
    
    /**
     * Remove an event handler
     * @param {string} moduleId - Module that registered the handler
     * @param {string} eventType - Event type
     * @param {Function} handler - Handler to remove
     */
    off(moduleId, eventType, handler) {
        const moduleHandlers = this.eventHandlers.get(moduleId);
        if (!moduleHandlers) return;
        
        const handlers = moduleHandlers.get(eventType);
        if (!handlers) return;
        
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
    
    /**
     * Emit an event to all registered handlers
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     * @param {string} sourceModule - Module emitting the event
     */
    emit(eventType, data, sourceModule = 'system') {
        console.log(`[LIMSIntegration] Event: ${eventType} from ${sourceModule}`);
        
        // Execute handlers for all modules
        this.eventHandlers.forEach((moduleHandlers, moduleId) => {
            if (moduleId === sourceModule) return; // Don't send events back to source
            
            const handlers = moduleHandlers.get(eventType);
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler(data, sourceModule);
                    } catch (error) {
                        console.error(`[LIMSIntegration] Error in handler for ${moduleId}:`, error);
                    }
                });
            }
        });
    }
    
    /**
     * Broadcast an event to all modules
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    broadcastEvent(eventType, data) {
        this.emit(eventType, data, 'system');
    }
    
    /**
     * Get or set shared state
     * @param {string} key - State key
     * @param {any} value - Value to set (optional)
     * @returns {any} Current value
     */
    sharedState(key, value) {
        if (value !== undefined) {
            const oldValue = this.sharedState.get(key);
            this.sharedState.set(key, value);
            
            // Notify modules of state change
            this.broadcastEvent('state:changed', {
                key,
                oldValue,
                newValue: value
            });
        }
        
        return this.sharedState.get(key);
    }
    
    /**
     * Initialize default shared state
     */
    initializeSharedState() {
        // Current user context
        this.sharedState.set('currentUser', null);
        
        // Active project context
        this.sharedState.set('activeProject', null);
        
        // Global filters
        this.sharedState.set('globalFilters', {
            dateRange: null,
            labels: [],
            assignees: []
        });
        
        // UI preferences
        this.sharedState.set('uiPreferences', {
            theme: 'dark',
            compactMode: false,
            sidebarCollapsed: false
        });
    }
    
    /**
     * Set up global event listeners
     */
    setupGlobalListeners() {
        // Listen for task-related events
        taskEventBus.on(TASK_EVENTS.TASK_CREATED, (data) => {
            this.broadcastEvent('task:created', data);
        });
        
        taskEventBus.on(TASK_EVENTS.TASK_UPDATED, (data) => {
            this.broadcastEvent('task:updated', data);
        });
        
        taskEventBus.on(TASK_EVENTS.TASK_DELETED, (data) => {
            this.broadcastEvent('task:deleted', data);
        });
        
        // Listen for project changes
        taskEventBus.on(TASK_EVENTS.PROJECT_CHANGED, (data) => {
            this.sharedState.set('activeProject', data.projectId);
            this.broadcastEvent('project:changed', data);
        });
    }
    
    /**
     * Request data from another module
     * @param {string} targetModule - Module to request from
     * @param {string} requestType - Type of request
     * @param {Object} params - Request parameters
     * @returns {Promise<any>} Response from the module
     */
    async requestFromModule(targetModule, requestType, params = {}) {
        const module = this.getModule(targetModule);
        if (!module) {
            throw new Error(`Module ${targetModule} not found`);
        }
        
        // Check if module has a request handler
        if (typeof module.handleIntegrationRequest === 'function') {
            return await module.handleIntegrationRequest(requestType, params);
        }
        
        throw new Error(`Module ${targetModule} does not support integration requests`);
    }
    
    /**
     * Create a cross-module action
     * @param {string} actionType - Type of action
     * @param {Object} config - Action configuration
     */
    createCrossModuleAction(actionType, config) {
        console.log(`[LIMSIntegration] Creating cross-module action: ${actionType}`);
        
        switch (actionType) {
            case 'task-to-analytics':
                // Create task from analytics insight
                this.handleTaskFromAnalytics(config);
                break;
                
            case 'bulk-from-report':
                // Trigger bulk operations from report
                this.handleBulkFromReport(config);
                break;
                
            case 'filter-sync':
                // Synchronize filters across modules
                this.handleFilterSync(config);
                break;
                
            default:
                console.warn(`[LIMSIntegration] Unknown action type: ${actionType}`);
        }
    }
    
    /**
     * Handle creating tasks from analytics insights
     */
    handleTaskFromAnalytics(config) {
        const { insight, suggestedTask } = config;
        
        // Get task management module
        const taskModule = this.getModule('taskManagement');
        if (taskModule && taskModule.createTask) {
            taskModule.createTask({
                title: suggestedTask.title,
                description: `Created from analytics insight: ${insight}`,
                priority: 'medium',
                labels: ['analytics-generated'],
                ...suggestedTask
            });
        }
    }
    
    /**
     * Handle bulk operations triggered from reports
     */
    handleBulkFromReport(config) {
        const { taskIds, operation } = config;
        
        // Emit event for bulk operations module
        this.emit('bulk:operation:requested', {
            taskIds,
            operation,
            source: 'reporting'
        });
    }
    
    /**
     * Synchronize filters across modules
     */
    handleFilterSync(config) {
        const { filters, sourceModule } = config;
        
        // Update global filters
        this.sharedState.set('globalFilters', {
            ...this.sharedState.get('globalFilters'),
            ...filters
        });
        
        // Broadcast to all modules except source
        this.emit('filters:updated', filters, sourceModule);
    }
    
    /**
     * Get integration status and statistics
     */
    getStatus() {
        const moduleStats = Array.from(this.modules.entries()).map(([id, module]) => ({
            id,
            status: module.status,
            registeredAt: module.registeredAt,
            hasIntegration: !!module.instance.handleIntegrationRequest
        }));
        
        return {
            totalModules: this.modules.size,
            modules: moduleStats,
            sharedStateKeys: Array.from(this.sharedState.keys()),
            eventHandlerCount: this.eventHandlers.size
        };
    }
}

// Export singleton instance
export const limsIntegration = LIMSModuleIntegration.getInstance();

// Export integration events
export const INTEGRATION_EVENTS = {
    MODULE_REGISTERED: 'module:registered',
    MODULE_UNREGISTERED: 'module:unregistered',
    STATE_CHANGED: 'state:changed',
    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    PROJECT_CHANGED: 'project:changed',
    FILTERS_UPDATED: 'filters:updated',
    BULK_OPERATION_REQUESTED: 'bulk:operation:requested'
};