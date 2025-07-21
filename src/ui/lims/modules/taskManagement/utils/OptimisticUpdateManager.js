/**
 * OptimisticUpdateManager - Manages optimistic UI updates with rollback capability
 * 
 * This class handles:
 * - Immediate UI updates before server confirmation
 * - Rollback on server errors
 * - Pending update tracking
 * - Success/failure callbacks
 */
export class OptimisticUpdateManager {
    constructor() {
        this.pendingUpdates = new Map(); // trackId -> { originalData, updateData, timestamp }
        this.updateCallbacks = new Map(); // trackId -> { onSuccess, onError }
    }

    /**
     * Generate a unique tracking ID for an update
     */
    generateTrackingId() {
        return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Track an optimistic update
     * @param {string} trackingId - Unique ID for this update
     * @param {object} originalData - Original data before update
     * @param {object} updateData - New data being applied
     * @param {object} callbacks - { onSuccess, onError } callbacks
     */
    trackUpdate(trackingId, originalData, updateData, callbacks = {}) {
        this.pendingUpdates.set(trackingId, {
            originalData,
            updateData,
            timestamp: Date.now()
        });

        if (callbacks.onSuccess || callbacks.onError) {
            this.updateCallbacks.set(trackingId, callbacks);
        }

        // Auto-cleanup after 30 seconds to prevent memory leaks
        setTimeout(() => {
            this.cleanup(trackingId);
        }, 30000);
    }

    /**
     * Mark an update as successful
     * @param {string} trackingId - The tracking ID of the update
     * @param {object} serverData - The actual data returned from server
     */
    confirmUpdate(trackingId, serverData) {
        const callbacks = this.updateCallbacks.get(trackingId);
        if (callbacks?.onSuccess) {
            callbacks.onSuccess(serverData);
        }
        this.cleanup(trackingId);
    }

    /**
     * Rollback a failed update
     * @param {string} trackingId - The tracking ID of the update
     * @param {Error} error - The error that occurred
     * @returns {object} The original data to restore
     */
    rollbackUpdate(trackingId, error) {
        const update = this.pendingUpdates.get(trackingId);
        if (!update) return null;

        const callbacks = this.updateCallbacks.get(trackingId);
        if (callbacks?.onError) {
            callbacks.onError(error, update.originalData);
        }

        this.cleanup(trackingId);
        return update.originalData;
    }

    /**
     * Get original data for a pending update
     * @param {string} trackingId - The tracking ID
     * @returns {object|null} The original data or null if not found
     */
    getOriginalData(trackingId) {
        const update = this.pendingUpdates.get(trackingId);
        return update?.originalData || null;
    }

    /**
     * Check if an update is still pending
     * @param {string} trackingId - The tracking ID
     * @returns {boolean} True if the update is pending
     */
    isPending(trackingId) {
        return this.pendingUpdates.has(trackingId);
    }

    /**
     * Clean up tracking data
     * @param {string} trackingId - The tracking ID to clean up
     */
    cleanup(trackingId) {
        this.pendingUpdates.delete(trackingId);
        this.updateCallbacks.delete(trackingId);
    }

    /**
     * Clear all pending updates (use with caution)
     */
    clearAll() {
        this.pendingUpdates.clear();
        this.updateCallbacks.clear();
    }

    /**
     * Get all pending updates (useful for debugging)
     * @returns {Array} Array of pending update info
     */
    getPendingUpdates() {
        return Array.from(this.pendingUpdates.entries()).map(([id, data]) => ({
            id,
            ...data,
            age: Date.now() - data.timestamp
        }));
    }
}

// Export singleton instance
export const optimisticUpdateManager = new OptimisticUpdateManager();