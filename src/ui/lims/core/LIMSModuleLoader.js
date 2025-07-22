import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

/**
 * LIMS Module Loader and Router System
 * Manages dynamic loading and navigation between LIMS modules
 * Supports the 9-module architecture outlined in PRD
 */
export class LIMSModuleLoader extends LitElement {
    static styles = css`
        :host {
            display: flex;
            height: 100vh;
            background: var(--main-content-background, rgba(0, 0, 0, 0.9));
            color: var(--text-color, #e5e5e7);
            overflow: hidden;
        }

        .navigation-sidebar {
            width: 280px;
            background: var(--sidebar-background, rgba(0, 0, 0, 0.8));
            border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .sidebar-header {
            padding: 24px 20px 16px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .lims-logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent-color, #007aff);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .lims-subtitle {
            font-size: 12px;
            opacity: 0.6;
            margin-top: 4px;
            font-weight: 400;
        }

        .module-categories {
            flex: 1;
            padding: 16px 0;
        }

        .category {
            margin-bottom: 8px;
        }

        .category-header {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            color: var(--category-header-color, rgba(255, 255, 255, 0.8));
            cursor: pointer;
            transition: background-color 0.2s;
            user-select: none;
        }

        .category-header:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .category-icon {
            width: 18px;
            height: 18px;
            margin-right: 12px;
            opacity: 0.8;
        }

        .category-chevron {
            width: 16px;
            height: 16px;
            margin-left: auto;
            transition: transform 0.2s;
        }

        .category.expanded .category-chevron {
            transform: rotate(90deg);
        }

        .category-modules {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .category.expanded .category-modules {
            max-height: 400px;
        }

        .module-item {
            display: flex;
            align-items: center;
            padding: 10px 20px 10px 50px;
            font-size: 13px;
            color: var(--module-item-color, rgba(255, 255, 255, 0.7));
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .module-item:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
            color: var(--text-color, #e5e5e7);
        }

        .module-item.active {
            background: var(--active-module-background, rgba(0, 122, 255, 0.15));
            color: var(--accent-color, #007aff);
            border-left-color: var(--accent-color, #007aff);
        }

        .module-item.disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .module-item.beta::after {
            content: 'BETA';
            font-size: 10px;
            background: var(--beta-badge-bg, #ff9500);
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: auto;
            font-weight: 600;
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .module-container {
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        .module-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            flex-direction: column;
            gap: 16px;
            opacity: 0.6;
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--accent-color, #007aff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .breadcrumb {
            padding: 16px 24px;
            background: var(--breadcrumb-background, rgba(0, 0, 0, 0.5));
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            font-size: 13px;
            color: var(--breadcrumb-color, rgba(255, 255, 255, 0.6));
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .breadcrumb-separator {
            opacity: 0.4;
        }

        /* Scrollbar styles */
        .navigation-sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .navigation-sidebar::-webkit-scrollbar-track {
            background: transparent;
        }

        .navigation-sidebar::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 3px;
        }

        .navigation-sidebar::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }
    `;

    static properties = {
        currentModule: { type: String },
        currentCategory: { type: String },
        expandedCategories: { type: Array },
        modules: { type: Object },
        loadingModule: { type: Boolean }
    };

    constructor() {
        super();
        this.currentModule = 'task-management';
        this.currentCategory = 'business';
        this.expandedCategories = ['business']; // Start with business category expanded
        this.loadingModule = false;
        this.initializeModules();
    }

    initializeModules() {
        // Module registry based on PRD architecture
        this.modules = {
            core: {
                name: 'Core Dashboard',
                icon: '📊',
                modules: [
                    { id: 'overview', name: 'Overview', status: 'ready' },
                    { id: 'analytics-dashboard', name: 'Analytics Dashboard', status: 'ready' },
                    { id: 'business-intelligence', name: 'Business Intelligence', status: 'ready' },
                    { id: 'insights', name: 'AI Insights', status: 'beta' }
                ]
            },
            business: {
                name: 'Business Operations',
                icon: '💼',
                modules: [
                    { id: 'executive-dashboard', name: 'Executive Dashboard', status: 'pending' },
                    { id: 'task-management', name: 'Task Management', status: 'ready' },
                    { id: 'finance-operations', name: 'Finance Operations', status: 'pending' },
                    { id: 'hr-management', name: 'HR Management', status: 'pending' }
                ]
            },
            operations: {
                name: 'Operations',
                icon: '🔄',
                modules: [
                    { id: 'calendar-integration', name: 'Calendar Integration', status: 'pending' },
                    { id: 'communications-hub', name: 'Communications Hub', status: 'pending' },
                    { id: 'product-development', name: 'Product Development', status: 'pending' }
                ]
            },
            automation: {
                name: 'Automation',
                icon: '🤖',
                modules: [
                    { id: 'workflow-builder', name: 'Workflow Builder', status: 'pending' },
                    { id: 'ai-assistants', name: 'AI Assistants', status: 'pending' },
                    { id: 'report-generation', name: 'Report Generation', status: 'pending' }
                ]
            }
        };
    }

