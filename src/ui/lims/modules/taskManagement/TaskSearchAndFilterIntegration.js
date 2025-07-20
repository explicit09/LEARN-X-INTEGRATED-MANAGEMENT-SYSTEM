import { html } from '../../../assets/lit-core-2.7.4.min.js';
import './search/TaskSearchModule.js';
import './filters/TaskFilterModule.js';
import { createTaskManagementIntegration } from './TaskManagementIntegration.js';

/**
 * TaskSearchAndFilterIntegration - Simple integration helper
 * Provides methods to integrate search and filter into existing TaskManagementModuleEnhanced
 */
export class TaskSearchAndFilterIntegration {
    static integration = null;

    /**
     * Initialize the integration with the host module
     */
    static initialize(hostModule) {
        if (!this.integration) {
            this.integration = createTaskManagementIntegration(hostModule);
        }
        
        // Initialize with current tasks
        if (hostModule.tasks) {
            this.integration.initialize(hostModule.tasks);
        }
        
        return this.integration;
    }

    /**
     * Render search and filter components
     */
    static renderSearchAndFilters() {
        return html`
            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1; max-width: 500px;">
                    <task-search-module></task-search-module>
                </div>
                <div style="flex: 1;">
                    <task-filter-module></task-filter-module>
                </div>
            </div>
        `;
    }

    /**
     * Get filtered tasks based on current search and filters
     */
    static getFilteredTasks(originalTasks) {
        if (!this.integration) {
            return originalTasks;
        }
        
        // Update integration with latest tasks
        this.integration.initialize(originalTasks);
        
        // Return filtered tasks
        return this.integration.getFilteredTasks();
    }

    /**
     * Check if any filters are active
     */
    static hasActiveFilters() {
        if (!this.integration) {
            return false;
        }
        
        return this.integration.searchQuery || 
               Object.values(this.integration.activeFilters).some(v => 
                   Array.isArray(v) ? v.length > 0 : v !== null
               );
    }

    /**
     * Clean up
     */
    static destroy() {
        if (this.integration) {
            this.integration.destroy();
            this.integration = null;
        }
    }
}