import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * RichTextEditor - A markdown-based rich text editor
 * Supports basic formatting with live preview
 */
export class RichTextEditor extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .editor-container {
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: 8px;
            overflow: hidden;
            background: var(--background-secondary, rgba(0, 0, 0, 0.2));
        }

        .editor-toolbar {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            background: var(--background-tertiary, rgba(0, 0, 0, 0.3));
            flex-wrap: wrap;
        }

        .toolbar-group {
            display: flex;
            gap: 2px;
            padding: 0 4px;
            border-right: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .toolbar-group:last-child {
            border-right: none;
        }

        .toolbar-button {
            background: transparent;
            border: none;
            color: var(--text-color, #e5e5e7);
            padding: 6px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            position: relative;
        }

        .toolbar-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .toolbar-button.active {
            background: var(--accent-background, rgba(0, 122, 255, 0.2));
            color: var(--accent-color, #007aff);
        }

        .toolbar-button svg {
            width: 16px;
            height: 16px;
        }

        .toolbar-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 4px;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-size: 11px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .toolbar-button:hover .toolbar-tooltip {
            opacity: 1;
        }

        .editor-content {
            display: flex;
            min-height: 120px;
        }

        .editor-input,
        .editor-preview {
            flex: 1;
            padding: 12px;
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-color, #e5e5e7);
        }

        .editor-input {
            background: transparent;
            border: none;
            outline: none;
            resize: vertical;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            min-height: inherit;
        }

        .editor-input::placeholder {
            color: var(--text-muted, rgba(255, 255, 255, 0.5));
        }

        .editor-preview {
            border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            background: var(--background-primary, rgba(0, 0, 0, 0.1));
            overflow-y: auto;
        }

        /* Markdown styles for preview */
        .editor-preview h1,
        .editor-preview h2,
        .editor-preview h3 {
            margin: 0 0 12px 0;
            font-weight: 600;
        }

        .editor-preview h1 { font-size: 24px; }
        .editor-preview h2 { font-size: 20px; }
        .editor-preview h3 { font-size: 16px; }

        .editor-preview p {
            margin: 0 0 12px 0;
        }

        .editor-preview strong {
            font-weight: 600;
            color: var(--text-emphasis, #ffffff);
        }

        .editor-preview em {
            font-style: italic;
        }

        .editor-preview del {
            text-decoration: line-through;
            opacity: 0.7;
        }

        .editor-preview code {
            background: var(--code-background, rgba(255, 255, 255, 0.1));
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 13px;
        }

        .editor-preview pre {
            background: var(--code-background, rgba(255, 255, 255, 0.1));
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 0 0 12px 0;
        }

        .editor-preview pre code {
            background: transparent;
            padding: 0;
        }

        .editor-preview ul,
        .editor-preview ol {
            margin: 0 0 12px 0;
            padding-left: 24px;
        }

        .editor-preview li {
            margin: 0 0 4px 0;
        }

        .editor-preview a {
            color: var(--accent-color, #007aff);
            text-decoration: none;
        }

        .editor-preview a:hover {
            text-decoration: underline;
        }

        .editor-preview blockquote {
            margin: 0 0 12px 0;
            padding-left: 16px;
            border-left: 3px solid var(--accent-color, #007aff);
            opacity: 0.8;
        }

        .editor-preview hr {
            margin: 16px 0;
            border: none;
            border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        /* Mode toggle */
        .mode-toggle {
            margin-left: auto;
            display: flex;
            gap: 4px;
            padding: 2px;
            background: var(--background-primary, rgba(0, 0, 0, 0.3));
            border-radius: 6px;
        }

        .mode-button {
            background: transparent;
            border: none;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }

        .mode-button.active {
            background: var(--accent-background, rgba(0, 122, 255, 0.2));
            color: var(--accent-color, #007aff);
        }

        :host([mode="edit"]) .editor-preview {
            display: none;
        }

        :host([mode="preview"]) .editor-input {
            display: none;
        }

        :host([mode="preview"]) .editor-preview {
            border-left: none;
        }
    `;

    static properties = {
        value: { type: String },
        placeholder: { type: String },
        mode: { type: String, reflect: true }, // 'split', 'edit', 'preview'
        showToolbar: { type: Boolean, attribute: 'show-toolbar' }
    };

    constructor() {
        super();
        this.value = '';
        this.placeholder = 'Write your text here... (Markdown supported)';
        this.mode = 'split';
        this.showToolbar = true;
    }

    insertFormatting(before, after = '') {
        const textarea = this.shadowRoot.querySelector('.editor-input');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = this.value.substring(start, end);
        
        const newText = 
            this.value.substring(0, start) + 
            before + selectedText + after +
            this.value.substring(end);
        
        this.value = newText;
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        
        // Set cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }

    handleBold() {
        this.insertFormatting('**', '**');
    }

    handleItalic() {
        this.insertFormatting('*', '*');
    }

    handleStrikethrough() {
        this.insertFormatting('~~', '~~');
    }

    handleCode() {
        this.insertFormatting('`', '`');
    }

    handleLink() {
        const url = prompt('Enter URL:');
        if (url) {
            this.insertFormatting('[', `](${url})`);
        }
    }

    handleBulletList() {
        this.insertFormatting('\n- ', '');
    }

    handleNumberedList() {
        this.insertFormatting('\n1. ', '');
    }

    handleQuote() {
        this.insertFormatting('\n> ', '');
    }

    handleCodeBlock() {
        this.insertFormatting('\n```\n', '\n```\n');
    }

    handleInput(e) {
        this.value = e.target.value;
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }

    parseMarkdown(text) {
        if (!text) return '';
        
        // Escape HTML
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Headers
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Strikethrough
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists
        html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
        
        // Wrap consecutive list items
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            return '<ul>' + match + '</ul>';
        });
        
        // Blockquotes
        html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
        
        // Paragraphs
        html = html.split('\n\n').map(para => {
            if (!para.trim()) return '';
            if (para.startsWith('<')) return para;
            return `<p>${para}</p>`;
        }).join('\n');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    render() {
        return html`
            <div class="editor-container">
                ${this.showToolbar ? html`
                    <div class="editor-toolbar">
                        <div class="toolbar-group">
                            <button class="toolbar-button" @click=${this.handleBold}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                                </svg>
                                <span class="toolbar-tooltip">Bold (Cmd+B)</span>
                            </button>
                            <button class="toolbar-button" @click=${this.handleItalic}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="19" y1="4" x2="10" y2="4"/>
                                    <line x1="14" y1="20" x2="5" y2="20"/>
                                    <line x1="15" y1="4" x2="9" y2="20"/>
                                </svg>
                                <span class="toolbar-tooltip">Italic (Cmd+I)</span>
                            </button>
                            <button class="toolbar-button" @click=${this.handleStrikethrough}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="4" y1="12" x2="20" y2="12"/>
                                    <path d="M7 7h10v5M7 17h10v-5"/>
                                </svg>
                                <span class="toolbar-tooltip">Strikethrough</span>
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <button class="toolbar-button" @click=${this.handleCode}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="16 18 22 12 16 6"/>
                                    <polyline points="8 6 2 12 8 18"/>
                                </svg>
                                <span class="toolbar-tooltip">Inline Code</span>
                            </button>
                            <button class="toolbar-button" @click=${this.handleCodeBlock}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <path d="M8 12h.01M12 12h.01M16 12h.01"/>
                                </svg>
                                <span class="toolbar-tooltip">Code Block</span>
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <button class="toolbar-button" @click=${this.handleBulletList}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                                <span class="toolbar-tooltip">Bullet List</span>
                            </button>
                            <button class="toolbar-button" @click=${this.handleNumberedList}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="10" y1="6" x2="21" y2="6"/>
                                    <line x1="10" y1="12" x2="21" y2="12"/>
                                    <line x1="10" y1="18" x2="21" y2="18"/>
                                    <path d="M4 6h1v4M4 10h2M3 18h2M5 18h1v-4"/>
                                </svg>
                                <span class="toolbar-tooltip">Numbered List</span>
                            </button>
                        </div>
                        
                        <div class="toolbar-group">
                            <button class="toolbar-button" @click=${this.handleLink}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                                <span class="toolbar-tooltip">Insert Link</span>
                            </button>
                            <button class="toolbar-button" @click=${this.handleQuote}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                                </svg>
                                <span class="toolbar-tooltip">Quote</span>
                            </button>
                        </div>
                        
                        <div class="mode-toggle">
                            <button 
                                class="mode-button ${this.mode === 'edit' ? 'active' : ''}"
                                @click=${() => this.mode = 'edit'}>
                                Edit
                            </button>
                            <button 
                                class="mode-button ${this.mode === 'split' ? 'active' : ''}"
                                @click=${() => this.mode = 'split'}>
                                Split
                            </button>
                            <button 
                                class="mode-button ${this.mode === 'preview' ? 'active' : ''}"
                                @click=${() => this.mode = 'preview'}>
                                Preview
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="editor-content">
                    <textarea
                        class="editor-input"
                        .value=${this.value}
                        placeholder=${this.placeholder}
                        @input=${this.handleInput}
                    ></textarea>
                    <div class="editor-preview">
                        ${this.parseMarkdown(this.value) ? 
                            html`<div .innerHTML=${this.parseMarkdown(this.value)}></div>` : 
                            html`<div style="opacity: 0.5">Preview will appear here...</div>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('rich-text-editor', RichTextEditor);