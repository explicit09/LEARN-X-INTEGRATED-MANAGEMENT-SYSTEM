import { limsIntegration, INTEGRATION_EVENTS } from './LIMSModuleIntegration.js';

/**
 * IntegratedModuleMixin - Mixin for LIMS modules to enable integration
 * Provides standard integration capabilities to any LitElement module
 */
export const IntegratedModuleMixin = (superClass) => class extends superClass {
    constructor() {
        super();
        this._integrationHandlers = new Map();
        this._moduleId = this.constructor.moduleId || this.tagName.toLowerCase();
    }
    
    connectedCallback() {
        super.connectedCallback();
        this._registerWithIntegration();
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        this._unregisterFromIntegration();
    }
    
    /**
     * Register this module with the integration hub
     */
    _registerWithIntegration() {
        const config = {
            capabilities: this.getIntegrationCapabilities(),
            version: this.constructor.version || '1.0.0',
            dependencies: this.constructor.dependencies || []
        };
        
        limsIntegration.registerModule(this._moduleId, this, config);
        
        // Set up default integration listeners
        this._setupDefaultListeners();
    }
    
    /**
     * Unregister from integration hub
     */
    _unregisterFromIntegration() {
        limsIntegration.unregisterModule(this._moduleId);
        
        // Clean up handlers
        this._integrationHandlers.forEach((handler, eventType) => {
            limsIntegration.off(this._moduleId, eventType, handler);
        });
        this._integrationHandlers.clear();
    }
    
    /**
     * Set up default integration event listeners
     */
    _setupDefaultListeners() {
        // Listen for filter updates if module supports filtering
        if (this.applyGlobalFilters) {
            this.onIntegrationEvent(INTEGRATION_EVENTS.FILTERS_UPDATED, (filters) => {
                this.applyGlobalFilters(filters);
            });
        }
        
        // Listen for state changes
        this.onIntegrationEvent(INTEGRATION_EVENTS.STATE_CHANGED, (data) => {
            this.handleSharedStateChange(data);
        });
        
        // Listen for project changes if module is project-aware
        if (this.handleProjectChange) {
            this.onIntegrationEvent(INTEGRATION_EVENTS.PROJECT_CHANGED, (data) => {
                this.handleProjectChange(data);
            });
        }
    }
    
    /**
     * Register an integration event handler
     * @param {string} eventType - Event type to listen for
     * @param {Function} handler - Event handler
     */
    onIntegrationEvent(eventType, handler) {
        const wrappedHandler = (data, source) => {
            console.log(`[${this._moduleId}] Handling integration event: ${eventType} from ${source}`);
            handler.call(this, data, source);
        };
        
        this._integrationHandlers.set(eventType, wrappedHandler);
        limsIntegration.on(this._moduleId, eventType, wrappedHandler);
    }
    
    /**
     * Emit an integration event
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    emitIntegrationEvent(eventType, data) {
        limsIntegration.emit(eventType, data, this._moduleId);
    }
    
    /**
     * Get shared state value
     * @param {string} key - State key
     * @returns {any} State value
     */
    getSharedState(key) {
        return limsIntegration.sharedState(key);
    }
    
    /**
     * Set shared state value
     * @param {string} key - State key
     * @param {any} value - State value
     */
    setSharedState(key, value) {
        limsIntegration.sharedState(key, value);
    }
    
    /**
     * Request data from another module
     * @param {string} targetModule - Target module ID
     * @param {string} requestType - Request type
     * @param {Object} params - Request parameters
     * @returns {Promise<any>} Response data
     */
    async requestFromModule(targetModule, requestType, params = {}) {
        return limsIntegration.requestFromModule(targetModule, requestType, params);
    }
    
    /**
     * Create a cross-module action
     * @param {string} actionType - Action type
     * @param {Object} config - Action configuration
     */
    createCrossModuleAction(actionType, config) {
        limsIntegration.createCrossModuleAction(actionType, {
            ...config,
            sourceModule: this._moduleId
        });
    }
    
    /**
     * Get integration capabilities (override in subclass)
     * @returns {Array<string>} List of capabilities
     */
    getIntegrationCapabilities() {
        const capabilities = [];
        
        // Auto-detect common capabilities
        if (this.handleIntegrationRequest) capabilities.push('requests');
        if (this.applyGlobalFilters) capabilities.push('filtering');
        if (this.exportData) capabilities.push('export');
        if (this.importData) capabilities.push('import');
        if (this.handleProjectChange) capabilities.push('project-aware');
        
        return capabilities;
    }
    
    /**
     * Handle integration requests (override in subclass)
     * @param {string} requestType - Type of request
     * @param {Object} params - Request parameters
     * @returns {Promise<any>} Response data
     */
    async handleIntegrationRequest(requestType, params) {
        console.warn(`[${this._moduleId}] Unhandled integration request: ${requestType}`);
        return null;
    }
    
    /**
     * Handle shared state changes (override in subclass)
     * @param {Object} data - State change data
     */
    handleSharedStateChange(data) {
        // Default implementation - subclasses can override
        console.log(`[${this._moduleId}] Shared state changed:`, data.key, data.newValue);
    }
    
    /**
     * Apply global filters (override in subclass if filtering is supported)
     * @param {Object} filters - Global filters
     */
    applyGlobalFilters(filters) {
        // Default implementation - subclasses should override
        console.log(`[${this._moduleId}] Applying global filters:`, filters);
    }
    
    /**
     * Check if another module is available
     * @param {string} moduleId - Module to check
     * @returns {boolean} True if module is registered
     */
    isModuleAvailable(moduleId) {
        return limsIntegration.hasModule(moduleId);
    }
    
    /**
     * Get another module instance
     * @param {string} moduleId - Module ID
     * @returns {Object|null} Module instance or null
     */
    getModule(moduleId) {
        return limsIntegration.getModule(moduleId);
    }
};