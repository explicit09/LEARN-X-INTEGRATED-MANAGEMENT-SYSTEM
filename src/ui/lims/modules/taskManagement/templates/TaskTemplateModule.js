import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * TaskTemplateModule - Comprehensive task template management
 * Provides template creation, editing, deletion, and organization
 */
export class TaskTemplateModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .template-manager {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
        }

        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .template-title {
            font-size: 18px;
            font-weight: 600;
            color: #e5e5e7;
        }

        .create-template-btn {
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

        .create-template-btn:hover {
            background: #0056b3;
        }

        .template-categories {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .category-chip {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .category-chip:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .category-chip.active {
            background: #007aff;
            border-color: #007aff;
            color: white;
        }

        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .template-card {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .template-card:hover {
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .template-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            font-size: 20px;
        }

        .template-name {
            font-size: 16px;
            font-weight: 600;
            color: #e5e5e7;
            margin-bottom: 8px;
        }

        .template-description {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.5;
            margin-bottom: 12px;
        }

        .template-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }

        .template-actions {
            position: absolute;
            top: 12px;
            right: 12px;
            display: flex;
            gap: 8px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .template-card:hover .template-actions {
            opacity: 1;
        }

        .action-btn {
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

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .action-btn.delete:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .action-icon {
            width: 16px;
            height: 16px;
        }

        /* Template Creation/Edit Modal */
        .template-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(4px);
            overflow: auto;
        }

        .template-modal-content {
            background: rgba(30, 30, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            width: 600px;
            max-width: 90vw;
            height: calc(90vh - 40px);
            max-height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            margin: 20px;
            position: relative;
            overflow: hidden;
        }

        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #e5e5e7;
        }

        .modal-close {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e7;
        }

        .modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .modal-body::-webkit-scrollbar {
            width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
            background: transparent;
        }

        .modal-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
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

        .form-input, .form-textarea, .form-select {
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

        .form-input:focus, .form-textarea:focus, .form-select:focus {
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.6);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }

        .icon-selector {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 8px;
            margin-top: 8px;
        }

        .icon-option {
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid transparent;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 20px;
        }

        .icon-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .icon-option.selected {
            border-color: #007aff;
            background: rgba(0, 122, 255, 0.2);
        }

        .template-content-editor {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 16px;
            margin-top: 8px;
        }

        .template-field {
            margin-bottom: 12px;
        }

        .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            flex-shrink: 0;
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
        templates: { type: Array },
        selectedCategory: { type: String },
        showModal: { type: Boolean },
        editingTemplate: { type: Object },
        loading: { type: Boolean }
    };

    constructor() {
        super();
        this.templates = [];
        this.selectedCategory = 'all';
        this.showModal = false;
        this.editingTemplate = null;
        this.loading = false;
        this.categories = [
            { id: 'all', name: 'All Templates' },
            { id: 'development', name: 'Development', icon: '💻' },
            { id: 'support', name: 'Customer Support', icon: '🎧' },
            { id: 'analytics', name: 'Analytics & Reports', icon: '📊' },
            { id: 'infrastructure', name: 'Infrastructure', icon: '🔧' },
            { id: 'business', name: 'Business Ops', icon: '💼' },
            { id: 'quality', name: 'Quality & Testing', icon: '✅' },
            { id: 'other', name: 'Other', icon: '📌' }
        ];
        this.iconOptions = ['💻', '🐛', '🚀', '🎧', '📊', '📈', '🔧', '⚡', '💼', '📅', '✅', '🔍'];
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadTemplates();
    }

    async loadTemplates() {
        this.loading = true;
        try {
            if (window.api?.lims?.getTaskTemplates) {
                this.templates = await window.api.lims.getTaskTemplates();
            } else {
                // Demo templates
                this.templates = this.getDemoTemplates();
            }
        } catch (error) {
            console.error('[TaskTemplateModule] Error loading templates:', error);
            this.templates = [];
        } finally {
            this.loading = false;
        }
    }

    getDemoTemplates() {
        return [
            {
                id: '1',
                name: 'Bug Fix',
                description: 'Template for tracking and fixing bugs',
                icon: '🐛',
                category: 'development',
                template: {
                    title: 'Fix: [BUG_DESCRIPTION]',
                    description: 'Investigate and resolve reported bug\n\nSteps to reproduce:\n1. \n2. \n\nExpected behavior:\n\nActual behavior:',
                    priority: 'high',
                    labels: ['bug', 'development'],
                    time_estimate: 3
                },
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Feature Development',
                description: 'New feature implementation template',
                icon: '🚀',
                category: 'development',
                template: {
                    title: 'Feature: [FEATURE_NAME]',
                    description: 'Implement new feature\n\nRequirements:\n- \n- \n\nAcceptance criteria:\n- ',
                    priority: 'medium',
                    labels: ['feature', 'development'],
                    time_estimate: 8
                },
                created_at: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Customer Support Ticket',
                description: 'Handle customer support requests',
                icon: '🎧',
                category: 'support',
                template: {
                    title: 'Support: [ISSUE_SUMMARY]',
                    description: 'Customer: [CUSTOMER_NAME]\nIssue: \n\nPriority: \nResolution:',
                    priority: 'high',
                    labels: ['support', 'customer'],
                    time_estimate: 1
                },
                created_at: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Platform Usage Report',
                description: 'Generate platform analytics report',
                icon: '📊',
                category: 'analytics',
                template: {
                    title: 'Report: [PERIOD] Platform Metrics',
                    description: 'Generate usage report for [PERIOD]\n\nMetrics to include:\n- Active users\n- Session duration\n- Feature usage\n- Performance metrics',
                    priority: 'medium',
                    labels: ['analytics', 'report'],
                    time_estimate: 2
                },
                created_at: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Server Maintenance',
                description: 'Scheduled server maintenance tasks',
                icon: '🔧',
                category: 'infrastructure',
                template: {
                    title: 'Maintenance: [SERVER/SERVICE]',
                    description: 'Perform maintenance on [SERVER/SERVICE]\n\nTasks:\n- Update packages\n- Check logs\n- Verify backups\n- Performance optimization',
                    priority: 'high',
                    labels: ['infrastructure', 'maintenance'],
                    time_estimate: 2
                },
                created_at: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Team Meeting',
                description: 'Team meeting and planning session',
                icon: '📅',
                category: 'business',
                template: {
                    title: 'Meeting: [MEETING_TYPE]',
                    description: 'Agenda:\n1. \n2. \n3. \n\nAttendees: \n\nAction items:',
                    priority: 'medium',
                    labels: ['meeting', 'planning'],
                    time_estimate: 1
                },
                created_at: new Date().toISOString()
            },
            {
                id: '7',
                name: 'Code Review',
                description: 'Code review for pull requests',
                icon: '✅',
                category: 'quality',
                template: {
                    title: 'Review: PR #[NUMBER] - [TITLE]',
                    description: 'Review pull request\n\nChecklist:\n- [ ] Code quality\n- [ ] Tests passing\n- [ ] Documentation updated\n- [ ] Performance impact',
                    priority: 'medium',
                    labels: ['review', 'quality'],
                    time_estimate: 1
                },
                created_at: new Date().toISOString()
            },
            {
                id: '8',
                name: 'User Onboarding Issue',
                description: 'Track and resolve user onboarding problems',
                icon: '🎧',
                category: 'support',
                template: {
                    title: 'Onboarding: [USER_EMAIL]',
                    description: 'User experiencing onboarding issue\n\nProblem:\n\nSteps taken:\n\nResolution:',
                    priority: 'high',
                    labels: ['onboarding', 'support'],
                    time_estimate: 0.5
                },
                created_at: new Date().toISOString()
            }
        ];
    }

    openCreateModal() {
        this.editingTemplate = null;
        this.showModal = true;
    }

    openEditModal(template) {
        this.editingTemplate = { ...template };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.editingTemplate = null;
    }

    handleSaveClick() {
        const form = this.shadowRoot.querySelector('.modal-body');
        if (form) {
            const event = new Event('submit', { cancelable: true });
            this.saveTemplate(event);
        }
    }

    async saveTemplate(event) {
        event.preventDefault();
        const form = this.shadowRoot.querySelector('.modal-body');
        const formData = new FormData(form);
        
        const templateData = {
            name: formData.get('name'),
            description: formData.get('description'),
            icon: formData.get('icon') || '📋',
            category: formData.get('category'),
            template: {
                title: formData.get('template_title'),
                description: formData.get('template_description'),
                priority: formData.get('template_priority'),
                labels: formData.get('template_labels')?.split(',').map(l => l.trim()).filter(Boolean) || [],
                time_estimate: parseFloat(formData.get('template_time_estimate')) || 0
            }
        };

        try {
            if (this.editingTemplate) {
                // Update existing template
                if (window.api?.lims?.updateTaskTemplate) {
                    await window.api.lims.updateTaskTemplate(this.editingTemplate.id, templateData);
                } else {
                    // Demo mode - update locally
                    const index = this.templates.findIndex(t => t.id === this.editingTemplate.id);
                    if (index !== -1) {
                        this.templates[index] = { ...this.templates[index], ...templateData };
                        this.templates = [...this.templates];
                    }
                }
            } else {
                // Create new template
                if (window.api?.lims?.createTaskTemplate) {
                    const newTemplate = await window.api.lims.createTaskTemplate(templateData);
                    this.templates = [...this.templates, newTemplate];
                } else {
                    // Demo mode - create locally
                    const newTemplate = {
                        id: Date.now().toString(),
                        ...templateData,
                        created_at: new Date().toISOString()
                    };
                    this.templates = [...this.templates, newTemplate];
                }
            }

            this.closeModal();
            this.dispatchEvent(new CustomEvent('templates-updated', {
                detail: { templates: this.templates },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[TaskTemplateModule] Error saving template:', error);
            alert('Failed to save template');
        }
    }

    async deleteTemplate(template) {
        if (!confirm(`Delete template "${template.name}"?`)) {
            return;
        }

        try {
            if (window.api?.lims?.deleteTaskTemplate) {
                await window.api.lims.deleteTaskTemplate(template.id);
            }
            
            this.templates = this.templates.filter(t => t.id !== template.id);
            
            this.dispatchEvent(new CustomEvent('templates-updated', {
                detail: { templates: this.templates },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('[TaskTemplateModule] Error deleting template:', error);
            alert('Failed to delete template');
        }
    }

    useTemplate(template) {
        this.dispatchEvent(new CustomEvent('template-selected', {
            detail: { template },
            bubbles: true,
            composed: true
        }));
    }

    selectIcon(icon) {
        const iconInput = this.shadowRoot.querySelector('input[name="icon"]');
        if (iconInput) {
            iconInput.value = icon;
            this.requestUpdate();
        }
    }

    render() {
        const filteredTemplates = this.selectedCategory === 'all'
            ? this.templates
            : this.templates.filter(t => t.category === this.selectedCategory);

        return html`
            <div class="template-manager">
                <div class="template-header">
                    <h3 class="template-title">Task Templates</h3>
                    <button class="create-template-btn" @click=${this.openCreateModal}>
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Template
                    </button>
                </div>

                <div class="template-categories">
                    ${this.categories.map(category => html`
                        <div 
                            class="category-chip ${this.selectedCategory === category.id ? 'active' : ''}"
                            @click=${() => this.selectedCategory = category.id}
                        >
                            ${category.icon || ''} ${category.name}
                        </div>
                    `)}
                </div>

                ${filteredTemplates.length > 0 ? html`
                    <div class="template-grid">
                        ${filteredTemplates.map(template => html`
                            <div class="template-card" @click=${() => this.useTemplate(template)}>
                                <div class="template-actions">
                                    <button class="action-btn" @click=${(e) => { e.stopPropagation(); this.openEditModal(template); }}>
                                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button class="action-btn delete" @click=${(e) => { e.stopPropagation(); this.deleteTemplate(template); }}>
                                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                                
                                <div class="template-icon">${template.icon || '📋'}</div>
                                <div class="template-name">${template.name}</div>
                                <div class="template-description">${template.description}</div>
                                
                                <div class="template-meta">
                                    <span>${this.categories.find(c => c.id === template.category)?.name || 'Other'}</span>
                                    <span>${new Date(template.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `)}
                    </div>
                ` : html`
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <div class="empty-state-text">No templates yet</div>
                        <button class="create-template-btn" @click=${this.openCreateModal}>
                            Create your first template
                        </button>
                    </div>
                `}
            </div>

            ${this.showModal ? html`
                <div class="template-modal" @click=${(e) => e.target === e.currentTarget && this.closeModal()}>
                    <div class="template-modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title">${this.editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
                            <button type="button" class="modal-close" @click=${this.closeModal}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        
                        <form @submit=${this.saveTemplate} class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Template Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    class="form-input" 
                                    placeholder="Enter template name"
                                    .value=${this.editingTemplate?.name || ''}
                                    required
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea 
                                    name="description" 
                                    class="form-textarea" 
                                    placeholder="Describe what this template is for"
                                    .value=${this.editingTemplate?.description || ''}
                                ></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select name="category" class="form-select" .value=${this.editingTemplate?.category || 'other'}>
                                    ${this.categories.filter(c => c.id !== 'all').map(category => html`
                                        <option value="${category.id}">${category.name}</option>
                                    `)}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Icon</label>
                                <input type="hidden" name="icon" .value=${this.editingTemplate?.icon || '📋'} />
                                <div class="icon-selector">
                                    ${this.iconOptions.map(icon => html`
                                        <div 
                                            class="icon-option ${(this.editingTemplate?.icon || '📋') === icon ? 'selected' : ''}"
                                            @click=${() => this.selectIcon(icon)}
                                        >
                                            ${icon}
                                        </div>
                                    `)}
                                </div>
                            </div>
                            
                            <h4 style="margin-top: 24px; margin-bottom: 16px; color: #e5e5e7;">Template Content</h4>
                            
                            <div class="template-content-editor">
                                <div class="template-field">
                                    <label class="form-label">Task Title Template</label>
                                    <input 
                                        type="text" 
                                        name="template_title" 
                                        class="form-input" 
                                        placeholder="e.g., Analyze Sample [SAMPLE_ID]"
                                        .value=${this.editingTemplate?.template?.title || ''}
                                        required
                                    />
                                    <small style="color: rgba(255,255,255,0.5); font-size: 12px;">
                                        Use [PLACEHOLDERS] for dynamic values
                                    </small>
                                </div>
                                
                                <div class="template-field">
                                    <label class="form-label">Default Description</label>
                                    <textarea 
                                        name="template_description" 
                                        class="form-textarea" 
                                        placeholder="Default task description"
                                        .value=${this.editingTemplate?.template?.description || ''}
                                    ></textarea>
                                </div>
                                
                                <div class="template-field">
                                    <label class="form-label">Default Priority</label>
                                    <select name="template_priority" class="form-select" .value=${this.editingTemplate?.template?.priority || 'medium'}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                
                                <div class="template-field">
                                    <label class="form-label">Default Labels (comma-separated)</label>
                                    <input 
                                        type="text" 
                                        name="template_labels" 
                                        class="form-input" 
                                        placeholder="e.g., lab, analysis, urgent"
                                        .value=${this.editingTemplate?.template?.labels?.join(', ') || ''}
                                    />
                                </div>
                                
                                <div class="template-field">
                                    <label class="form-label">Time Estimate (hours)</label>
                                    <input 
                                        type="number" 
                                        name="template_time_estimate" 
                                        class="form-input" 
                                        placeholder="0"
                                        step="0.5"
                                        min="0"
                                        .value=${this.editingTemplate?.template?.time_estimate || ''}
                                    />
                                </div>
                            </div>
                        </form>
                        
                        <div class="modal-footer">
                            <button type="button" class="button button-secondary" @click=${this.closeModal}>
                                Cancel
                            </button>
                            <button type="button" class="button button-primary" @click=${this.handleSaveClick}>
                                ${this.editingTemplate ? 'Update' : 'Create'} Template
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('task-template-module', TaskTemplateModule);