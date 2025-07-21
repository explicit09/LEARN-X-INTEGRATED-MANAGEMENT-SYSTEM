import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * TaskTimeTrackingModule - Time tracking UI components for tasks
 * Provides UI for time estimation and time spent tracking
 */
export class TaskTimeTrackingModule extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .time-tracking-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }

        .time-input-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .time-input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 14px;
            color: #e5e5e7;
            transition: all 0.2s;
        }

        .time-input:focus {
            outline: none;
            border-color: #007aff;
            background: rgba(0, 0, 0, 0.5);
        }

        .time-unit {
            color: rgba(255, 255, 255, 0.6);
            font-size: 13px;
            min-width: 40px;
        }

        .time-tracking-display {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            font-size: 13px;
        }

        .time-icon {
            width: 16px;
            height: 16px;
            opacity: 0.7;
        }

        .time-label {
            color: rgba(255, 255, 255, 0.6);
        }

        .time-value {
            color: #e5e5e7;
            font-weight: 500;
        }

        .time-progress {
            flex: 1;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 8px;
        }

        .time-progress-bar {
            height: 100%;
            background: var(--accent-color, #007aff);
            transition: width 0.3s ease;
        }

        .time-progress-bar.overdue {
            background: var(--error-color, #ef4444);
        }

        .time-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
        }

        .time-badge.estimate {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }

        .time-badge.spent {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
        }

        .time-badge.overdue {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .quick-time-buttons {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }

        .quick-time-btn {
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .quick-time-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }
    `;

    static properties = {
        timeEstimate: { type: Number },
        timeSpent: { type: Number },
        isEditing: { type: Boolean }
    };

    constructor() {
        super();
        this.timeEstimate = 0;
        this.timeSpent = 0;
        this.isEditing = false;
    }

    /**
     * Render time tracking form fields for task creation/edit
     */
    static renderTimeTrackingFields(timeEstimate = 0, timeSpent = 0) {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">
                        <svg class="time-icon" style="display: inline-block; width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Time Estimate
                    </label>
                    <div class="time-input-group">
                        <input 
                            type="number" 
                            class="form-input" 
                            placeholder="0"
                            value="${timeEstimate || ''}"
                            data-field="time_estimate"
                            min="0"
                            step="0.5"
                        />
                        <span class="time-unit">hours</span>
                    </div>
                    <div class="quick-time-buttons">
                        <button type="button" class="quick-time-btn" data-time-field="time_estimate" data-hours="0.5">30m</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_estimate" data-hours="1">1h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_estimate" data-hours="2">2h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_estimate" data-hours="4">4h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_estimate" data-hours="8">1d</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <svg class="time-icon" style="display: inline-block; width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Time Spent
                    </label>
                    <div class="time-input-group">
                        <input 
                            type="number" 
                            class="form-input" 
                            placeholder="0"
                            value="${timeSpent || ''}"
                            data-field="time_spent"
                            min="0"
                            step="0.5"
                        />
                        <span class="time-unit">hours</span>
                    </div>
                    <div class="quick-time-buttons">
                        <button type="button" class="quick-time-btn" data-time-field="time_spent" data-hours="0.5">30m</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_spent" data-hours="1">1h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_spent" data-hours="2">2h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_spent" data-hours="4">4h</button>
                        <button type="button" class="quick-time-btn" data-time-field="time_spent" data-hours="8">1d</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render time tracking display for task cards
     */
    static renderTimeTrackingBadge(timeEstimate, timeSpent) {
        if (!timeEstimate && !timeSpent) return '';

        const progress = timeEstimate ? (timeSpent / timeEstimate) * 100 : 0;
        const isOverdue = progress > 100;

        return html`
            <div class="time-tracking-display">
                ${timeEstimate ? html`
                    <span class="time-badge estimate">
                        <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${timeEstimate}h
                    </span>
                ` : ''}
                
                ${timeSpent ? html`
                    <span class="time-badge ${isOverdue ? 'overdue' : 'spent'}">
                        <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        ${timeSpent}h
                    </span>
                ` : ''}
                
                ${timeEstimate && timeSpent ? html`
                    <div class="time-progress">
                        <div 
                            class="time-progress-bar ${isOverdue ? 'overdue' : ''}"
                            style="width: ${Math.min(progress, 100)}%"
                        ></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Format hours to human readable string
     */
    static formatHours(hours) {
        if (!hours) return '0h';
        
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    /**
     * Calculate time tracking status
     */
    static getTimeStatus(timeEstimate, timeSpent) {
        if (!timeEstimate || !timeSpent) return 'none';
        
        const ratio = timeSpent / timeEstimate;
        if (ratio > 1) return 'overdue';
        if (ratio > 0.8) return 'warning';
        return 'ontrack';
    }

    render() {
        return html`
            <div class="time-tracking-display">
                ${this.renderTimeInfo()}
            </div>
        `;
    }

    renderTimeInfo() {
        const progress = this.timeEstimate ? (this.timeSpent / this.timeEstimate) * 100 : 0;
        const status = TaskTimeTrackingModule.getTimeStatus(this.timeEstimate, this.timeSpent);

        return html`
            <span class="time-label">Time:</span>
            <span class="time-value">
                ${TaskTimeTrackingModule.formatHours(this.timeSpent)} / 
                ${TaskTimeTrackingModule.formatHours(this.timeEstimate)}
            </span>
            ${this.timeEstimate ? html`
                <div class="time-progress">
                    <div 
                        class="time-progress-bar ${status === 'overdue' ? 'overdue' : ''}"
                        style="width: ${Math.min(progress, 100)}%"
                    ></div>
                </div>
            ` : ''}
        `;
    }
}

customElements.define('task-time-tracking-module', TaskTimeTrackingModule);