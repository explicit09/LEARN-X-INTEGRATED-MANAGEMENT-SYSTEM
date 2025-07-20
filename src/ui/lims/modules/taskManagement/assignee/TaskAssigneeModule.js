import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskAssigneeModule - Assignee management for task management
 * Features: User selection, avatar display, assignee filtering
 */
export class TaskAssigneeModule extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        /* Assignee Selector Styles */
        .assignee-selector {
            position: relative;
            width: 100%;
        }

        .assignee-dropdown {
            width: 100%;
            background: var(--input-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 10px 40px 10px 12px;
            border-radius: var(--border-radius, 7px);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .assignee-dropdown:hover {
            background: var(--input-hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        .assignee-dropdown.open {
            border-color: var(--accent-color, #007aff);
        }

        .dropdown-arrow {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            pointer-events: none;
            transition: transform 0.2s;
        }

        .assignee-dropdown.open .dropdown-arrow {
            transform: translateY(-50%) rotate(180deg);
        }

        .assignee-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: var(--dropdown-bg, rgba(0, 0, 0, 0.95));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: none;
        }

        .assignee-dropdown.open + .assignee-list {
            display: block;
        }

        .assignee-option {
            padding: 10px 12px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .assignee-option:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .assignee-option.selected {
            background: var(--selected-background, rgba(0, 122, 255, 0.2));
        }

        /* Avatar Styles */
        .assignee-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--avatar-bg, #007aff);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .assignee-avatar.small {
            width: 20px;
            height: 20px;
            font-size: 10px;
        }

        .assignee-avatar.large {
            width: 32px;
            height: 32px;
            font-size: 14px;
        }

        .assignee-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .assignee-info {
            flex: 1;
            min-width: 0;
        }

        .assignee-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color, #e5e5e7);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .assignee-role {
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .unassigned-text {
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        /* Search Input */
        .assignee-search {
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            position: sticky;
            top: 0;
            background: var(--dropdown-bg, rgba(0, 0, 0, 0.95));
        }

        .assignee-search input {
            width: 100%;
            background: var(--input-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
        }

        .assignee-search input:focus {
            border-color: var(--accent-color, #007aff);
        }

        /* Quick Filters */
        .assignee-quick-filters {
            display: flex;
            gap: 8px;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .quick-filter-btn {
            background: var(--button-bg, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .quick-filter-btn:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        .quick-filter-btn.active {
            background: var(--accent-color, #007aff);
            color: white;
            border-color: var(--accent-color, #007aff);
        }

        /* Empty State */
        .no-assignees {
            padding: 20px;
            text-align: center;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 13px;
        }
    `;

    static properties = {
        teamMembers: { type: Array },
        selectedAssigneeId: { type: String },
        isOpen: { type: Boolean },
        searchQuery: { type: String },
        quickFilter: { type: String },
        loading: { type: Boolean }
    };

    constructor() {
        super();
        this.teamMembers = [];
        this.selectedAssigneeId = null;
        this.isOpen = false;
        this.searchQuery = '';
        this.quickFilter = 'all';
        this.loading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadTeamMembers();
    }

    async loadTeamMembers() {
        if (this.loading) return;
        
        this.loading = true;
        try {
            if (window.api && window.api.lims) {
                const members = await window.api.lims.getTeamMembers();
                this.teamMembers = members || [];
                
                // Emit event for other modules
                taskEventBus.emit(TASK_EVENTS.ASSIGNEES_LOADED, {
                    members: this.teamMembers
                });
            }
        } catch (error) {
            console.error('[TaskAssigneeModule] Error loading team members:', error);
            this.teamMembers = [];
        } finally {
            this.loading = false;
        }
    }

    getFilteredMembers() {
        let filtered = [...this.teamMembers];

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(member => 
                member.name.toLowerCase().includes(query) ||
                member.email.toLowerCase().includes(query) ||
                (member.role && member.role.toLowerCase().includes(query))
            );
        }

        // Apply quick filter
        switch (this.quickFilter) {
            case 'developers':
                filtered = filtered.filter(m => 
                    m.role && m.role.toLowerCase().includes('developer')
                );
                break;
            case 'designers':
                filtered = filtered.filter(m => 
                    m.role && m.role.toLowerCase().includes('design')
                );
                break;
            case 'managers':
                filtered = filtered.filter(m => 
                    m.role && m.role.toLowerCase().includes('manager')
                );
                break;
        }

        return filtered;
    }

    getSelectedMember() {
        return this.teamMembers.find(m => m.id === this.selectedAssigneeId);
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.searchQuery = '';
            this.quickFilter = 'all';
        }
    }

    selectAssignee(memberId) {
        this.selectedAssigneeId = memberId;
        this.isOpen = false;
        
        // Emit selection event
        taskEventBus.emit(TASK_EVENTS.ASSIGNEE_SELECTED, {
            assigneeId: memberId,
            assignee: this.getSelectedMember()
        });
    }

    clearAssignee() {
        this.selectedAssigneeId = null;
        this.isOpen = false;
        
        // Emit removal event
        taskEventBus.emit(TASK_EVENTS.ASSIGNEE_REMOVED, {});
    }

    handleSearch(e) {
        this.searchQuery = e.target.value;
    }

    setQuickFilter(filter) {
        this.quickFilter = filter;
    }

    renderAvatar(member, size = '') {
        if (!member) {
            return html`
                <div class="assignee-avatar ${size}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            `;
        }

        const initials = member.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return html`
            <div class="assignee-avatar ${size}" style="background: ${this.getAvatarColor(member.name)}">
                ${member.avatar_url 
                    ? html`<img src="${member.avatar_url}" alt="${member.name}" />`
                    : initials
                }
            </div>
        `;
    }

    getAvatarColor(name) {
        // Generate consistent color based on name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 60%, 50%)`;
    }

    render() {
        const selectedMember = this.getSelectedMember();
        const filteredMembers = this.getFilteredMembers();

        return html`
            <div class="assignee-selector">
                <div 
                    class="assignee-dropdown ${this.isOpen ? 'open' : ''}"
                    @click=${this.toggleDropdown}
                >
                    ${selectedMember 
                        ? html`
                            ${this.renderAvatar(selectedMember)}
                            <div class="assignee-info">
                                <div class="assignee-name">${selectedMember.name}</div>
                            </div>
                        `
                        : html`
                            ${this.renderAvatar(null)}
                            <span class="unassigned-text">Unassigned</span>
                        `
                    }
                    <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                <div class="assignee-list">
                    <div class="assignee-search">
                        <input 
                            type="text"
                            placeholder="Search team members..."
                            .value=${this.searchQuery}
                            @input=${this.handleSearch}
                            @click=${(e) => e.stopPropagation()}
                        />
                    </div>

                    <div class="assignee-quick-filters">
                        <button 
                            class="quick-filter-btn ${this.quickFilter === 'all' ? 'active' : ''}"
                            @click=${() => this.setQuickFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            class="quick-filter-btn ${this.quickFilter === 'developers' ? 'active' : ''}"
                            @click=${() => this.setQuickFilter('developers')}
                        >
                            Developers
                        </button>
                        <button 
                            class="quick-filter-btn ${this.quickFilter === 'designers' ? 'active' : ''}"
                            @click=${() => this.setQuickFilter('designers')}
                        >
                            Designers
                        </button>
                        <button 
                            class="quick-filter-btn ${this.quickFilter === 'managers' ? 'active' : ''}"
                            @click=${() => this.setQuickFilter('managers')}
                        >
                            Managers
                        </button>
                    </div>

                    <div 
                        class="assignee-option ${!this.selectedAssigneeId ? 'selected' : ''}"
                        @click=${() => this.clearAssignee()}
                    >
                        ${this.renderAvatar(null)}
                        <div class="assignee-info">
                            <div class="assignee-name">Unassigned</div>
                            <div class="assignee-role">No assignee</div>
                        </div>
                    </div>

                    ${filteredMembers.length > 0 
                        ? filteredMembers.map(member => html`
                            <div 
                                class="assignee-option ${member.id === this.selectedAssigneeId ? 'selected' : ''}"
                                @click=${() => this.selectAssignee(member.id)}
                            >
                                ${this.renderAvatar(member)}
                                <div class="assignee-info">
                                    <div class="assignee-name">${member.name}</div>
                                    ${member.role ? html`
                                        <div class="assignee-role">${member.role}</div>
                                    ` : ''}
                                </div>
                            </div>
                        `)
                        : html`
                            <div class="no-assignees">
                                ${this.loading 
                                    ? 'Loading team members...' 
                                    : 'No team members found'
                                }
                            </div>
                        `
                    }
                </div>
            </div>
        `;
    }

    // Static utility method for rendering avatars elsewhere
    static renderAssigneeAvatar(member, size = '') {
        if (!member) {
            return html`
                <div class="assignee-avatar ${size}">?</div>
            `;
        }

        const initials = member.name ? member.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) : '?';

        // Generate consistent color
        let hash = 0;
        const name = member.name || '';
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        const color = `hsl(${hue}, 60%, 50%)`;

        return html`
            <div class="assignee-avatar ${size}" style="background: ${color}">
                ${member.avatar_url 
                    ? html`<img src="${member.avatar_url}" alt="${member.name}" />`
                    : initials
                }
            </div>
        `;
    }
}

customElements.define('task-assignee-module', TaskAssigneeModule);