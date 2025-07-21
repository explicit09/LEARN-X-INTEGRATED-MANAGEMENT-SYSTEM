import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import './TaskLabelModule.js';

/**
 * TaskLabelManagementView - Full-page label management interface
 * Provides comprehensive label CRUD operations and organization
 */
export class TaskLabelManagementView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 24px;
            background: var(--background-color, #1a1a1a);
            min-height: 100vh;
        }

        .label-management-header {
            margin-bottom: 32px;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .page-title {
            font-size: 24px;
            font-weight: 700;
            color: #e5e5e7;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .title-icon {
            width: 32px;
            height: 32px;
            opacity: 0.8;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .action-button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #e5e5e7;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .action-button:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .action-button.primary {
            background: #007aff;
            border-color: #007aff;
            color: white;
        }

        .action-button.primary:hover {
            background: #0056b3;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
        }

        .breadcrumb-link {
            color: #007aff;
            text-decoration: none;
            transition: opacity 0.2s;
        }

        .breadcrumb-link:hover {
            opacity: 0.8;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #e5e5e7;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
        }

        .search-bar {
            margin-bottom: 24px;
        }

        .search-input {
            width: 100%;
            max-width: 400px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 10px 16px 10px 40px;
            font-size: 14px;
            color: #e5e5e7;
            transition: all 0.2s;
            outline: none;
        }

        .search-input:focus {
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.6);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            opacity: 0.5;
        }

        .content-section {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 24px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #e5e5e7;
        }

        .view-toggle {
            display: flex;
            gap: 4px;
            background: rgba(0, 0, 0, 0.3);
            padding: 2px;
            border-radius: 6px;
        }

        .view-toggle-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .view-toggle-btn.active {
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e7;
        }

        .tips-section {
            margin-top: 32px;
            padding: 20px;
            background: rgba(0, 122, 255, 0.1);
            border: 1px solid rgba(0, 122, 255, 0.3);
            border-radius: 8px;
        }

        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #60a5fa;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tips-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .tip-item {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            line-height: 1.6;
            padding-left: 20px;
            position: relative;
            margin-bottom: 8px;
        }

        .tip-item::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #60a5fa;
        }
    `;

    static properties = {
        labels: { type: Array },
        stats: { type: Object },
        searchQuery: { type: String },
        viewMode: { type: String }
    };

    constructor() {
        super();
        this.labels = [];
        this.stats = {
            totalLabels: 0,
            totalTasks: 0,
            mostUsed: '',
            leastUsed: ''
        };
        this.searchQuery = '';
        this.viewMode = 'grid';
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadLabels();
        this.calculateStats();
    }

    async loadLabels() {
        const labelModule = this.shadowRoot.querySelector('task-label-module');
        if (labelModule) {
            await labelModule.loadLabels();
            this.labels = labelModule.labels;
        }
    }

    calculateStats() {
        // Calculate statistics based on labels
        this.stats = {
            totalLabels: this.labels.length,
            totalTasks: this.labels.reduce((sum, label) => sum + (label.count || 0), 0),
            mostUsed: this.labels.reduce((max, label) => 
                (!max || label.count > max.count) ? label : max, null)?.name || 'None',
            leastUsed: this.labels.reduce((min, label) => 
                (!min || label.count < min.count) ? label : min, null)?.name || 'None'
        };
    }

    handleLabelsUpdated(event) {
        this.labels = event.detail.labels;
        this.calculateStats();
    }

    handleSearch(event) {
        this.searchQuery = event.target.value;
    }

    navigateBack() {
        // Navigate back to task management
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { view: 'tasks' },
            bubbles: true,
            composed: true
        }));
    }

    exportLabels() {
        const data = JSON.stringify(this.labels, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'labels-export.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async importLabels() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                try {
                    const imported = JSON.parse(text);
                    if (Array.isArray(imported)) {
                        // Merge with existing labels
                        const labelModule = this.shadowRoot.querySelector('task-label-module');
                        if (labelModule) {
                            labelModule.labels = [...labelModule.labels, ...imported];
                            await labelModule.updateTaskCounts();
                        }
                    }
                } catch (error) {
                    console.error('Failed to import labels:', error);
                }
            }
        };
        input.click();
    }

    render() {
        return html`
            <div class="label-management-header">
                <div class="breadcrumb">
                    <a href="#" class="breadcrumb-link" @click=${(e) => { e.preventDefault(); this.navigateBack(); }}>
                        Task Management
                    </a>
                    <span>›</span>
                    <span>Label Management</span>
                </div>
                
                <div class="header-content">
                    <h1 class="page-title">
                        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 7h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
                            <path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Label Management
                    </h1>
                    
                    <div class="header-actions">
                        <button class="action-button" @click=${this.importLabels}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Import
                        </button>
                        <button class="action-button" @click=${this.exportLabels}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.stats.totalLabels}</div>
                    <div class="stat-label">Total Labels</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.stats.totalTasks}</div>
                    <div class="stat-label">Tagged Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.stats.mostUsed}</div>
                    <div class="stat-label">Most Used Label</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.stats.leastUsed}</div>
                    <div class="stat-label">Least Used Label</div>
                </div>
            </div>

            <div class="search-bar" style="position: relative;">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Search labels..."
                    .value=${this.searchQuery}
                    @input=${this.handleSearch}
                />
            </div>

            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">All Labels</h2>
                    <div class="view-toggle">
                        <button 
                            class="view-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}"
                            @click=${() => this.viewMode = 'grid'}
                        >
                            Grid
                        </button>
                        <button 
                            class="view-toggle-btn ${this.viewMode === 'list' ? 'active' : ''}"
                            @click=${() => this.viewMode = 'list'}
                        >
                            List
                        </button>
                    </div>
                </div>
                
                <task-label-module
                    @labels-updated=${this.handleLabelsUpdated}
                ></task-label-module>
            </div>

            <div class="tips-section">
                <h3 class="tips-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Pro Tips
                </h3>
                <ul class="tips-list">
                    <li class="tip-item">Use consistent naming conventions for your labels (e.g., "bug-", "feature-", "priority-")</li>
                    <li class="tip-item">Choose distinct colors that are easy to differentiate at a glance</li>
                    <li class="tip-item">Regularly review and clean up unused labels to keep your system organized</li>
                    <li class="tip-item">Export your labels before making major changes for backup</li>
                </ul>
            </div>
        `;
    }
}

customElements.define('task-label-management-view', TaskLabelManagementView);