/**
 * MarkdownRenderer - Utility for rendering markdown to HTML
 * Used for displaying formatted text in read-only contexts
 */
export class MarkdownRenderer {
    static render(text) {
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
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        // Lists
        html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
        
        // Wrap consecutive list items
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            const isNumbered = match.includes('<li>1.');
            const tag = isNumbered ? 'ol' : 'ul';
            return `<${tag}>${match}</${tag}>`;
        });
        
        // Blockquotes
        html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
        
        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Paragraphs
        html = html.split('\n\n').map(para => {
            if (!para.trim()) return '';
            if (para.startsWith('<')) return para;
            return `<p>${para}</p>`;
        }).join('\n');
        
        // Line breaks within paragraphs
        html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
        
        return html;
    }

    static renderInline(text) {
        if (!text) return '';
        
        // For inline rendering, we only want basic formatting, no block elements
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Strikethrough
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        return html;
    }

    static stripMarkdown(text) {
        if (!text) return '';
        
        // Remove all markdown formatting to get plain text
        return text
            // Headers
            .replace(/^#+ /gm, '')
            // Bold and italic
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            // Strikethrough
            .replace(/~~([^~]+)~~/g, '$1')
            // Code blocks
            .replace(/```[^`]*```/g, '')
            // Inline code
            .replace(/`([^`]+)`/g, '$1')
            // Links
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Lists
            .replace(/^[\*\-] /gm, '')
            .replace(/^\d+\. /gm, '')
            // Blockquotes
            .replace(/^> /gm, '')
            // Extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    static getPreview(text, maxLength = 150) {
        const stripped = this.stripMarkdown(text);
        if (stripped.length <= maxLength) return stripped;
        return stripped.substring(0, maxLength).trim() + '...';
    }
}

export const markdownRenderer = new MarkdownRenderer();