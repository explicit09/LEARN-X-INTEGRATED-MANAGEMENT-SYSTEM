import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import './core/LIMSModuleLoader.js';
import './modules/TaskManagementModuleEnhanced.js';
import './modules/TaskManagementModuleWithBulkOps.js';
import './modules/CoreDashboardModule.js';
import './modules/AnalyticsDashboardModuleEnhanced.js';
import './modules/BusinessIntelligenceDashboard.js';

/**
 * LIMS Dashboard View - New Modular Architecture
 * Replaces old tab-based system with full modular architecture
 * Ready for all 9 PRD modules with maintainable, scalable code
 */
export class LimsDashboardView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: var(--main-content-background, rgba(0, 0, 0, 0.9));
            color: var(--text-color, #e5e5e7);
            overflow: hidden;
        }

        .dashboard-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .global-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: var(--header-background, rgba(0, 0, 0, 0.9));
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            flex-shrink: 0;
        }

        .dashboard-title {
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--accent-color, #007aff);
        }

        .dashboard-title .icon {
            width: 22px;
            height: 22px;
            opacity: 0.9;
        }

        .global-actions {
            display: flex;
            gap: 8px;
        }

        .global-action-button {
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

        .global-action-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .module-loader-container {
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        lims-module-loader {
            height: 100%;
        }
    `;

    static properties = {
        currentModule: { type: String },
        moduleLoader: { type: Object }
    };

    constructor() {
        super();
        this.currentModule = 'task-management'; // Start with priority module
        this.moduleLoader = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.initializeModules();
    }

    initializeModules() {
        // Wait for module loader to be ready
        this.updateComplete.then(() => {
            this.moduleLoader = this.shadowRoot.querySelector('lims-module-loader');
            if (this.moduleLoader) {
                this.moduleLoader.addEventListener('module-changed', this.handleModuleChange.bind(this));
            }
        });
    }

    handleModuleChange(event) {
        const { moduleId, categoryId } = event.detail;
        this.currentModule = moduleId;
        console.log(`[LIMS] Module changed to: ${categoryId}/${moduleId}`);
    }

    async handleClose() {
        if (window.api) {
            await window.api.lims.closeDashboard();
        }
    }

    handleGlobalAction(action) {
        console.log(`[LIMS] Global action: ${action}`);
        // Dispatch global actions that modules can listen to
        this.dispatchEvent(new CustomEvent('global-action', {
            detail: { action },
            bubbles: true
        }));
    }

    render() {
        return html`
            <div class="dashboard-container">
                <div class="global-header">
                    <div class="dashboard-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        LIMS
                    </div>
                    <div class="global-actions">
                        <button class="global-action-button" @click=${() => this.handleGlobalAction('notifications')} title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </button>
                        <button class="global-action-button" @click=${() => this.handleGlobalAction('search')} title="Global Search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                        <button class="global-action-button" @click=${this.handleClose} title="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="module-loader-container">
                    <lims-module-loader>
                        ${this.renderModuleContent()}
                    </lims-module-loader>
                </div>
            </div>
        `;
    }

    renderModuleContent() {
        // Module content is dynamically inserted by the module loader
        // Each module manages its own content rendering
        switch (this.currentModule) {
            case 'task-management':
                return html`<task-management-module-with-bulk-ops slot="module-content"></task-management-module-with-bulk-ops>`;
            case 'overview':
                return html`<core-dashboard-module slot="module-content"></core-dashboard-module>`;
            case 'analytics-dashboard':
                return html`<analytics-dashboard-module-enhanced slot="module-content"></analytics-dashboard-module-enhanced>`;
            case 'business-intelligence':
                return html`<business-intelligence-dashboard slot="module-content"></business-intelligence-dashboard>`;
            default:
                return html`
                    <div slot="module-content" style="padding: 40px; text-align: center; opacity: 0.6;">
                        <h3>Module Coming Soon</h3>
                        <p>This module is part of the PRD roadmap and will be implemented soon.</p>
                    </div>
                `;
        }
    }
}

customElements.define('lims-dashboard-view', LimsDashboardView);