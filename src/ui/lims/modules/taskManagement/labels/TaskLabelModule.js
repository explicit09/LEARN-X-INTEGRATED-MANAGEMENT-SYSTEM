import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * TaskLabelModule - Comprehensive label management for tasks
 * Provides label creation, editing, deletion, and color management
 */
export class TaskLabelModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .label-manager {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
        }

        .label-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .label-title {
            font-size: 18px;
            font-weight: 600;
            color: #e5e5e7;
        }

        .create-label-btn {
            background: #007aff;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .create-label-btn:hover {
            background: #0056b3;
        }

        .label-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .label-item {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s;
        }

        .label-item:hover {
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(0, 0, 0, 0.5);
        }

        .label-color {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .color-input {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .label-info {
            flex: 1;
        }

        .label-name {
            font-size: 14px;
            font-weight: 500;
            color: #e5e5e7;
            margin-bottom: 4px;
        }

        .label-count {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        .label-actions {
            display: flex;
            gap: 8px;
        }

        .label-action-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            padding: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .label-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .label-action-btn.delete:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .label-icon {
            width: 16px;
            height: 16px;
        }

        /* Label Creation/Edit Modal */
        .label-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        }

        .label-modal-content {
            background: rgba(30, 30, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #e5e5e7;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 6px;
        }

        .form-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            color: #e5e5e7;
            transition: all 0.2s;
            outline: none;
            box-sizing: border-box;
        }

        .form-input:focus {
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.6);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .color-picker-group {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .color-preview {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .color-presets {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 8px;
            margin-top: 12px;
        }

        .color-preset {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
        }

        .color-preset:hover {
            transform: scale(1.1);
        }

        .color-preset.selected {
            border-color: white;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }

        .button {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .button-primary {
            background: #007aff;
            color: white;
        }

        .button-primary:hover {
            background: #0056b3;
        }

        .button-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e7;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .button-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        /* Label selector for task forms */
        .label-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            min-height: 44px;
        }

        .label-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }

        .label-chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .label-chip.selected {
            border-color: rgba(255, 255, 255, 0.3);
        }

        .label-chip-remove {
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.3);
            font-size: 10px;
            cursor: pointer;
        }

        .label-chip-remove:hover {
            background: rgba(0, 0, 0, 0.5);
        }

        .add-label-btn {
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.3);
            color: rgba(255, 255, 255, 0.6);
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .add-label-btn:hover {
            border-color: rgba(255, 255, 255, 0.5);
            color: rgba(255, 255, 255, 0.8);
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: rgba(255, 255, 255, 0.5);
        }

        .empty-state-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            opacity: 0.3;
        }

        .empty-state-text {
            font-size: 14px;
            margin-bottom: 16px;
        }
    `;

    static properties = {
        labels: { type: Array },
        selectedLabels: { type: Array },
        showModal: { type: Boolean },
        editingLabel: { type: Object },
        taskCount: { type: Object }
    };

    constructor() {
        super();
        this.labels = [];
        this.selectedLabels = [];
        this.showModal = false;
        this.editingLabel = null;
        this.taskCount = {};
        this.presetColors = [
            '#ef4444', // red
            '#f97316', // orange
            '#f59e0b', // amber
            '#eab308', // yellow
            '#84cc16', // lime
            '#22c55e', // green
            '#10b981', // emerald
            '#14b8a6', // teal
            '#06b6d4', // cyan
            '#0ea5e9', // sky
            '#3b82f6', // blue
            '#6366f1', // indigo
            '#8b5cf6', // violet
            '#a855f7', // purple
            '#d946ef', // fuchsia
            '#ec4899', // pink
        ];
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadLabels();
    }

    async loadLabels() {
        // Load labels from storage or API
        if (window.api?.lims?.getLabels) {
            this.labels = await window.api.lims.getLabels();
        } else {
            // Default labels for demo
            this.labels = [
                { id: '1', name: 'Bug', color: '#ef4444', count: 5 },
                { id: '2', name: 'Feature', color: '#22c55e', count: 12 },
                { id: '3', name: 'Enhancement', color: '#3b82f6', count: 8 },
                { id: '4', name: 'Documentation', color: '#8b5cf6', count: 3 },
                { id: '5', name: 'Testing', color: '#f59e0b', count: 7 },
            ];
        }
        
        // Count tasks per label
        this.updateTaskCounts();
    }

    async updateTaskCounts() {
        // This would count tasks that have each label
        // For now, using the count property from the label objects
        this.taskCount = {};
        this.labels.forEach(label => {
            this.taskCount[label.id] = label.count || 0;
        });
    }

    openCreateModal() {
        this.editingLabel = null;
        this.showModal = true;
    }

    openEditModal(label) {
        this.editingLabel = { ...label };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.editingLabel = null;
    }

    async saveLabel(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const labelData = {
            name: formData.get('name'),
            color: formData.get('color')
        };

        if (this.editingLabel) {
            // Update existing label
            const index = this.labels.findIndex(l => l.id === this.editingLabel.id);
            if (index !== -1) {
                this.labels[index] = { ...this.labels[index], ...labelData };
                this.labels = [...this.labels];
            }
        } else {
            // Create new label
            const newLabel = {
                id: Date.now().toString(),
                ...labelData,
                count: 0
            };
            this.labels = [...this.labels, newLabel];
        }

        // Save to backend if available
        if (window.api?.lims?.saveLabels) {
            await window.api.lims.saveLabels(this.labels);
        }

        this.closeModal();
        this.dispatchEvent(new CustomEvent('labels-updated', {
            detail: { labels: this.labels },
            bubbles: true,
            composed: true
        }));
    }

    async deleteLabel(label) {
        if (!confirm(`Delete label "${label.name}"? This will remove it from all tasks.`)) {
            return;
        }

        this.labels = this.labels.filter(l => l.id !== label.id);
        
        // Save to backend if available
        if (window.api?.lims?.saveLabels) {
            await window.api.lims.saveLabels(this.labels);
        }

        this.dispatchEvent(new CustomEvent('labels-updated', {
            detail: { labels: this.labels },
            bubbles: true,
            composed: true
        }));
    }

    selectColor(color) {
        const colorInput = this.shadowRoot.querySelector('input[name="color"]');
        if (colorInput) {
            colorInput.value = color;
            this.requestUpdate();
        }
    }

    toggleLabel(labelId) {
        if (this.selectedLabels.includes(labelId)) {
            this.selectedLabels = this.selectedLabels.filter(id => id !== labelId);
        } else {
            this.selectedLabels = [...this.selectedLabels, labelId];
        }
        
        this.dispatchEvent(new CustomEvent('labels-selected', {
            detail: { selectedLabels: this.selectedLabels },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="label-manager">
                <div class="label-header">
                    <h3 class="label-title">Labels</h3>
                    <button class="create-label-btn" @click=${this.openCreateModal}>
                        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Label
                    </button>
                </div>

                ${this.labels.length > 0 ? html`
                    <div class="label-grid">
                        ${this.labels.map(label => html`
                            <div class="label-item">
                                <div class="label-color" style="background: ${label.color}">
                                    <input 
                                        type="color" 
                                        class="color-input" 
                                        .value=${label.color}
                                        @change=${(e) => this.updateLabelColor(label, e.target.value)}
                                    />
                                </div>
                                <div class="label-info">
                                    <div class="label-name">${label.name}</div>
                                    <div class="label-count">${this.taskCount[label.id] || 0} tasks</div>
                                </div>
                                <div class="label-actions">
                                    <button class="label-action-btn" @click=${() => this.openEditModal(label)}>
                                        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button class="label-action-btn delete" @click=${() => this.deleteLabel(label)}>
                                        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `)}
                    </div>
                ` : html`
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 7h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
                            <path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <div class="empty-state-text">No labels yet</div>
                        <button class="create-label-btn" @click=${this.openCreateModal}>
                            Create your first label
                        </button>
                    </div>
                `}
            </div>

            ${this.showModal ? html`
                <div class="label-modal" @click=${(e) => e.target === e.currentTarget && this.closeModal()}>
                    <div class="label-modal-content">
                        <h3 class="modal-title">${this.editingLabel ? 'Edit Label' : 'Create New Label'}</h3>
                        
                        <form @submit=${this.saveLabel}>
                            <div class="form-group">
                                <label class="form-label">Label Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    class="form-input" 
                                    placeholder="Enter label name"
                                    .value=${this.editingLabel?.name || ''}
                                    required
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Color</label>
                                <div class="color-picker-group">
                                    <div 
                                        class="color-preview" 
                                        style="background: ${this.editingLabel?.color || '#3b82f6'}"
                                    >
                                        <input 
                                            type="color" 
                                            name="color" 
                                            class="color-input" 
                                            .value=${this.editingLabel?.color || '#3b82f6'}
                                        />
                                    </div>
                                    <span>Choose a color for this label</span>
                                </div>
                                <div class="color-presets">
                                    ${this.presetColors.map(color => html`
                                        <div 
                                            class="color-preset ${(this.editingLabel?.color || '#3b82f6') === color ? 'selected' : ''}"
                                            style="background: ${color}"
                                            @click=${() => this.selectColor(color)}
                                        ></div>
                                    `)}
                                </div>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="button button-secondary" @click=${this.closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" class="button button-primary">
                                    ${this.editingLabel ? 'Update' : 'Create'} Label
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ` : ''}
        `;
    }

    async updateLabelColor(label, color) {
        const index = this.labels.findIndex(l => l.id === label.id);
        if (index !== -1) {
            this.labels[index] = { ...this.labels[index], color };
            this.labels = [...this.labels];
            
            // Save to backend if available
            if (window.api?.lims?.saveLabels) {
                await window.api.lims.saveLabels(this.labels);
            }
            
            this.dispatchEvent(new CustomEvent('labels-updated', {
                detail: { labels: this.labels },
                bubbles: true,
                composed: true
            }));
        }
    }

    /**
     * Static method to render label selector for task forms
     */
    static renderLabelSelector(selectedLabels = [], allLabels = []) {
        return html`
            <div class="label-selector">
                ${selectedLabels.map(labelId => {
                    const label = allLabels.find(l => l.id === labelId);
                    if (!label) return '';
                    
                    return html`
                        <div 
                            class="label-chip selected" 
                            style="background: ${label.color}; color: white;"
                        >
                            ${label.name}
                            <span class="label-chip-remove">×</span>
                        </div>
                    `;
                })}
                <button type="button" class="add-label-btn">
                    + Add Label
                </button>
            </div>
        `;
    }

    /**
     * Static method to render label chips for display
     */
    static renderLabelChips(labels = [], allLabels = []) {
        return labels.map(labelId => {
            const label = allLabels.find(l => l.id === labelId || l.name === labelId);
            if (!label) return '';
            
            return html`
                <span 
                    class="label-chip" 
                    style="background: ${label.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;"
                >
                    ${label.name}
                </span>
            `;
        });
    }
}

customElements.define('task-label-module', TaskLabelModule);