import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';

/**
 * Simplified TaskReportingModule for testing
 */
export class TaskReportingModuleSimple extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            color: white;
        }

        .test-container {
            padding: 40px;
            text-align: center;
        }

        h1 {
            color: #007aff;
            font-size: 36px;
            margin-bottom: 20px;
        }

        p {
            font-size: 18px;
            color: #ccc;
        }

        .debug-info {
            margin-top: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            text-align: left;
            font-family: monospace;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        console.log('[TaskReportingSimple] Component connected!');
    }

    render() {
        console.log('[TaskReportingSimple] Rendering...');
        
        return html`
            <div class="test-container">
                <h1>🎉 REPORTING MODULE IS WORKING!</h1>
                <p>If you can see this message, the reporting module is successfully rendering.</p>
                
                <div class="debug-info">
                    <h3>Debug Information:</h3>
                    <p>Component: task-reporting-module-simple</p>
                    <p>Rendered at: ${new Date().toLocaleString()}</p>
                    <p>Shadow DOM: ${this.shadowRoot ? 'Yes' : 'No'}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('task-reporting-module-simple', TaskReportingModuleSimple);