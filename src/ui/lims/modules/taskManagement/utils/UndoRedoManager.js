/**
 * UndoRedoManager - Manages undo/redo operations for task management
 * 
 * This class handles:
 * - Recording state changes
 * - Managing undo/redo stacks
 * - Applying state reversions
 * - Memory management with max stack size
 */
export class UndoRedoManager {
    constructor(options = {}) {
        this.maxStackSize = options.maxStackSize || 50;
        this.undoStack = [];
        this.redoStack = [];
        this.isApplyingChange = false; // Prevent recording while applying undo/redo
        this.changeCallbacks = new Map(); // Callbacks for specific change types
    }

    /**
     * Record a state change for undo/redo
     * @param {string} actionType - Type of action (create, update, delete, etc.)
     * @param {object} previousState - State before the change
     * @param {object} newState - State after the change
     * @param {object} metadata - Additional metadata about the change
     */
    recordChange(actionType, previousState, newState, metadata = {}) {
        if (this.isApplyingChange) return; // Don't record during undo/redo

        const change = {
            id: this.generateChangeId(),
            actionType,
            previousState: this.cloneState(previousState),
            newState: this.cloneState(newState),
            metadata: {
                ...metadata,
                timestamp: Date.now(),
                description: this.getActionDescription(actionType, metadata)
            }
        };

        // Add to undo stack
        this.undoStack.push(change);

        // Clear redo stack when new action is performed
        this.redoStack = [];

        // Enforce max stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift(); // Remove oldest
        }

        console.log(`[UndoRedoManager] Recorded ${actionType}`, change);
    }

    /**
     * Record a task creation
     */
    recordTaskCreation(task) {
        this.recordChange('create_task', null, task, {
            taskId: task.id,
            taskTitle: task.title
        });
    }

    /**
     * Record a task update
     */
    recordTaskUpdate(oldTask, newTask) {
        // Only record if there are actual changes
        if (JSON.stringify(oldTask) === JSON.stringify(newTask)) return;

        const changes = this.getChangedFields(oldTask, newTask);
        this.recordChange('update_task', oldTask, newTask, {
            taskId: oldTask.id,
            taskTitle: oldTask.title,
            changes
        });
    }

    /**
     * Record a task deletion
     */
    recordTaskDeletion(task) {
        this.recordChange('delete_task', task, null, {
            taskId: task.id,
            taskTitle: task.title
        });
    }

    /**
     * Record bulk operations
     */
    recordBulkOperation(actionType, tasks, changes) {
        this.recordChange(`bulk_${actionType}`, tasks, 
            tasks.map(task => ({ ...task, ...changes })), {
            taskCount: tasks.length,
            taskIds: tasks.map(t => t.id)
        });
    }

    /**
     * Perform undo operation
     * @returns {object|null} The change that was undone
     */
    undo() {
        if (!this.canUndo()) return null;

        const change = this.undoStack.pop();
        this.redoStack.push(change);

        console.log(`[UndoRedoManager] Undoing ${change.actionType}`);
        
        this.isApplyingChange = true;
        const result = this.applyChange(change, true);
        this.isApplyingChange = false;

        return result;
    }

    /**
     * Perform redo operation
     * @returns {object|null} The change that was redone
     */
    redo() {
        if (!this.canRedo()) return null;

        const change = this.redoStack.pop();
        this.undoStack.push(change);

        console.log(`[UndoRedoManager] Redoing ${change.actionType}`);
        
        this.isApplyingChange = true;
        const result = this.applyChange(change, false);
        this.isApplyingChange = false;

        return result;
    }

    /**
     * Apply a change (for undo or redo)
     * @param {object} change - The change to apply
     * @param {boolean} isUndo - Whether this is an undo (true) or redo (false)
     * @returns {object} Result of the operation
     */
    applyChange(change, isUndo) {
        const { actionType, previousState, newState } = change;
        const targetState = isUndo ? previousState : newState;
        const sourceState = isUndo ? newState : previousState;

        // Get callback for this action type
        const callback = this.changeCallbacks.get(actionType);
        if (!callback) {
            console.warn(`[UndoRedoManager] No callback registered for ${actionType}`);
            return null;
        }

        // Execute the callback
        return callback(targetState, sourceState, change.metadata, isUndo);
    }

    /**
     * Register a callback for handling specific change types
     * @param {string} actionType - The action type to handle
     * @param {function} callback - Function to execute the change
     */
    registerChangeHandler(actionType, callback) {
        this.changeCallbacks.set(actionType, callback);
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Get description of the next undo action
     */
    getUndoDescription() {
        if (!this.canUndo()) return null;
        const lastChange = this.undoStack[this.undoStack.length - 1];
        return lastChange.metadata.description;
    }

    /**
     * Get description of the next redo action
     */
    getRedoDescription() {
        if (!this.canRedo()) return null;
        const lastChange = this.redoStack[this.redoStack.length - 1];
        return lastChange.metadata.description;
    }

    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get undo/redo history for display
     */
    getHistory() {
        return {
            undoStack: this.undoStack.map(change => ({
                id: change.id,
                actionType: change.actionType,
                description: change.metadata.description,
                timestamp: change.metadata.timestamp
            })).reverse(), // Most recent first
            redoStack: this.redoStack.map(change => ({
                id: change.id,
                actionType: change.actionType,
                description: change.metadata.description,
                timestamp: change.metadata.timestamp
            })).reverse()
        };
    }

    // Helper methods
    generateChangeId() {
        return `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    cloneState(state) {
        if (!state) return null;
        return JSON.parse(JSON.stringify(state));
    }

    getChangedFields(oldObj, newObj) {
        const changes = [];
        const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
        
        for (const key of allKeys) {
            if (JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj?.[key])) {
                changes.push({
                    field: key,
                    oldValue: oldObj?.[key],
                    newValue: newObj?.[key]
                });
            }
        }
        
        return changes;
    }

    getActionDescription(actionType, metadata) {
        const descriptions = {
            'create_task': `Create task "${metadata.taskTitle}"`,
            'update_task': `Update task "${metadata.taskTitle}"`,
            'delete_task': `Delete task "${metadata.taskTitle}"`,
            'bulk_update': `Update ${metadata.taskCount} tasks`,
            'bulk_delete': `Delete ${metadata.taskCount} tasks`,
            'bulk_status': `Change status of ${metadata.taskCount} tasks`,
            'move_task': `Move task "${metadata.taskTitle}"`,
            'reorder_tasks': `Reorder tasks`
        };
        
        return descriptions[actionType] || actionType;
    }
}

// Export singleton instance
export const undoRedoManager = new UndoRedoManager();