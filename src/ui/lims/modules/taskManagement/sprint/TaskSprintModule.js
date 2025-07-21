import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * TaskSprintModule - Sprint management UI for tasks
 * Provides sprint creation, selection, and management functionality
 */
export class TaskSprintModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .sprint-selector {
            position: relative;
        }

        .sprint-dropdown {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            line-height: 1.3;
            color: #e5e5e7;
            width: 100%;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s;
            outline: none;
            -webkit-appearance: none;
            appearance: none;
            box-sizing: border-box;
        }

        .sprint-dropdown:hover {
            background: rgba(0, 0, 0, 0.5);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .sprint-dropdown:focus,
        .sprint-dropdown.active {
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.6);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .sprint-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .dropdown-icon {
            width: 16px;
            height: 16px;
            opacity: 0.6;
            transition: transform 0.2s;
        }

        .sprint-dropdown.active .dropdown-icon {
            transform: rotate(180deg);
        }

        .sprint-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            overflow: hidden;
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .sprint-option {
            padding: 10px 12px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sprint-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .sprint-option.selected {
            background: rgba(0, 122, 255, 0.2);
            color: #007aff;
        }

        .sprint-option.create-new {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #007aff;
            font-weight: 500;
        }

        .sprint-info {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
        }

        .sprint-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .sprint-badge.active {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border-color: rgba(16, 185, 129, 0.3);
        }

        .sprint-badge.completed {
            background: rgba(156, 163, 175, 0.2);
            color: #9ca3af;
            border-color: rgba(156, 163, 175, 0.3);
        }

        /* Sprint Creation Modal */
        .sprint-creation-modal {
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 24px;
            max-width: 500px;
            margin: 40px auto;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
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
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            color: #e5e5e7;
            transition: all 0.2s;
        }

        .form-input:focus {
            outline: none;
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.5);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 0;
        }

        .form-row .form-group {
            margin-bottom: 0;
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
    `;

    static properties = {
        selectedSprintId: { type: String },
        sprints: { type: Array },
        isOpen: { type: Boolean },
        showCreateModal: { type: Boolean },
        projectId: { type: String }
    };

    constructor() {
        super();
        this.selectedSprintId = null;
        this.sprints = [];
        this.isOpen = false;
        this.showCreateModal = false;
        this.projectId = null;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.projectId) {
            this.loadSprints();
        }
    }

    async loadSprints() {
        if (!this.projectId) return;
        
        try {
            this.sprints = await window.api.lims.getSprints(this.projectId);
            console.log(`[TaskSprintModule] Loaded ${this.sprints.length} sprints`);
        } catch (error) {
            console.error('[TaskSprintModule] Error loading sprints:', error);
        }
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    selectSprint(sprintId) {
        this.selectedSprintId = sprintId;
        this.isOpen = false;
        this.dispatchEvent(new CustomEvent('sprint-selected', {
            detail: { sprintId },
            bubbles: true,
            composed: true
        }));
    }

    openCreateModal() {
        this.showCreateModal = true;
        this.isOpen = false;
    }

    closeCreateModal() {
        this.showCreateModal = false;
    }

    async createSprint(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const sprintData = {
            name: formData.get('name'),
            goal: formData.get('goal'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            project_id: this.projectId,
            status: 'active'
        };

        try {
            const newSprint = await window.api.lims.createSprint(sprintData);
            console.log('[TaskSprintModule] Created sprint:', newSprint);
            
            // Reload sprints and select the new one
            await this.loadSprints();
            this.selectSprint(newSprint.id);
            this.closeCreateModal();
        } catch (error) {
            console.error('[TaskSprintModule] Error creating sprint:', error);
        }
    }

    getSelectedSprint() {
        return this.sprints.find(s => s.id === this.selectedSprintId);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getSprintStatus(sprint) {
        if (!sprint) return '';
        
        const now = new Date();
        const start = new Date(sprint.start_date);
        const end = new Date(sprint.end_date);
        
        if (now < start) return 'upcoming';
        if (now > end) return 'completed';
        return 'active';
    }

    render() {
        const selectedSprint = this.getSelectedSprint();
        
        return html`
            <div class="sprint-selector">
                <div 
                    class="sprint-dropdown ${this.isOpen ? 'active' : ''}"
                    @click=${this.toggleDropdown}
                >
                    <span class="sprint-name">
                        ${selectedSprint ? selectedSprint.name : 'No Sprint'}
                    </span>
                    <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                ${this.isOpen ? html`
                    <div class="sprint-options">
                        <div 
                            class="sprint-option ${!this.selectedSprintId ? 'selected' : ''}"
                            @click=${() => this.selectSprint(null)}
                        >
                            <span>No Sprint</span>
                        </div>
                        
                        ${this.sprints.map(sprint => {
                            const status = this.getSprintStatus(sprint);
                            return html`
                                <div 
                                    class="sprint-option ${sprint.id === this.selectedSprintId ? 'selected' : ''}"
                                    @click=${() => this.selectSprint(sprint.id)}
                                >
                                    <div>
                                        <div>${sprint.name}</div>
                                        <div class="sprint-info">
                                            ${this.formatDate(sprint.start_date)} - ${this.formatDate(sprint.end_date)}
                                        </div>
                                    </div>
                                    <span class="sprint-badge ${status}">${status}</span>
                                </div>
                            `;
                        })}
                        
                        <div class="sprint-option create-new" @click=${this.openCreateModal}>
                            <span>+ Create New Sprint</span>
                        </div>
                    </div>
                ` : ''}
            </div>

            ${this.showCreateModal ? html`
                <div class="modal-overlay" @click=${this.closeCreateModal}>
                    <div class="sprint-creation-modal" @click=${e => e.stopPropagation()}>
                        <h3 class="modal-title">Create New Sprint</h3>
                        
                        <form @submit=${this.createSprint}>
                            <div class="form-group">
                                <label class="form-label">Sprint Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    class="form-input" 
                                    placeholder="Sprint 1"
                                    required
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Sprint Goal</label>
                                <input 
                                    type="text" 
                                    name="goal" 
                                    class="form-input" 
                                    placeholder="Complete user authentication features"
                                />
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Start Date</label>
                                    <input 
                                        type="date" 
                                        name="start_date" 
                                        class="form-input"
                                        required
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">End Date</label>
                                    <input 
                                        type="date" 
                                        name="end_date" 
                                        class="form-input"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="button button-secondary" @click=${this.closeCreateModal}>
                                    Cancel
                                </button>
                                <button type="submit" class="button button-primary">
                                    Create Sprint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ` : ''}
        `;
    }

    /**
     * Static method to render sprint selector for forms
     */
    static renderSprintSelector(sprintId, projectId) {
        return `
            <div id="sprint-selector-container">
                <task-sprint-module 
                    .selectedSprintId="${sprintId || ''}"
                    .projectId="${projectId || ''}"
                ></task-sprint-module>
            </div>
        `;
    }

    /**
     * Static method to render sprint badge
     */
    static renderSprintBadge(sprint) {
        if (!sprint) return '';
        
        const now = new Date();
        const start = new Date(sprint.start_date);
        const end = new Date(sprint.end_date);
        
        let status = 'active';
        if (now < start) status = 'upcoming';
        if (now > end) status = 'completed';
        
        return `
            <span class="sprint-badge ${status}">
                <svg class="sprint-icon" style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
                ${sprint.name}
            </span>
        `;
    }
}

customElements.define('task-sprint-module', TaskSprintModule);