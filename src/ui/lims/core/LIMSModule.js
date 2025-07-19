import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * Base class for all LIMS modules
 * Provides common functionality, styling, and lifecycle management
 */
export class LIMSModule extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: var(--main-content-background, rgba(0, 0, 0, 0.9));
            color: var(--text-color, #e5e5e7);
            overflow: hidden;
        }

        .module-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .module-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: var(--header-background, rgba(0, 0, 0, 0.8));
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            flex-shrink: 0;
        }

        .module-title {
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .module-title .icon {
            width: 24px;
            height: 24px;
            opacity: 0.8;
        }

        .module-actions {
            display: flex;
            gap: 8px;
        }

        .action-button {
            background: transparent;
            border: none;
            color: var(--icon-button-color, rgb(229, 229, 231));
            cursor: pointer;
            padding: 8px;
            border-radius: var(--border-radius, 7px);
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .action-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .module-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            flex-direction: column;
            gap: 16px;
            opacity: 0.6;
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--focus-border-color, #007aff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            flex-direction: column;
            gap: 16px;
            opacity: 0.6;
        }

        .error-icon {
            width: 48px;
            height: 48px;
            color: #ff6b6b;
        }

        .error-message {
            font-size: 16px;
            text-align: center;
        }

        .retry-button {
            background: var(--focus-border-color, #007aff);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: var(--border-radius, 7px);
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.2s;
        }

        .retry-button:hover {
            opacity: 0.8;
        }

        /* Scrollbar styles */
        .module-content::-webkit-scrollbar {
            width: 8px;
        }

        .module-content::-webkit-scrollbar-track {
            background: var(--scrollbar-track, rgba(0, 0, 0, 0.2));
            border-radius: 4px;
        }

        .module-content::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 4px;
        }

        .module-content::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }
    `;

    static properties = {
        moduleId: { type: String },
        displayName: { type: String },
        category: { type: String },
        loading: { type: Boolean },
        error: { type: String },
        learnXIntegration: { type: Boolean },
        permissions: { type: Array },
        dependencies: { type: Array }
    };

    constructor() {
        super();
        this.moduleId = '';
        this.displayName = '';
        this.category = 'core';
        this.loading = false;
        this.error = null;
        this.learnXIntegration = false;
        this.permissions = [];
        this.dependencies = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.initialize();
    }

    /**
     * Override in child classes for module-specific initialization
     */
    async initialize() {
        console.log(`[LIMSModule] Initializing ${this.moduleId}`);
        await this.loadModuleData();
    }

    /**
     * Override in child classes to load module-specific data
     */
    async loadModuleData() {
        // Base implementation - override in child classes
    }

    /**
     * Common error handling for all modules
     */
    handleError(error, context = 'Module operation') {
        console.error(`[LIMSModule] ${context} failed in ${this.moduleId}:`, error);
        this.error = `${context} failed: ${error.message || error}`;
        this.loading = false;
    }

    /**
     * Common loading state management
     */
    setLoading(isLoading, message = '') {
        this.loading = isLoading;
        if (message) {
            console.log(`[LIMSModule] ${this.moduleId}: ${message}`);
        }
    }

    /**
     * Retry failed operations
     */
    async handleRetry() {
        this.error = null;
        this.setLoading(true, 'Retrying...');
        try {
            await this.loadModuleData();
        } catch (error) {
            this.handleError(error, 'Retry operation');
        }
    }

    /**
     * LEARN-X integration helper
     */
    async syncWithLearnX() {
        if (!this.learnXIntegration) return;
        
        try {
            console.log(`[LIMSModule] Syncing ${this.moduleId} with LEARN-X`);
            // Override in child classes for specific sync logic
            await this.performLearnXSync();
        } catch (error) {
            this.handleError(error, 'LEARN-X sync');
        }
    }

    /**
     * Override in child classes for LEARN-X specific sync
     */
    async performLearnXSync() {
        // Base implementation - override in child classes
    }

    /**
     * Common module header renderer
     */
    renderModuleHeader() {
        return html`
            <div class="module-header">
                <div class="module-title">
                    ${this.renderModuleIcon()}
                    ${this.displayName}
                </div>
                <div class="module-actions">
                    ${this.renderModuleActions()}
                </div>
            </div>
        `;
    }

    /**
     * Override in child classes to provide module-specific icon
     */
    renderModuleIcon() {
        return html`
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
        `;
    }

    /**
     * Override in child classes to provide module-specific actions
     */
    renderModuleActions() {
        return html`
            ${this.learnXIntegration ? html`
                <button class="action-button" @click=${this.syncWithLearnX} title="Sync with LEARN-X">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64L21 3v6h-6"/>
                    </svg>
                </button>
            ` : ''}
        `;
    }

    /**
     * Common loading state renderer
     */
    renderLoadingState() {
        return html`
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div>Loading ${this.displayName}...</div>
            </div>
        `;
    }

    /**
     * Common error state renderer
     */
    renderErrorState() {
        return html`
            <div class="error-state">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <div class="error-message">${this.error}</div>
                <button class="retry-button" @click=${this.handleRetry}>Retry</button>
            </div>
        `;
    }

    /**
     * Main render method - uses template method pattern
     */
    render() {
        return html`
            <div class="module-container">
                ${this.renderModuleHeader()}
                <div class="module-content">
                    ${this.loading ? this.renderLoadingState() : 
                      this.error ? this.renderErrorState() : 
                      this.renderModuleContent()}
                </div>
            </div>
        `;
    }

    /**
     * Override in child classes to provide module-specific content
     */
    renderModuleContent() {
        return html`<div>Module content goes here</div>`;
    }
}