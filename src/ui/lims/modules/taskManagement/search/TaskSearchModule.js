import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

/**
 * TaskSearchModule - Modular search functionality for task management
 * Features: Real-time search, search history, search suggestions
 */
export class TaskSearchModule extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .search-container {
            position: relative;
            width: 100%;
        }

        .search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-input {
            width: 100%;
            background: var(--input-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 10px 40px 10px 40px;
            border-radius: var(--border-radius, 7px);
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
        }

        .search-input:focus {
            background: var(--input-focus-background, rgba(255, 255, 255, 0.15));
            border-color: var(--accent-color, #007aff);
        }

        .search-input::placeholder {
            color: var(--placeholder-color, rgba(255, 255, 255, 0.5));
        }

        .search-icon {
            position: absolute;
            left: 12px;
            width: 20px;
            height: 20px;
            color: var(--icon-color, rgba(255, 255, 255, 0.5));
            pointer-events: none;
        }

        .clear-button {
            position: absolute;
            right: 8px;
            background: transparent;
            border: none;
            color: var(--icon-color, rgba(255, 255, 255, 0.5));
            cursor: pointer;
            padding: 6px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s;
        }

        .clear-button.visible {
            opacity: 1;
        }

        .clear-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
            color: var(--text-color, #e5e5e7);
        }

        .search-shortcuts {
            position: absolute;
            right: 45px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.4));
        }

        .keyboard-shortcut {
            background: var(--keyboard-bg, rgba(255, 255, 255, 0.1));
            padding: 2px 6px;
            border-radius: 3px;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            font-family: monospace;
        }

        /* Search suggestions dropdown */
        .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: var(--dropdown-background, rgba(0, 0, 0, 0.9));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: var(--border-radius, 7px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.2s;
            pointer-events: none;
        }

        .search-suggestions.visible {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        .suggestion-group {
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .suggestion-group:last-child {
            border-bottom: none;
        }

        .suggestion-header {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-muted, rgba(255, 255, 255, 0.4));
            padding: 4px 12px;
            font-weight: 600;
        }

        .suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.15s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .suggestion-item:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .suggestion-item.selected {
            background: var(--accent-color, #007aff);
            color: white;
        }

        .suggestion-icon {
            width: 16px;
            height: 16px;
            opacity: 0.6;
        }

        .suggestion-text {
            flex: 1;
            font-size: 13px;
        }

        .suggestion-hint {
            font-size: 11px;
            color: var(--text-muted, rgba(255, 255, 255, 0.4));
        }

        /* Search results info */
        .search-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            font-size: 13px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .result-count {
            font-weight: 500;
        }

        .search-time {
            font-size: 12px;
            opacity: 0.8;
        }
    `;

    static properties = {
        searchQuery: { type: String },
        suggestions: { type: Array },
        showSuggestions: { type: Boolean },
        selectedSuggestionIndex: { type: Number },
        isSearching: { type: Boolean },
        searchResults: { type: Array },
        recentSearches: { type: Array }
    };

    constructor() {
        super();
        this.searchQuery = '';
        this.suggestions = [];
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
        this.isSearching = false;
        this.searchResults = [];
        this.recentSearches = this.loadRecentSearches();
        this._searchDebounceTimer = null;
    }

    connectedCallback() {
        super.connectedCallback();
        // Set up global keyboard listener for Cmd/Ctrl+F
        this._handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
        document.addEventListener('keydown', this._handleGlobalKeydown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._handleGlobalKeydown);
        if (this._searchDebounceTimer) {
            clearTimeout(this._searchDebounceTimer);
        }
    }

    handleGlobalKeydown(e) {
        // Cmd/Ctrl+F to focus search
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
            e.preventDefault();
            this.focusSearch();
        }
    }

    focusSearch() {
        const input = this.shadowRoot.querySelector('.search-input');
        if (input) {
            input.focus();
            input.select();
        }
    }

    handleSearchInput(e) {
        this.searchQuery = e.target.value;
        
        // Clear existing timer
        if (this._searchDebounceTimer) {
            clearTimeout(this._searchDebounceTimer);
        }

        // Show suggestions immediately for responsiveness
        this.updateSuggestions();

        // Debounce actual search
        this._searchDebounceTimer = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    handleSearchKeydown(e) {
        if (!this.showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(
                    this.selectedSuggestionIndex + 1,
                    this.getTotalSuggestions() - 1
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(
                    this.selectedSuggestionIndex - 1,
                    -1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0) {
                    this.selectSuggestion(this.selectedSuggestionIndex);
                } else {
                    this.performSearch();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.hideSuggestions();
                break;
        }
    }

    updateSuggestions() {
        if (!this.searchQuery) {
            this.showSuggestions = false;
            return;
        }

        const query = this.searchQuery.toLowerCase();
        const suggestions = [];

        // Recent searches that match
        const matchingRecent = this.recentSearches
            .filter(search => search.toLowerCase().includes(query))
            .slice(0, 3);
        
        if (matchingRecent.length > 0) {
            suggestions.push({
                type: 'recent',
                items: matchingRecent.map(search => ({
                    text: search,
                    icon: 'history'
                }))
            });
        }

        // Search operators
        const operators = [
            { text: 'status:todo', hint: 'Tasks in todo status' },
            { text: 'status:in-progress', hint: 'Tasks in progress' },
            { text: 'status:done', hint: 'Completed tasks' },
            { text: 'priority:high', hint: 'High priority tasks' },
            { text: 'assignee:me', hint: 'Tasks assigned to you' },
            { text: 'due:today', hint: 'Tasks due today' },
            { text: 'due:overdue', hint: 'Overdue tasks' }
        ];

        const matchingOperators = operators
            .filter(op => op.text.includes(query) || query.includes(':'))
            .slice(0, 4);

        if (matchingOperators.length > 0) {
            suggestions.push({
                type: 'operators',
                items: matchingOperators.map(op => ({
                    text: op.text,
                    hint: op.hint,
                    icon: 'filter'
                }))
            });
        }

        this.suggestions = suggestions;
        this.showSuggestions = suggestions.length > 0;
        this.selectedSuggestionIndex = -1;
    }

    getTotalSuggestions() {
        return this.suggestions.reduce((total, group) => total + group.items.length, 0);
    }

    selectSuggestion(index) {
        let currentIndex = 0;
        for (const group of this.suggestions) {
            for (const item of group.items) {
                if (currentIndex === index) {
                    this.searchQuery = item.text;
                    this.performSearch();
                    this.hideSuggestions();
                    return;
                }
                currentIndex++;
            }
        }
    }

    hideSuggestions() {
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
    }

    async performSearch() {
        if (!this.searchQuery.trim()) {
            taskEventBus.emit(TASK_EVENTS.SEARCH_QUERY_CHANGED, { query: '' });
            return;
        }

        this.isSearching = true;
        const startTime = performance.now();

        // Save to recent searches
        this.saveRecentSearch(this.searchQuery);

        // Emit search event for the main module to handle
        taskEventBus.emit(TASK_EVENTS.SEARCH_QUERY_CHANGED, {
            query: this.searchQuery,
            filters: this.parseSearchOperators(this.searchQuery)
        });

        // Hide suggestions after search
        this.hideSuggestions();

        // Simulate search time for UI feedback
        setTimeout(() => {
            this.isSearching = false;
            const searchTime = Math.round(performance.now() - startTime);
            taskEventBus.emit(TASK_EVENTS.SEARCH_RESULTS_UPDATED, {
                query: this.searchQuery,
                time: searchTime
            });
        }, 100);
    }

    parseSearchOperators(query) {
        const filters = {};
        const operators = {
            'status:': 'status',
            'priority:': 'priority',
            'assignee:': 'assignee',
            'due:': 'due'
        };

        for (const [operator, filterKey] of Object.entries(operators)) {
            const match = query.match(new RegExp(`${operator}(\\S+)`));
            if (match) {
                filters[filterKey] = match[1];
            }
        }

        return filters;
    }

    clearSearch() {
        this.searchQuery = '';
        this.hideSuggestions();
        taskEventBus.emit(TASK_EVENTS.SEARCH_QUERY_CHANGED, { query: '' });
    }

    saveRecentSearch(query) {
        const recent = this.recentSearches.filter(s => s !== query);
        recent.unshift(query);
        this.recentSearches = recent.slice(0, 10);
        localStorage.setItem('task-recent-searches', JSON.stringify(this.recentSearches));
    }

    loadRecentSearches() {
        try {
            return JSON.parse(localStorage.getItem('task-recent-searches') || '[]');
        } catch {
            return [];
        }
    }

    renderSuggestion(item, index, currentIndex) {
        const isSelected = currentIndex === this.selectedSuggestionIndex;
        
        return html`
            <div 
                class="suggestion-item ${isSelected ? 'selected' : ''}"
                @click=${() => this.selectSuggestion(currentIndex)}
            >
                ${this.renderSuggestionIcon(item.icon)}
                <span class="suggestion-text">${item.text}</span>
                ${item.hint ? html`<span class="suggestion-hint">${item.hint}</span>` : ''}
            </div>
        `;
    }

    renderSuggestionIcon(iconType) {
        const icons = {
            history: html`<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>`,
            filter: html`<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>`
        };
        return icons[iconType] || '';
    }

    render() {
        let suggestionIndex = 0;

        return html`
            <div class="search-container">
                <div class="search-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    
                    <input
                        type="text"
                        class="search-input"
                        placeholder="Search tasks... (Cmd+F)"
                        .value=${this.searchQuery}
                        @input=${this.handleSearchInput}
                        @keydown=${this.handleSearchKeydown}
                        @focus=${() => this.updateSuggestions()}
                        @blur=${() => setTimeout(() => this.hideSuggestions(), 200)}
                    />
                    
                    ${!this.searchQuery ? html`
                        <div class="search-shortcuts">
                            <span class="keyboard-shortcut">⌘F</span>
                        </div>
                    ` : ''}
                    
                    <button 
                        class="clear-button ${this.searchQuery ? 'visible' : ''}"
                        @click=${this.clearSearch}
                        title="Clear search"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="search-suggestions ${this.showSuggestions ? 'visible' : ''}">
                    ${this.suggestions.map(group => html`
                        <div class="suggestion-group">
                            <div class="suggestion-header">
                                ${group.type === 'recent' ? 'Recent Searches' : 'Search Operators'}
                            </div>
                            ${group.items.map((item, index) => {
                                const currentIndex = suggestionIndex++;
                                return this.renderSuggestion(item, index, currentIndex);
                            })}
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define('task-search-module', TaskSearchModule);