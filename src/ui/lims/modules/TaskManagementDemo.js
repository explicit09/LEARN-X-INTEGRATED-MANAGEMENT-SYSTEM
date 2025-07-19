/**
 * Task Management Demo Helper
 * Creates sample tasks to demonstrate drag-and-drop and other features
 */

export class TaskManagementDemo {
    static async createDemoTasks(limsApi) {
        const demoTasks = [
            // Todo Column
            {
                title: "Fix login timeout issue for Lincoln High School",
                description: "Users getting logged out after 5 minutes of inactivity",
                status: "todo",
                priority: "high",
                assignee_id: "john-dev",
                labels: "bug,platform,client",
                due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
            },
            {
                title: "Onboard Westfield Academy - 500 students",
                description: "Set up accounts and schedule admin training",
                status: "todo",
                priority: "high",
                assignee_id: "sarah-cs",
                labels: "client,onboarding,school"
            },
            {
                title: "Implement math equation renderer improvements",
                description: "Based on teacher feedback - LaTeX rendering issues",
                status: "todo",
                priority: "medium",
                assignee_id: "mike-dev",
                labels: "feature,ai,feedback"
            },
            
            // In Progress Column
            {
                title: "Optimize AI response time for essay feedback",
                description: "Current avg 8s, target <3s for better UX",
                status: "in_progress",
                priority: "urgent",
                assignee_id: "ai-team",
                labels: "performance,ai,optimization",
                completion_percentage: 60
            },
            {
                title: "Debug student progress tracking issue",
                description: "Progress not syncing properly for batch enrollments",
                status: "in_progress",
                priority: "high",
                assignee_id: "lisa-dev",
                labels: "bug,platform,sync"
            },
            
            // Review Column
            {
                title: "New feature: Parent dashboard access",
                description: "PR ready for review - parent portal implementation",
                status: "review",
                priority: "high",
                assignee_id: "senior-dev",
                labels: "feature,code-review"
            },
            {
                title: "AI prompt engineering for chemistry tutoring",
                description: "Enhanced prompts based on teacher feedback",
                status: "review",
                priority: "medium",
                assignee_id: "ai-team",
                labels: "ai,improvement,feedback"
            },
            
            // Done Column
            {
                title: "Fixed video playback issue on tablets",
                description: "Educational videos now work on all iPad models",
                status: "done",
                priority: "high",
                assignee_id: "frontend-team",
                labels: "bug,platform,completed",
                completion_percentage: 100
            },
            {
                title: "Onboarded Riverside Elementary - 200 students",
                description: "All accounts active, training completed",
                status: "done",
                priority: "medium",
                assignee_id: "cs-team",
                labels: "client,onboarding,completed"
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