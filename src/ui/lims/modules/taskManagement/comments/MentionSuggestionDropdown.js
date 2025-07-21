import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * MentionSuggestionDropdown - Dropdown component for @mention suggestions
 * Shows a list of team members that match the current query
 */
export class MentionSuggestionDropdown extends LitElement {
    static styles = css`
        :host {
            position: absolute;
            z-index: 10000;
            display: none;
        }

        :host([visible]) {
            display: block;
        }

        .dropdown-container {
            background: rgba(30, 30, 30, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-height: 200px;
            overflow-y: auto;
            min-width: 200px;
        }

        /* Custom scrollbar */
        .dropdown-container::-webkit-scrollbar {
            width: 6px;
        }

        .dropdown-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
        }

        .dropdown-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }

        .dropdown-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .suggestion-list {
            padding: 4px 0;
        }

        .suggestion-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .suggestion-item:hover,
        .suggestion-item.selected {
            background: rgba(0, 122, 255, 0.2);
        }

        .suggestion-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;
            flex-shrink: 0;
        }

        .suggestion-info {
            flex: 1;
            min-width: 0;
        }

        .suggestion-name {
            font-size: 13px;
            font-weight: 500;
            color: #e5e5e7;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .suggestion-email {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .empty-state {
            padding: 16px;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 13px;
        }
    `;

    static properties = {
        suggestions: { type: Array },
        selectedIndex: { type: Number },
        visible: { type: Boolean, reflect: true },
        loading: { type: Boolean },
        position: { type: Object }
    };

    constructor() {
        super();
        this.suggestions = [];
        this.selectedIndex = 0;
        this.visible = false;
        this.loading = false;
        this.position = { top: 0, left: 0 };
    }

    updated(changedProperties) {
        if (changedProperties.has('position') && this.position) {
            this.style.top = `${this.position.top}px`;
            this.style.left = `${this.position.left}px`;
        }

        if (changedProperties.has('visible') && this.visible) {
            // Reset selection when showing
            this.selectedIndex = 0;
        }
    }

    selectNext() {
        if (this.suggestions.length > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
            this.scrollToSelected();
        }
    }

    selectPrevious() {
        if (this.suggestions.length > 0) {
            this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
            this.scrollToSelected();
        }
    }

    scrollToSelected() {
        const container = this.shadowRoot.querySelector('.dropdown-container');
        const selectedItem = this.shadowRoot.querySelector('.suggestion-item.selected');
        
        if (container && selectedItem) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = selectedItem.getBoundingClientRect();
            
            if (itemRect.bottom > containerRect.bottom) {
                selectedItem.scrollIntoView({ block: 'end', behavior: 'smooth' });
            } else if (itemRect.top < containerRect.top) {
                selectedItem.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        }
    }

    selectCurrent() {
        if (this.suggestions.length > 0 && this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
            const selected = this.suggestions[this.selectedIndex];
            this.dispatchEvent(new CustomEvent('mention-selected', {
                detail: selected,
                bubbles: true,
                composed: true
            }));
        }
    }

    handleItemClick(member) {
        this.dispatchEvent(new CustomEvent('mention-selected', {
            detail: member,
            bubbles: true,
            composed: true
        }));
    }

    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    generateAvatarColor(name) {
        if (!name) return '#6b7280';
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6',
            '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
            '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
            '#f43f5e'
        ];
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    render() {
        if (!this.visible) {
            return html``;
        }

        return html`
            <div class="dropdown-container">
                ${this.loading ? html`
                    <div class="empty-state">Loading team members...</div>
                ` : this.suggestions.length === 0 ? html`
                    <div class="empty-state">No team members found</div>
                ` : html`
                    <div class="suggestion-list">
                        ${this.suggestions.map((member, index) => html`
                            <div 
                                class="suggestion-item ${index === this.selectedIndex ? 'selected' : ''}"
                                @click=${() => this.handleItemClick(member)}
                                @mouseenter=${() => this.selectedIndex = index}
                            >
                                <div 
                                    class="suggestion-avatar"
                                    style="background: ${this.generateAvatarColor(member.name)}"
                                >
                                    ${this.getInitials(member.name)}
                                </div>
                                <div class="suggestion-info">
                                    <div class="suggestion-name">${member.name}</div>
                                    ${member.email ? html`
                                        <div class="suggestion-email">${member.email}</div>
                                    ` : ''}
                                </div>
                            </div>
                        `)}
                    </div>
                `}
            </div>
        `;
    }
}

customElements.define('mention-suggestion-dropdown', MentionSuggestionDropdown);