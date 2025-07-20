import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskFilterModule - Advanced filtering system for task management
 * Features: Multiple filter types, filter presets, filter combinations
 */
export class TaskFilterModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .filter-container {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .filter-button {
            background: var(--button-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 8px 16px;
            border-radius: var(--border-radius, 7px);
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
        }

        .filter-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        .filter-button.active {
            background: var(--accent-color, #007aff);
            border-color: var(--accent-color, #007aff);
            color: white;
        }

        .filter-icon {
            width: 16px;
            height: 16px;
        }

        .filter-count {
            background: var(--badge-background, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
            min-width: 18px;
            text-align: center;
        }

        .filter-button.active .filter-count {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Filter dropdown */
        .filter-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            background: var(--dropdown-background, rgba(0, 0, 0, 0.95));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            min-width: 280px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.2s;
            pointer-events: none;
        }

        .filter-dropdown.visible {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        .dropdown-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            font-weight: 600;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .clear-filter {
            font-size: 12px;
            color: var(--accent-color, #007aff);
            cursor: pointer;
            font-weight: 500;
        }

        .clear-filter:hover {
            text-decoration: underline;
        }

        .filter-section {
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .filter-section:last-child {
            border-bottom: none;
        }

        .filter-section-title {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
            padding: 0 16px 8px;
            font-weight: 600;
        }

        .filter-option {
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.15s;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .filter-option:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .filter-checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid var(--border-color, rgba(255, 255, 255, 0.3));
            border-radius: 3px;
            position: relative;
            transition: all 0.2s;
        }

        .filter-option.selected .filter-checkbox {
            background: var(--accent-color, #007aff);
            border-color: var(--accent-color, #007aff);
        }

        .filter-checkbox::after {
            content: '';
            position: absolute;
            left: 2px;
            top: 0;
            width: 8px;
            height: 12px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg) scale(0);
            transition: transform 0.2s;
        }

        .filter-option.selected .filter-checkbox::after {
            transform: rotate(45deg) scale(1);
        }

        .filter-label {
            flex: 1;
            font-size: 13px;
        }

        .filter-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }

        /* Status badges */
        .status-todo { background: var(--status-todo, #3b82f6); }
        .status-in-progress { background: var(--status-progress, #f59e0b); }
        .status-review { background: var(--status-review, #8b5cf6); }
        .status-done { background: var(--status-done, #10b981); }

        /* Priority badges */
        .priority-urgent { background: var(--priority-urgent, #ef4444); }
        .priority-high { background: var(--priority-high, #f97316); }
        .priority-medium { background: var(--priority-medium, #3b82f6); }
        .priority-low { background: var(--priority-low, #6b7280); }

        /* Date picker */
        .date-filter {
            padding: 12px 16px;
        }

        .date-input-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
        }

        .date-input {
            flex: 1;
            background: var(--input-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
        }

        .date-input:focus {
            border-color: var(--accent-color, #007aff);
        }

        .date-separator {
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
        }

        /* Filter presets */
        .filter-presets {
            display: flex;
            gap: 8px;
            padding: 0 16px 12px;
        }

        .preset-chip {
            background: var(--chip-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .preset-chip:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        /* Active filters display */
        .active-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-left: 8px;
            padding-left: 8px;
            border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .active-filter-chip {
            background: var(--accent-color, #007aff);
            color: white;
            padding: 4px 8px 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .remove-filter {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }

        .remove-filter:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    `;

    static properties = {
        activeFilters: { type: Object },
        dropdownVisible: { type: String },
        taskCounts: { type: Object },
        availableLabels: { type: Array },
        availableAssignees: { type: Array }
    };

    constructor() {
        super();
        this.activeFilters = {
            status: [],
            priority: [],
            dateRange: null,
            labels: [],
            assignee: null
        };
        this.dropdownVisible = null;
        this.taskCounts = {};
        this.availableLabels = [];
        this.availableAssignees = [];
        this.loadFilterPresets();
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Event bus cleanup is handled by the bus itself
    }

    setupEventListeners() {
        // Listen for task updates to update counts
        taskEventBus.on(TASK_EVENTS.TASKS_REFRESHED, (event) => {
            this.updateTaskCounts(event.detail.tasks);
        });

        // Listen for assignee updates from assignee module
        taskEventBus.on(TASK_EVENTS.ASSIGNEES_LOADED, (event) => {
            this.availableAssignees = event.detail.assignees;
        });

        // Close dropdown on outside click
        this._handleOutsideClick = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this._handleOutsideClick);
    }

    handleOutsideClick(e) {
        if (!this.contains(e.target)) {
            this.dropdownVisible = null;
        }
    }

    updateTaskCounts(tasks) {
        // Calculate counts for each filter option
        this.taskCounts = {
            status: {
                todo: tasks.filter(t => t.status === 'todo').length,
                'in_progress': tasks.filter(t => t.status === 'in_progress').length,
                review: tasks.filter(t => t.status === 'review').length,
                done: tasks.filter(t => t.status === 'done').length
            },
            priority: {
                urgent: tasks.filter(t => t.priority === 'urgent').length,
                high: tasks.filter(t => t.priority === 'high').length,
                medium: tasks.filter(t => t.priority === 'medium').length,
                low: tasks.filter(t => t.priority === 'low').length
            }
        };

        // Extract unique labels
        const labels = new Set();
        tasks.forEach(task => {
            (task.labels || []).forEach(label => labels.add(label));
        });
        this.availableLabels = Array.from(labels);
    }

    toggleDropdown(filterType, event) {
        event.stopPropagation();
        this.dropdownVisible = this.dropdownVisible === filterType ? null : filterType;
    }

    toggleFilter(filterType, value) {
        if (filterType === 'status' || filterType === 'priority' || filterType === 'labels') {
            const index = this.activeFilters[filterType].indexOf(value);
            if (index > -1) {
                this.activeFilters[filterType].splice(index, 1);
            } else {
                this.activeFilters[filterType].push(value);
            }
        } else if (filterType === 'assignee') {
            this.activeFilters.assignee = this.activeFilters.assignee === value ? null : value;
        }

        this.requestUpdate();
        this.applyFilters();
    }

    setDateRange(startDate, endDate) {
        this.activeFilters.dateRange = { start: startDate, end: endDate };
        this.applyFilters();
    }

    clearFilter(filterType) {
        if (filterType === 'all') {
            this.activeFilters = {
                status: [],
                priority: [],
                dateRange: null,
                labels: [],
                assignee: null
            };
        } else if (filterType === 'status' || filterType === 'priority' || filterType === 'labels') {
            this.activeFilters[filterType] = [];
        } else {
            this.activeFilters[filterType] = null;
        }
        
        this.requestUpdate();
        this.applyFilters();
    }

    removeActiveFilter(filterType, value = null) {
        if (value && (filterType === 'status' || filterType === 'priority' || filterType === 'labels')) {
            const index = this.activeFilters[filterType].indexOf(value);
            if (index > -1) {
                this.activeFilters[filterType].splice(index, 1);
            }
        } else {
            this.activeFilters[filterType] = filterType === 'status' || filterType === 'priority' || filterType === 'labels' ? [] : null;
        }
        
        this.requestUpdate();
        this.applyFilters();
    }

    applyFilters() {
        taskEventBus.emit(TASK_EVENTS.FILTER_CHANGED, {
            filters: this.activeFilters
        });
    }

    applyPreset(preset) {
        switch (preset) {
            case 'my-tasks':
                this.activeFilters = {
                    ...this.activeFilters,
                    assignee: 'me'
                };
                break;
            case 'unassigned':
                this.activeFilters = {
                    ...this.activeFilters,
                    assignee: 'unassigned'
                };
                break;
            case 'due-soon':
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.activeFilters = {
                    ...this.activeFilters,
                    dateRange: { start: new Date(), end: tomorrow }
                };
                break;
            case 'high-priority':
                this.activeFilters = {
                    ...this.activeFilters,
                    priority: ['urgent', 'high']
                };
                break;
            case 'active':
                this.activeFilters = {
                    ...this.activeFilters,
                    status: ['todo', 'in_progress', 'review']
                };
                break;
        }
        
        this.requestUpdate();
        this.applyFilters();
        this.dropdownVisible = null;
    }

    saveFilterPreset() {
        // TODO: Implement custom filter preset saving
        const presetName = prompt('Enter a name for this filter preset:');
        if (presetName) {
            const presets = this.loadFilterPresets();
            presets[presetName] = { ...this.activeFilters };
            localStorage.setItem('task-filter-presets', JSON.stringify(presets));
            taskEventBus.emit(TASK_EVENTS.FILTER_PRESET_SAVED, { name: presetName });
        }
    }

    loadFilterPresets() {
        try {
            return JSON.parse(localStorage.getItem('task-filter-presets') || '{}');
        } catch {
            return {};
        }
    }

    getActiveFilterCount() {
        let count = 0;
        count += this.activeFilters.status.length;
        count += this.activeFilters.priority.length;
        count += this.activeFilters.labels.length;
        count += this.activeFilters.assignee ? 1 : 0;
        count += this.activeFilters.dateRange ? 1 : 0;
        return count;
    }

    renderFilterButton(type, label, icon) {
        const isActive = this.getFilterActiveState(type);
        const count = this.getFilterCount(type);

        return html`
            <button 
                class="filter-button ${isActive ? 'active' : ''}"
                @click=${(e) => this.toggleDropdown(type, e)}
            >
                ${icon}
                <span>${label}</span>
                ${count > 0 ? html`<span class="filter-count">${count}</span>` : ''}
                
                ${this.dropdownVisible === type ? this.renderDropdown(type) : ''}
            </button>
        `;
    }

    getFilterActiveState(type) {
        switch (type) {
            case 'status':
                return this.activeFilters.status.length > 0;
            case 'priority':
                return this.activeFilters.priority.length > 0;
            case 'date':
                return this.activeFilters.dateRange !== null;
            case 'labels':
                return this.activeFilters.labels.length > 0;
            case 'assignee':
                return this.activeFilters.assignee !== null;
            default:
                return false;
        }
    }

    getFilterCount(type) {
        switch (type) {
            case 'status':
                return this.activeFilters.status.length;
            case 'priority':
                return this.activeFilters.priority.length;
            case 'labels':
                return this.activeFilters.labels.length;
            case 'assignee':
                return this.activeFilters.assignee ? 1 : 0;
            case 'date':
                return this.activeFilters.dateRange ? 1 : 0;
            default:
                return 0;
        }
    }

    renderDropdown(type) {
        return html`
            <div class="filter-dropdown visible" @click=${(e) => e.stopPropagation()}>
                <div class="dropdown-header">
                    <span>Filter by ${type}</span>
                    ${this.getFilterCount(type) > 0 ? html`
                        <span class="clear-filter" @click=${() => this.clearFilter(type)}>Clear</span>
                    ` : ''}
                </div>
                
                ${type === 'status' ? this.renderStatusOptions() : ''}
                ${type === 'priority' ? this.renderPriorityOptions() : ''}
                ${type === 'date' ? this.renderDateOptions() : ''}
                ${type === 'labels' ? this.renderLabelOptions() : ''}
                ${type === 'assignee' ? this.renderAssigneeOptions() : ''}
                
                ${type === 'status' ? this.renderFilterPresets() : ''}
            </div>
        `;
    }

    renderStatusOptions() {
        const statuses = ['todo', 'in_progress', 'review', 'done'];
        
        return html`
            <div class="filter-section">
                ${statuses.map(status => html`
                    <div 
                        class="filter-option ${this.activeFilters.status.includes(status) ? 'selected' : ''}"
                        @click=${() => this.toggleFilter('status', status)}
                    >
                        <div class="filter-checkbox"></div>
                        <span class="filter-label">${this.formatLabel(status)}</span>
                        <span class="filter-badge status-${status.replace('_', '-')}">
                            ${this.taskCounts.status?.[status] || 0}
                        </span>
                    </div>
                `)}
            </div>
        `;
    }

    renderPriorityOptions() {
        const priorities = ['urgent', 'high', 'medium', 'low'];
        
        return html`
            <div class="filter-section">
                ${priorities.map(priority => html`
                    <div 
                        class="filter-option ${this.activeFilters.priority.includes(priority) ? 'selected' : ''}"
                        @click=${() => this.toggleFilter('priority', priority)}
                    >
                        <div class="filter-checkbox"></div>
                        <span class="filter-label">${this.formatLabel(priority)}</span>
                        <span class="filter-badge priority-${priority}">
                            ${this.taskCounts.priority?.[priority] || 0}
                        </span>
                    </div>
                `)}
            </div>
        `;
    }

    renderDateOptions() {
        return html`
            <div class="date-filter">
                <div class="filter-section-title">Date Range</div>
                <div class="date-input-group">
                    <input 
                        type="date" 
                        class="date-input"
                        @change=${(e) => this.handleDateChange('start', e.target.value)}
                    />
                    <span class="date-separator">to</span>
                    <input 
                        type="date" 
                        class="date-input"
                        @change=${(e) => this.handleDateChange('end', e.target.value)}
                    />
                </div>
            </div>
        `;
    }

    renderLabelOptions() {
        if (this.availableLabels.length === 0) {
            return html`
                <div class="filter-section">
                    <div style="padding: 16px; text-align: center; color: var(--text-muted, rgba(255, 255, 255, 0.5));">
                        No labels available
                    </div>
                </div>
            `;
        }

        return html`
            <div class="filter-section">
                ${this.availableLabels.map(label => html`
                    <div 
                        class="filter-option ${this.activeFilters.labels.includes(label) ? 'selected' : ''}"
                        @click=${() => this.toggleFilter('labels', label)}
                    >
                        <div class="filter-checkbox"></div>
                        <span class="filter-label">${label}</span>
                    </div>
                `)}
            </div>
        `;
    }

    renderAssigneeOptions() {
        return html`
            <div class="filter-section">
                <div 
                    class="filter-option ${this.activeFilters.assignee === 'me' ? 'selected' : ''}"
                    @click=${() => this.toggleFilter('assignee', 'me')}
                >
                    <div class="filter-checkbox"></div>
                    <span class="filter-label">Assigned to me</span>
                </div>
                <div 
                    class="filter-option ${this.activeFilters.assignee === 'unassigned' ? 'selected' : ''}"
                    @click=${() => this.toggleFilter('assignee', 'unassigned')}
                >
                    <div class="filter-checkbox"></div>
                    <span class="filter-label">Unassigned</span>
                </div>
            </div>
        `;
    }

    renderFilterPresets() {
        return html`
            <div class="filter-section">
                <div class="filter-section-title">Quick Filters</div>
                <div class="filter-presets">
                    <div class="preset-chip" @click=${() => this.applyPreset('my-tasks')}>My Tasks</div>
                    <div class="preset-chip" @click=${() => this.applyPreset('unassigned')}>Unassigned</div>
                    <div class="preset-chip" @click=${() => this.applyPreset('due-soon')}>Due Soon</div>
                    <div class="preset-chip" @click=${() => this.applyPreset('high-priority')}>High Priority</div>
                    <div class="preset-chip" @click=${() => this.applyPreset('active')}>Active</div>
                </div>
            </div>
        `;
    }

    renderActiveFilters() {
        const activeFilters = [];
        
        // Status filters
        this.activeFilters.status.forEach(status => {
            activeFilters.push({ type: 'status', value: status, label: this.formatLabel(status) });
        });
        
        // Priority filters
        this.activeFilters.priority.forEach(priority => {
            activeFilters.push({ type: 'priority', value: priority, label: this.formatLabel(priority) });
        });
        
        // Label filters
        this.activeFilters.labels.forEach(label => {
            activeFilters.push({ type: 'labels', value: label, label: label });
        });
        
        // Assignee filter
        if (this.activeFilters.assignee) {
            activeFilters.push({ type: 'assignee', value: this.activeFilters.assignee, label: this.formatLabel(this.activeFilters.assignee) });
        }
        
        // Date filter
        if (this.activeFilters.dateRange) {
            activeFilters.push({ type: 'dateRange', value: null, label: 'Date range' });
        }

        if (activeFilters.length === 0) return '';

        return html`
            <div class="active-filters">
                ${activeFilters.map(filter => html`
                    <div class="active-filter-chip">
                        <span>${filter.label}</span>
                        <button 
                            class="remove-filter"
                            @click=${() => this.removeActiveFilter(filter.type, filter.value)}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `)}
            </div>
        `;
    }

    formatLabel(value) {
        const labelMap = {
            'todo': 'To Do',
            'in_progress': 'In Progress',
            'review': 'Review',
            'done': 'Done',
            'urgent': 'Urgent',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low',
            'me': 'Me',
            'unassigned': 'Unassigned'
        };
        return labelMap[value] || value;
    }

    handleDateChange(type, value) {
        const currentRange = this.activeFilters.dateRange || { start: null, end: null };
        currentRange[type] = value ? new Date(value) : null;
        
        if (currentRange.start || currentRange.end) {
            this.activeFilters.dateRange = currentRange;
        } else {
            this.activeFilters.dateRange = null;
        }
        
        this.applyFilters();
    }

    render() {
        return html`
            <div class="filter-container">
                ${this.renderFilterButton('status', 'Status', html`
                    <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                `)}
                
                ${this.renderFilterButton('priority', 'Priority', html`
                    <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                `)}
                
                ${this.renderFilterButton('date', 'Due Date', html`
                    <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                `)}
                
                ${this.renderFilterButton('labels', 'Labels', html`
                    <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                `)}
                
                ${this.renderActiveFilters()}
            </div>
        `;
    }
}

customElements.define('task-filter-module', TaskFilterModule);