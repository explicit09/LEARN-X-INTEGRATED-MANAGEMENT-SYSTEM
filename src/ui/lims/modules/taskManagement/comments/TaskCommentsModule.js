import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';
import './MentionSuggestionDropdown.js';

/**
 * TaskCommentsModule - Comments and activity history for tasks
 * Features: Add comments, view activity history, real-time updates
 */
export class TaskCommentsModule extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
        }

        .comments-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--background-secondary, rgba(0, 0, 0, 0.2));
            border-radius: var(--border-radius, 7px);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            overflow: hidden;
        }

        .comments-header {
            padding: 16px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .comment-count {
            background: var(--badge-background, rgba(255, 255, 255, 0.1));
            color: var(--text-color, #e5e5e7);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }

        .filter-tabs {
            display: flex;
            gap: 16px;
        }

        .filter-tab {
            background: none;
            border: none;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 13px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .filter-tab:hover {
            color: var(--text-color, #e5e5e7);
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .filter-tab.active {
            color: var(--accent-color, #007aff);
            background: var(--accent-background, rgba(0, 122, 255, 0.1));
        }

        .comments-list {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        /* Custom scrollbar */
        .comments-list::-webkit-scrollbar {
            width: 8px;
        }

        .comments-list::-webkit-scrollbar-track {
            background: var(--scrollbar-track, rgba(255, 255, 255, 0.05));
            border-radius: 4px;
        }

        .comments-list::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.2));
            border-radius: 4px;
        }

        .comments-list::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.3));
        }

        .comment-item {
            display: flex;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .comment-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--avatar-background, #3b82f6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .comment-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .comment-header {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .comment-author {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
        }

        .comment-time {
            font-size: 11px;
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
        }

        .comment-body {
            font-size: 13px;
            color: var(--text-color, #e5e5e7);
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .comment-actions {
            display: flex;
            gap: 12px;
            margin-top: 4px;
        }

        .comment-action {
            background: none;
            border: none;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 12px;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 4px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .comment-action:hover {
            color: var(--accent-color, #007aff);
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        .comment-action svg {
            width: 14px;
            height: 14px;
        }

        /* Activity items */
        .activity-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .activity-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .activity-icon svg {
            width: 16px;
            height: 16px;
        }

        .activity-icon.created {
            background: var(--success-background, rgba(16, 185, 129, 0.1));
            color: var(--success-color, #10b981);
        }

        .activity-icon.updated {
            background: var(--info-background, rgba(59, 130, 246, 0.1));
            color: var(--info-color, #3b82f6);
        }

        .activity-icon.status {
            background: var(--warning-background, rgba(245, 158, 11, 0.1));
            color: var(--warning-color, #f59e0b);
        }

        .activity-icon.assigned {
            background: var(--purple-background, rgba(139, 92, 246, 0.1));
            color: var(--purple-color, #8b5cf6);
        }

        .activity-content {
            flex: 1;
            padding-top: 6px;
        }

        .activity-description {
            font-size: 13px;
            color: var(--text-color, #e5e5e7);
            line-height: 1.4;
        }

        .activity-description strong {
            font-weight: 600;
        }

        .activity-time {
            font-size: 11px;
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
            margin-top: 2px;
        }

        /* Comment input */
        .comment-input-container {
            padding: 16px;
            border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            background: var(--background-primary, rgba(0, 0, 0, 0.3));
        }

        .comment-input-wrapper {
            display: flex;
            gap: 12px;
        }

        .comment-input {
            flex: 1;
            background: var(--input-background, rgba(255, 255, 255, 0.1));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-color, #e5e5e7);
            padding: 10px 14px;
            border-radius: var(--border-radius, 7px);
            font-size: 13px;
            outline: none;
            resize: vertical;
            min-height: 40px;
            max-height: 120px;
            font-family: inherit;
            transition: all 0.2s;
        }

        .comment-input:focus {
            border-color: var(--accent-color, #007aff);
            background: var(--input-focus-background, rgba(255, 255, 255, 0.15));
        }

        .comment-input::placeholder {
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
        }

        .comment-submit {
            background: var(--accent-color, #007aff);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: var(--border-radius, 7px);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            align-self: flex-end;
        }

        .comment-submit:hover:not(:disabled) {
            background: var(--accent-hover, #0051d5);
            transform: translateY(-1px);
        }

        .comment-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 32px;
            text-align: center;
        }

        .empty-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
            color: var(--text-muted, rgba(255, 255, 255, 0.3));
        }

        .empty-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
            margin-bottom: 8px;
        }

        .empty-description {
            font-size: 13px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        /* Loading state */
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-top-color: var(--accent-color, #007aff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Mention styles */
        .mention {
            color: var(--accent-color, #007aff);
            background: var(--accent-background, rgba(0, 122, 255, 0.1));
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: 500;
        }

        .comment-input-container {
            position: relative;
        }

        mention-suggestion-dropdown {
            bottom: 100%;
            margin-bottom: 8px;
        }
    `;

    static properties = {
        taskId: { type: String },
        comments: { type: Array },
        activities: { type: Array },
        filterType: { type: String },
        isLoading: { type: Boolean },
        currentUser: { type: Object },
        teamMembers: { type: Array },
        showMentions: { type: Boolean },
        mentionQuery: { type: String },
        mentionSuggestions: { type: Array },
        mentionStartIndex: { type: Number }
    };

    constructor() {
        super();
        this.taskId = null;
        this.comments = [];
        this.activities = [];
        this.filterType = 'all'; // 'all', 'comments', 'activity'
        this.isLoading = false;
        this.currentUser = null;
        this.teamMembers = [];
        this.showMentions = false;
        this.mentionQuery = '';
        this.mentionSuggestions = [];
        this.mentionStartIndex = -1;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadCurrentUser();
        this.loadTeamMembers();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Listen for task selection
        taskEventBus.on(TASK_EVENTS.TASK_SELECTED, (event) => {
            this.taskId = event.detail.taskId;
            this.loadCommentsAndActivities();
        });

        // Listen for comment updates
        taskEventBus.on(TASK_EVENTS.COMMENT_ADDED, (event) => {
            if (event.detail.taskId === this.taskId) {
                this.comments = [...this.comments, event.detail.comment];
            }
        });

        // Listen for task updates to refresh activity
        taskEventBus.on(TASK_EVENTS.TASK_UPDATED, (event) => {
            if (event.detail.task?.id === this.taskId) {
                this.loadActivities();
            }
        });
    }

    removeEventListeners() {
        // Event bus cleanup is handled by the bus itself
    }

    async loadCurrentUser() {
        try {
            const user = await window.api.common.getCurrentUser();
            this.currentUser = user;
        } catch (error) {
            console.error('[TaskCommentsModule] Error loading current user:', error);
        }
    }

    async loadTeamMembers() {
        try {
            if (window.api?.lims?.getTeamMembers) {
                const members = await window.api.lims.getTeamMembers();
                this.teamMembers = members || [];
                console.log('[TaskCommentsModule] Loaded', this.teamMembers.length, 'team members');
            } else {
                // Demo team members
                this.teamMembers = [
                    { id: '1', name: 'John Doe', email: 'john.doe@learn-x.com' },
                    { id: '2', name: 'Jane Smith', email: 'jane.smith@learn-x.com' },
                    { id: '3', name: 'Bob Johnson', email: 'bob.johnson@learn-x.com' },
                    { id: '4', name: 'Alice Williams', email: 'alice.williams@learn-x.com' },
                    { id: '5', name: 'Charlie Brown', email: 'charlie.brown@learn-x.com' }
                ];
            }
        } catch (error) {
            console.error('[TaskCommentsModule] Error loading team members:', error);
            this.teamMembers = [];
        }
    }

    async loadCommentsAndActivities() {
        if (!this.taskId) return;

        this.isLoading = true;
        try {
            // Load comments
            const comments = await window.api.lims.getTaskComments(this.taskId);
            this.comments = comments || [];

            // Load activity history
            const activities = await window.api.lims.getTaskActivities(this.taskId);
            this.activities = activities || [];
        } catch (error) {
            console.error('[TaskCommentsModule] Error loading comments/activities:', error);
            this.comments = [];
            this.activities = [];
        } finally {
            this.isLoading = false;
        }
    }

    async loadActivities() {
        if (!this.taskId) return;

        try {
            const activities = await window.api.lims.getTaskActivities(this.taskId);
            this.activities = activities || [];
        } catch (error) {
            console.error('[TaskCommentsModule] Error loading activities:', error);
        }
    }

    async handleAddComment() {
        const input = this.shadowRoot.querySelector('.comment-input');
        const content = input.value.trim();

        if (!content || !this.taskId) return;

        try {
            const comment = await window.api.lims.addTaskComment(this.taskId, {
                content,
                author_id: this.currentUser?.uid,
                author_name: this.currentUser?.displayName || this.currentUser?.email || 'tmbuwa09@gmail.com',
                created_at: new Date().toISOString()
            });

            // Clear input
            input.value = '';

            // Add to local state
            this.comments = [...this.comments, comment];

            // Emit event
            taskEventBus.emit(TASK_EVENTS.COMMENT_ADDED, {
                taskId: this.taskId,
                comment
            });
        } catch (error) {
            console.error('[TaskCommentsModule] Error adding comment:', error);
        }
    }

    handleKeyDown(e) {
        // Handle mention dropdown navigation
        if (this.showMentions) {
            const dropdown = this.shadowRoot.querySelector('mention-suggestion-dropdown');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                dropdown?.selectNext();
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                dropdown?.selectPrevious();
                return;
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                dropdown?.selectCurrent();
                return;
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideMentionDropdown();
                return;
            }
        }

        // Normal enter key handling
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleAddComment();
        }
    }

    handleCommentInput(e) {
        const input = e.target;
        const value = input.value;
        const cursorPosition = input.selectionStart;

        // Find the last @ before cursor
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            // Check if we're still in a mention (no space after @)
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            if (!textAfterAt.includes(' ')) {
                // Show mention dropdown
                this.mentionStartIndex = lastAtIndex;
                this.mentionQuery = textAfterAt.toLowerCase();
                this.updateMentionSuggestions();
                this.showMentionDropdown(input);
            } else {
                this.hideMentionDropdown();
            }
        } else {
            this.hideMentionDropdown();
        }
    }

    updateMentionSuggestions() {
        if (!this.mentionQuery) {
            this.mentionSuggestions = this.teamMembers.slice(0, 5); // Show first 5 when no query
        } else {
            this.mentionSuggestions = this.teamMembers.filter(member => 
                member.name.toLowerCase().includes(this.mentionQuery) ||
                (member.email && member.email.toLowerCase().includes(this.mentionQuery))
            ).slice(0, 5); // Limit to 5 suggestions
        }
    }

    showMentionDropdown(input) {
        this.showMentions = true;
        
        // Calculate position for dropdown
        const inputRect = input.getBoundingClientRect();
        const containerRect = this.shadowRoot.querySelector('.comment-input-container').getBoundingClientRect();
        
        // Position relative to the input container
        const dropdown = this.shadowRoot.querySelector('mention-suggestion-dropdown');
        if (dropdown) {
            dropdown.position = {
                top: inputRect.top - containerRect.top - 8, // 8px above input
                left: 0
            };
        }
    }

    hideMentionDropdown() {
        this.showMentions = false;
        this.mentionQuery = '';
        this.mentionSuggestions = [];
        this.mentionStartIndex = -1;
    }

    handleMentionSelected(e) {
        const member = e.detail;
        const input = this.shadowRoot.querySelector('.comment-input');
        
        if (input && this.mentionStartIndex !== -1) {
            const value = input.value;
            const beforeMention = value.substring(0, this.mentionStartIndex);
            const afterMention = value.substring(input.selectionStart);
            
            // Create mention text with the member's name
            const mentionText = `@${member.name}`;
            
            // Update input value
            input.value = beforeMention + mentionText + ' ' + afterMention;
            
            // Set cursor position after the mention
            const newCursorPos = beforeMention.length + mentionText.length + 1;
            input.setSelectionRange(newCursorPos, newCursorPos);
            
            // Focus back on input
            input.focus();
        }
        
        this.hideMentionDropdown();
    }

    setFilterType(type) {
        this.filterType = type;
    }

    getFilteredItems() {
        if (this.filterType === 'comments') {
            return this.comments;
        } else if (this.filterType === 'activity') {
            return this.activities;
        } else {
            // Combine and sort by timestamp
            const allItems = [
                ...this.comments.map(c => ({ ...c, type: 'comment' })),
                ...this.activities.map(a => ({ ...a, type: 'activity' }))
            ];
            return allItems.sort((a, b) => 
                new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
            );
        }
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than a minute
        if (diff < 60000) return 'just now';
        
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        
        // Format as date
        return date.toLocaleDateString();
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

    parseMentions(text) {
        if (!text) return '';
        
        // Regular expression to match @mentions
        const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
        
        // Split text by mentions and create HTML
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            // Add text before mention
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            
            // Add mention as span
            const mentionName = match[1];
            // Check if this is a valid team member
            const isValidMember = this.teamMembers.some(member => 
                member.name.toLowerCase() === mentionName.toLowerCase()
            );
            
            if (isValidMember) {
                parts.push(html`<span class="mention">@${mentionName}</span>`);
            } else {
                parts.push(`@${mentionName}`);
            }
            
            lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        
        return parts;
    }

    renderComment(comment) {
        return html`
            <div class="comment-item">
                <div 
                    class="comment-avatar" 
                    style="background: ${this.generateAvatarColor(comment.author_name)}"
                >
                    ${this.getInitials(comment.author_name)}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author_name}</span>
                        <span class="comment-time">${this.formatTime(comment.created_at)}</span>
                    </div>
                    <div class="comment-body">${this.parseMentions(comment.content)}</div>
                    <div class="comment-actions">
                        <button class="comment-action">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            Like
                        </button>
                        <button class="comment-action">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderActivity(activity) {
        const iconType = this.getActivityIconType(activity.action);
        
        return html`
            <div class="activity-item">
                <div class="activity-icon ${iconType}">
                    ${this.getActivityIcon(activity.action)}
                </div>
                <div class="activity-content">
                    <div class="activity-description">
                        ${this.getActivityDescription(activity)}
                    </div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `;
    }

    getActivityIconType(action) {
        if (!action) return 'updated';
        if (action === 'created') return 'created';
        if (action.includes && action.includes('status')) return 'status';
        if (action.includes && action.includes('assigned')) return 'assigned';
        return 'updated';
    }

    getActivityIcon(action) {
        if (!action) {
            return html`<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>`;
        }
        if (action === 'created') {
            return html`<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2v20m10-10H2" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>`;
        }
        if (action.includes && action.includes('status')) {
            return html`<svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>`;
        }
        if (action.includes && action.includes('assigned')) {
            return html`<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M20 8v6m3-3h-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>`;
        }
        return html`<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>`;
    }

    getActivityDescription(activity) {
        if (!activity) return html`Activity occurred`;
        
        const user = html`<strong>${activity.user_name || 'Someone'}</strong>`;
        
        switch (activity.action) {
            case 'created':
                return html`${user} created this task`;
            case 'status_changed':
                return html`${user} changed status from <strong>${activity.from_value}</strong> to <strong>${activity.to_value}</strong>`;
            case 'assigned':
                return html`${user} assigned this task to <strong>${activity.to_value}</strong>`;
            case 'priority_changed':
                return html`${user} changed priority from <strong>${activity.from_value}</strong> to <strong>${activity.to_value}</strong>`;
            case 'due_date_changed':
                return html`${user} changed due date to <strong>${activity.to_value ? new Date(activity.to_value).toLocaleDateString() : 'none'}</strong>`;
            default:
                return html`${user} updated the task`;
        }
    }

    renderItem(item) {
        if (item.type === 'comment') {
            return this.renderComment(item);
        } else {
            return this.renderActivity(item);
        }
    }

    render() {
        if (this.isLoading) {
            return html`
                <div class="comments-container">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            `;
        }

        const items = this.getFilteredItems();
        const commentCount = this.comments.length;

        return html`
            <div class="comments-container">
                <div class="comments-header">
                    <div class="header-title">
                        <span>Comments & Activity</span>
                        ${commentCount > 0 ? html`<span class="comment-count">${commentCount}</span>` : ''}
                    </div>
                    <div class="filter-tabs">
                        <button 
                            class="filter-tab ${this.filterType === 'all' ? 'active' : ''}"
                            @click=${() => this.setFilterType('all')}
                        >
                            All
                        </button>
                        <button 
                            class="filter-tab ${this.filterType === 'comments' ? 'active' : ''}"
                            @click=${() => this.setFilterType('comments')}
                        >
                            Comments
                        </button>
                        <button 
                            class="filter-tab ${this.filterType === 'activity' ? 'active' : ''}"
                            @click=${() => this.setFilterType('activity')}
                        >
                            Activity
                        </button>
                    </div>
                </div>

                <div class="comments-list">
                    ${items.length === 0 ? html`
                        <div class="empty-state">
                            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <div class="empty-title">No ${this.filterType === 'all' ? 'activity' : this.filterType} yet</div>
                            <div class="empty-description">
                                ${this.filterType === 'comments' || this.filterType === 'all' 
                                    ? 'Be the first to comment on this task' 
                                    : 'Task activity will appear here'}
                            </div>
                        </div>
                    ` : items.map(item => this.renderItem(item))}
                </div>

                ${this.taskId ? html`
                    <div class="comment-input-container">
                        <mention-suggestion-dropdown
                            .suggestions=${this.mentionSuggestions}
                            .visible=${this.showMentions}
                            @mention-selected=${this.handleMentionSelected}
                        ></mention-suggestion-dropdown>
                        <div class="comment-input-wrapper">
                            <textarea 
                                class="comment-input"
                                placeholder="Add a comment... (use @ to mention team members)"
                                @keydown=${this.handleKeyDown}
                                @input=${this.handleCommentInput}
                            ></textarea>
                            <button 
                                class="comment-submit"
                                @click=${this.handleAddComment}
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('task-comments-module', TaskCommentsModule);