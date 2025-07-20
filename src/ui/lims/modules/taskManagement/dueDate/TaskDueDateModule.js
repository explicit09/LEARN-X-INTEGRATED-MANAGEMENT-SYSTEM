import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskDueDateModule - Due date management and visual indicators
 * Features: Due date badges, overdue highlighting, date sorting, calendar integration
 */
export class TaskDueDateModule extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        /* Due date badges */
        .due-date-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            border: 1px solid transparent;
        }

        .due-date-badge.today {
            background: var(--due-today-bg, #fef3c7);
            color: var(--due-today-text, #92400e);
            border-color: var(--due-today-border, #fbbf24);
        }

        .due-date-badge.tomorrow {
            background: var(--due-tomorrow-bg, #dbeafe);
            color: var(--due-tomorrow-text, #1e40af);
            border-color: var(--due-tomorrow-border, #60a5fa);
        }

        .due-date-badge.this-week {
            background: var(--due-week-bg, #f3e8ff);
            color: var(--due-week-text, #7c3aed);
            border-color: var(--due-week-border, #a78bfa);
        }

        .due-date-badge.overdue {
            background: var(--due-overdue-bg, #fee2e2);
            color: var(--due-overdue-text, #dc2626);
            border-color: var(--due-overdue-border, #f87171);
            animation: pulse-overdue 2s infinite;
        }

        .due-date-badge.future {
            background: var(--due-future-bg, #f0f9ff);
            color: var(--due-future-text, #0369a1);
            border-color: var(--due-future-border, #7dd3fc);
        }

        .due-date-badge.no-due-date {
            background: var(--due-none-bg, #f9fafb);
            color: var(--due-none-text, #6b7280);
            border-color: var(--due-none-border, #d1d5db);
        }

        @keyframes pulse-overdue {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .due-date-icon {
            width: 12px;
            height: 12px;
        }

        /* Task card overlays */
        .task-due-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .task-card.overdue .task-due-overlay {
            background: linear-gradient(135deg, 
                rgba(220, 38, 38, 0.1) 0%, 
                rgba(220, 38, 38, 0.05) 100%);
            border: 2px solid rgba(220, 38, 38, 0.3);
            opacity: 1;
        }

        .task-card.due-today .task-due-overlay {
            background: linear-gradient(135deg, 
                rgba(251, 191, 36, 0.1) 0%, 
                rgba(251, 191, 36, 0.05) 100%);
            border: 2px solid rgba(251, 191, 36, 0.3);
            opacity: 1;
        }

        /* Due date sorting controls */
        .due-date-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--control-bg, rgba(255, 255, 255, 0.05));
            border-radius: var(--border-radius, 7px);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .sort-button {
            background: transparent;
            border: none;
            color: var(--text-color, #e5e5e7);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .sort-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .sort-button.active {
            background: var(--accent-color, #007aff);
            color: white;
        }

        .sort-icon {
            width: 12px;
            height: 12px;
            transition: transform 0.2s;
        }

        .sort-button.desc .sort-icon {
            transform: rotate(180deg);
        }

        /* Calendar picker enhancement */
        .due-date-picker {
            position: relative;
        }

        .quick-date-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 8px;
        }

        .quick-date-btn {
            background: var(--quick-date-bg, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .quick-date-btn:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        /* Statistics display */
        .due-date-stats {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .stat-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .stat-dot.overdue { background: #dc2626; }
        .stat-dot.today { background: #f59e0b; }
        .stat-dot.upcoming { background: #3b82f6; }
    `;

    static properties = {
        tasks: { type: Array },
        sortBy: { type: String },
        sortDirection: { type: String },
        dueDateStats: { type: Object }
    };

    constructor() {
        super();
        this.tasks = [];
        this.sortBy = 'none';
        this.sortDirection = 'asc';
        this.dueDateStats = {
            overdue: 0,
            today: 0,
            tomorrow: 0,
            thisWeek: 0,
            future: 0,
            noDueDate: 0
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for task updates
        taskEventBus.on(TASK_EVENTS.TASKS_REFRESHED, (event) => {
            this.updateTasks(event.detail.tasks);
        });
    }

    updateTasks(tasks) {
        this.tasks = tasks || [];
        this.calculateDueDateStats();
        this.requestUpdate();
    }

    calculateDueDateStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        this.dueDateStats = {
            overdue: 0,
            today: 0,
            tomorrow: 0,
            thisWeek: 0,
            future: 0,
            noDueDate: 0
        };

        this.tasks.forEach(task => {
            if (!task.due_date) {
                this.dueDateStats.noDueDate++;
                return;
            }

            const dueDate = new Date(task.due_date);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

            if (dueDateOnly < today) {
                this.dueDateStats.overdue++;
            } else if (dueDateOnly.getTime() === today.getTime()) {
                this.dueDateStats.today++;
            } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
                this.dueDateStats.tomorrow++;
            } else if (dueDateOnly <= nextWeek) {
                this.dueDateStats.thisWeek++;
            } else {
                this.dueDateStats.future++;
            }
        });
    }

    getDueDateStatus(dueDate) {
        if (!dueDate) return 'no-due-date';

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const due = new Date(dueDate);
        const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

        if (dueDateOnly < today) return 'overdue';
        if (dueDateOnly.getTime() === today.getTime()) return 'today';
        if (dueDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
        if (dueDateOnly <= nextWeek) return 'this-week';
        return 'future';
    }

    formatDueDate(dueDate) {
        if (!dueDate) return 'No due date';

        const due = new Date(dueDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        const diffTime = dueDateOnly.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
        } else if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Tomorrow';
        } else if (diffDays <= 7) {
            return due.toLocaleDateString('en-US', { weekday: 'long' });
        } else if (diffDays <= 30) {
            return `${diffDays} days`;
        } else {
            return due.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    getDueDateIcon(status) {
        const icons = {
            'overdue': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
                <path d="M12 2L8 6h8l-4-4z" fill="currentColor"></path>
            </svg>`,
            'today': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>`,
            'tomorrow': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'this-week': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'future': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            'no-due-date': html`<svg class="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>`
        };
        return icons[status] || '';
    }

    renderDueDateBadge(task) {
        const status = this.getDueDateStatus(task.due_date);
        const text = this.formatDueDate(task.due_date);
        const icon = this.getDueDateIcon(status);

        return html`
            <span class="due-date-badge ${status}">
                ${icon}
                ${text}
            </span>
        `;
    }

    renderTaskOverlay(task) {
        const status = this.getDueDateStatus(task.due_date);
        if (status === 'overdue' || status === 'today') {
            return html`<div class="task-due-overlay"></div>`;
        }
        return '';
    }

    setSortBy(sortType) {
        if (this.sortBy === sortType) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortType;
            this.sortDirection = 'asc';
        }

        // Emit sort change event
        taskEventBus.emit(TASK_EVENTS.TASKS_SORT_CHANGED, {
            sortBy: this.sortBy,
            direction: this.sortDirection
        });
    }

    getQuickDateValue(type) {
        const today = new Date();
        const result = new Date(today);

        switch (type) {
            case 'today':
                return result.toISOString().split('T')[0];
            case 'tomorrow':
                result.setDate(today.getDate() + 1);
                return result.toISOString().split('T')[0];
            case 'next-week':
                result.setDate(today.getDate() + 7);
                return result.toISOString().split('T')[0];
            case 'end-of-month':
                result.setMonth(today.getMonth() + 1, 0);
                return result.toISOString().split('T')[0];
            default:
                return '';
        }
    }

    renderDueDateControls() {
        return html`
            <div class="due-date-controls">
                <span style="font-size: 12px; color: var(--text-muted, rgba(255, 255, 255, 0.6));">Sort by:</span>
                
                <button 
                    class="sort-button ${this.sortBy === 'due_date' ? 'active' : ''} ${this.sortDirection === 'desc' ? 'desc' : ''}"
                    @click=${() => this.setSortBy('due_date')}
                    title="Sort by due date"
                >
                    Due Date
                    <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </button>

                <button 
                    class="sort-button ${this.sortBy === 'priority' ? 'active' : ''} ${this.sortDirection === 'desc' ? 'desc' : ''}"
                    @click=${() => this.setSortBy('priority')}
                    title="Sort by priority"
                >
                    Priority
                    <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </button>

                <div class="due-date-stats">
                    ${this.dueDateStats.overdue > 0 ? html`
                        <div class="stat-item">
                            <div class="stat-dot overdue"></div>
                            ${this.dueDateStats.overdue} overdue
                        </div>
                    ` : ''}
                    ${this.dueDateStats.today > 0 ? html`
                        <div class="stat-item">
                            <div class="stat-dot today"></div>
                            ${this.dueDateStats.today} today
                        </div>
                    ` : ''}
                    ${this.dueDateStats.tomorrow + this.dueDateStats.thisWeek > 0 ? html`
                        <div class="stat-item">
                            <div class="stat-dot upcoming"></div>
                            ${this.dueDateStats.tomorrow + this.dueDateStats.thisWeek} upcoming
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderQuickDatePicker() {
        return html`
            <div class="quick-date-buttons">
                <button class="quick-date-btn" data-value="${this.getQuickDateValue('today')}">Today</button>
                <button class="quick-date-btn" data-value="${this.getQuickDateValue('tomorrow')}">Tomorrow</button>
                <button class="quick-date-btn" data-value="${this.getQuickDateValue('next-week')}">Next Week</button>
                <button class="quick-date-btn" data-value="${this.getQuickDateValue('end-of-month')}">End of Month</button>
                <button class="quick-date-btn" data-value="">Clear</button>
            </div>
        `;
    }

    render() {
        // This module provides utility methods and styles
        // Individual components are rendered by calling specific methods
        return html`<style>${this.constructor.styles.cssText}</style>`;
    }
}

// Static utility methods for use by other modules
TaskDueDateModule.getDueDateStatus = function(dueDate) {
    if (!dueDate) return 'no-due-date';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const due = new Date(dueDate);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDateOnly < today) return 'overdue';
    if (dueDateOnly.getTime() === today.getTime()) return 'today';
    if (dueDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
    if (dueDateOnly <= nextWeek) return 'this-week';
    return 'future';
};

TaskDueDateModule.formatDueDate = function(dueDate) {
    if (!dueDate) return 'No due date';

    const due = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffTime = dueDateOnly.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 1000));

    if (diffDays < 0) {
        return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
    } else if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Tomorrow';
    } else if (diffDays <= 7) {
        return due.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (diffDays <= 30) {
        return `${diffDays} days`;
    } else {
        return due.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
};

customElements.define('task-due-date-module', TaskDueDateModule);