    toggleCategory(categoryId) {
        if (this.expandedCategories.includes(categoryId)) {
            this.expandedCategories = this.expandedCategories.filter(id => id !== categoryId);
        } else {
            this.expandedCategories = [...this.expandedCategories, categoryId];
        }
    }

    async selectModule(moduleId, categoryId) {
        if (this.currentModule === moduleId) return;

        // Find the module
        const category = this.modules[categoryId];
        const module = category?.modules.find(m => m.id === moduleId);
        
        if (!module || module.status === 'pending') {
            console.log(`Module ${moduleId} is not ready yet`);
            return;
        }

        this.loadingModule = true;
        this.currentModule = moduleId;
        this.currentCategory = categoryId;

        // Dispatch module change event
        this.dispatchEvent(new CustomEvent('module-changed', {
            detail: { moduleId, categoryId, module },
            bubbles: true
        }));

        // Simulate loading delay for better UX
        setTimeout(() => {
            this.loadingModule = false;
        }, 300);
    }

    getBreadcrumb() {
        const category = this.modules[this.currentCategory];
        const module = category?.modules.find(m => m.id === this.currentModule);
        
        if (!category || !module) return [];
        
        return [
            { name: 'LIMS', path: null },
            { name: category.name, path: this.currentCategory },
            { name: module.name, path: this.currentModule }
        ];
    }

    renderCategoryIcon(iconEmoji) {
        return html`
            <span class="category-icon" style="font-size: 16px;">${iconEmoji}</span>
        `;
    }

    renderChevronIcon() {
        return html`
            <svg class="category-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
        `;
    }

    renderModuleStatus(status) {
        switch (status) {
            case 'ready':
                return '';
            case 'beta':
                return 'beta';
            case 'pending':
                return '';
            default:
                return '';
        }
    }

    renderCategory(categoryId, category) {
        const isExpanded = this.expandedCategories.includes(categoryId);
        
        return html`
            <div class="category ${isExpanded ? 'expanded' : ''}">
                <div class="category-header" @click=${() => this.toggleCategory(categoryId)}>
                    ${this.renderCategoryIcon(category.icon)}
                    ${category.name}
                    ${this.renderChevronIcon()}
                </div>
                <div class="category-modules">
                    ${category.modules.map(module => html`
                        <div 
                            class="module-item ${this.currentModule === module.id ? 'active' : ''} ${module.status === 'pending' ? 'disabled' : ''} ${this.renderModuleStatus(module.status)}"
                            @click=${() => this.selectModule(module.id, categoryId)}
                        >
                            ${module.name}
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderBreadcrumb() {
        const breadcrumb = this.getBreadcrumb();
        
        return html`
            <div class="breadcrumb">
                ${breadcrumb.map((item, index) => html`
                    ${index > 0 ? html`<span class="breadcrumb-separator">›</span>` : ''}
                    <span>${item.name}</span>
                `)}
            </div>
        `;
    }

    renderModuleContent() {
        if (this.loadingModule) {
            return html`
                <div class="module-loading">
                    <div class="loading-spinner"></div>
                    <div>Loading module...</div>
                </div>
            `;
        }

        // Return slot for dynamic module content
        return html`<slot name="module-content"></slot>`;
    }

    render() {
        return html`
            <div class="navigation-sidebar">
                <div class="sidebar-header">
                    <div class="lims-logo">
                        🏢 LIMS
                    </div>
                    <div class="lims-subtitle">
                        LEARN-X Internal Management
                    </div>
                </div>
                
                <div class="module-categories">
                    ${Object.entries(this.modules).map(([categoryId, category]) => 
                        this.renderCategory(categoryId, category)
                    )}
                </div>
            </div>

            <div class="main-content">
                ${this.renderBreadcrumb()}
                <div class="module-container">
                    ${this.renderModuleContent()}
                </div>
            </div>
        `;
    }
}

customElements.define('lims-module-loader', LIMSModuleLoader);