/**
 * Task Management Demo Helper
 * Creates sample tasks to demonstrate drag-and-drop and other features
 */

export class TaskManagementDemo {
    static async createDemoTasks(limsApi) {
        const demoTasks = [
            // Todo Column
            {
                title: "Review lab results for Patient #1234",
                description: "Check blood work and imaging results",
                status: "todo",
                priority: "high",
                assignee_id: "dr-smith",
                labels: "medical,urgent",
                due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
            },
            {
                title: "Update documentation for LIMS module",
                description: "Add API documentation and user guide",
                status: "todo",
                priority: "medium",
                assignee_id: "dev-team",
                labels: "documentation,development"
            },
            {
                title: "Schedule team meeting",
                description: "Discuss Q1 roadmap and priorities",
                status: "todo",
                priority: "low",
                assignee_id: "manager",
                labels: "planning,meeting"
            },
            
            // In Progress Column
            {
                title: "Implement drag-and-drop functionality",
                description: "Add professional kanban board features with @dnd-kit",
                status: "in_progress",
                priority: "urgent",
                assignee_id: "dev-team",
                labels: "feature,development",
                completion_percentage: 75
            },
            {
                title: "Analyze test results batch #456",
                description: "Process and validate results from morning run",
                status: "in_progress",
                priority: "high",
                assignee_id: "lab-tech",
                labels: "lab,analysis"
            },
            
            // Review Column
            {
                title: "Equipment calibration report",
                description: "Review calibration data for all lab equipment",
                status: "review",
                priority: "medium",
                assignee_id: "qa-team",
                labels: "quality,compliance"
            },
            {
                title: "New feature: Command palette",
                description: "Code review for Cmd+K universal actions",
                status: "review",
                priority: "high",
                assignee_id: "senior-dev",
                labels: "feature,code-review"
            },
            
            // Done Column
            {
                title: "Setup Supabase integration",
                description: "Database connection and schema migration completed",
                status: "done",
                priority: "high",
                assignee_id: "dev-team",
                labels: "infrastructure,completed",
                completion_percentage: 100
            },
            {
                title: "Train new lab technician",
                description: "Onboarding and LIMS training completed",
                status: "done",
                priority: "medium",
                assignee_id: "hr-team",
                labels: "training,completed"
            }
        ];

        console.log('[TaskManagementDemo] Creating demo tasks...');
        
        try {
            // Create tasks one by one to ensure proper IDs
            const createdTasks = [];
            for (const task of demoTasks) {
                const created = await limsApi.createTask(task);
                createdTasks.push(created);
                console.log(`[TaskManagementDemo] Created task: ${created.title}`);
            }
            
            console.log(`[TaskManagementDemo] Successfully created ${createdTasks.length} demo tasks`);
            return createdTasks;
        } catch (error) {
            console.error('[TaskManagementDemo] Error creating demo tasks:', error);
            throw error;
        }
    }

    static async clearAllTasks(limsApi) {
        try {
            const tasks = await limsApi.getTasks();
            console.log(`[TaskManagementDemo] Clearing ${tasks.length} tasks...`);
            
            for (const task of tasks) {
                await limsApi.deleteTask(task.id);
            }
            
            console.log('[TaskManagementDemo] All tasks cleared');
        } catch (error) {
            console.error('[TaskManagementDemo] Error clearing tasks:', error);
            throw error;
        }
    }

    static showFeatureGuide() {
        const features = [
            "🚀 DRAG & DROP: Drag tasks between columns to update their status",
            "⌨️ KEYBOARD SHORTCUTS:",
            "  • Cmd/Ctrl + K: Open command palette",
            "  • C: Create new task quickly",
            "  • E: Edit selected task",
            "  • D: Mark selected tasks as done",
            "  • X: Enter selection mode",
            "  • Shift + X: Select all tasks",
            "  • ?: Show all keyboard shortcuts",
            "🗣️ NATURAL LANGUAGE: Type 'Review lab results Friday' in the input field",
            "🎯 MULTI-SELECT: Hold Shift/Cmd/Ctrl while clicking to select multiple tasks",
            "♿ ACCESSIBILITY: Use Tab to navigate, Space to grab, Arrow keys to move tasks",
            "⚡ PERFORMANCE: Optimized for 1000+ tasks with virtual scrolling"
        ];

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TASK MANAGEMENT PRO - FEATURE GUIDE');
        console.log('='.repeat(60));
        features.forEach(feature => console.log(feature));
        console.log('='.repeat(60) + '\n');
    }
}