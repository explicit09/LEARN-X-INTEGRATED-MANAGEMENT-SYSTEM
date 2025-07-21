/**
 * Modal Portal Utility for LitElement
 * Renders modals outside of Shadow DOM to avoid overflow and z-index issues
 */

export class ModalPortal {
    static portalRoot = null;
    static activeModals = new Map();

    /**
     * Initialize the portal root element
     */
    static init() {
        if (!this.portalRoot) {
            this.portalRoot = document.createElement('div');
            this.portalRoot.id = 'lims-modal-portal';
            this.portalRoot.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0;
                height: 0;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(this.portalRoot);
        }
    }

    /**
     * Create a modal in the portal
     * @param {string} id - Unique identifier for the modal
     * @param {string} content - HTML content for the modal
     * @param {Object} options - Modal options
     * @returns {HTMLElement} The modal element
     */
    static create(id, content, options = {}) {
        this.init();

        // Remove existing modal with same id
        if (this.activeModals.has(id)) {
            this.destroy(id);
        }

        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = `modal-${id}`;
        modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 10001;
            pointer-events: auto;
        `;

        // Set inner HTML
        modalContainer.innerHTML = content;

        // Add to portal and track
        this.portalRoot.appendChild(modalContainer);
        this.activeModals.set(id, modalContainer);

        // Enable pointer events on portal
        this.portalRoot.style.pointerEvents = 'auto';

        return modalContainer;
    }

    /**
     * Update modal content
     * @param {string} id - Modal identifier
     * @param {string} content - New HTML content
     */
    static update(id, content) {
        const modal = this.activeModals.get(id);
        if (modal) {
            modal.innerHTML = content;
        }
    }

    /**
     * Destroy a modal
     * @param {string} id - Modal identifier
     */
    static destroy(id) {
        const modal = this.activeModals.get(id);
        if (modal) {
            modal.remove();
            this.activeModals.delete(id);

            // Disable pointer events if no modals left
            if (this.activeModals.size === 0) {
                this.portalRoot.style.pointerEvents = 'none';
            }
        }
    }

    /**
     * Attach event listeners to modal elements
     * @param {string} id - Modal identifier
     * @param {Object} listeners - Event listeners map
     */
    static attachListeners(id, listeners) {
        const modal = this.activeModals.get(id);
        if (!modal) {
            console.log('[DEBUG] Modal not found for id:', id);
            return;
        }

        console.log('[DEBUG] Attaching listeners for modal:', id);
        Object.entries(listeners).forEach(([selector, events]) => {
            const elements = modal.querySelectorAll(selector);
            console.log(`[DEBUG] Found ${elements.length} elements for selector: ${selector}`);
            elements.forEach(element => {
                Object.entries(events).forEach(([eventName, handler]) => {
                    console.log(`[DEBUG] Adding ${eventName} listener to ${selector}`);
                    element.addEventListener(eventName, handler);
                });
            });
        });
    }

    /**
     * Get modal element by id
     * @param {string} id - Modal identifier
     * @returns {HTMLElement|null}
     */
    static getModal(id) {
        return this.activeModals.get(id) || null;
    }

    /**
     * Check if modal exists
     * @param {string} id - Modal identifier
     * @returns {boolean}
     */
    static exists(id) {
        return this.activeModals.has(id);
    }
}