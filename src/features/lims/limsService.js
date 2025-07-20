const internalBridge = require('../../bridge/internalBridge');
const supabaseDatabase = require('../common/services/supabaseDatabase');

class LimsService {
    constructor() {
        this.db = supabaseDatabase;
        console.log('[LimsService] Initialized');
    }

    async getTasks(filters = {}) {
        try {
            const tasks = await this.db.findMany('tasks', filters, {
                orderBy: 'created_at',
                ascending: false,
                limit: 100
            });
            return tasks;
        } catch (error) {
            console.error('[LimsService] Error getting tasks:', error);
            return [];
        }
    }

    async getTask(taskId) {
        try {
            const tasks = await this.db.findMany('tasks', { id: taskId });
            return tasks && tasks.length > 0 ? tasks[0] : null;
        } catch (error) {
            console.error('[LimsService] Error getting task:', error);
            return null;
        }
    }

    async createTask(taskData) {
        try {
            
            // Clean the task data before creating
            const cleanedData = { ...taskData };
            
            // Fix UUID fields that might be objects or invalid values
            const uuidFields = ['assignee_id', 'project_id', 'epic_id', 'sprint_id'];
            uuidFields.forEach(field => {
                if (cleanedData[field] && typeof cleanedData[field] === 'object') {
                    // If it's an object, try to extract the id property
                    cleanedData[field] = cleanedData[field].id || null;
                }
                // Handle empty strings or 'current-user'
                if (cleanedData[field] === '' || cleanedData[field] === 'current-user') {
                    cleanedData[field] = null;
                }
            });
            
            // Only include fields that exist in the database
            const task = {
                title: cleanedData.title,
                description: cleanedData.description || null,
                status: cleanedData.status || 'todo',
                priority: cleanedData.priority || 'medium',
                due_date: cleanedData.due_date || null,
                assignee_id: cleanedData.assignee_id || null,
                project_id: cleanedData.project_id, // Required field
                epic_id: cleanedData.epic_id || null,
                sprint_id: cleanedData.sprint_id || null,
                story_points: cleanedData.story_points || null,
                time_estimate: cleanedData.time_estimate || null,
                time_spent: cleanedData.time_spent || 0,
                position: cleanedData.position || null,
                // Convert labels from string to array if needed
                labels: typeof cleanedData.labels === 'string' 
                    ? cleanedData.labels.split(',').map(l => l.trim()).filter(l => l)
                    : cleanedData.labels || [],
                completion_percentage: cleanedData.completion_percentage || 0,
                ai_insights: cleanedData.ai_insights || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Ensure project_id is provided (it's required)
            if (!task.project_id) {
                throw new Error('project_id is required to create a task');
            }
            
            console.log('[LimsService] Creating task with cleaned data:', {
                ...task,
                description: task.description ? '...' : undefined // Don't log full description
            });
            
            return await this.db.create('tasks', task);
        } catch (error) {
            console.error('[LimsService] Error creating task:', error);
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            const updatedTask = {
                ...updates,
                // Convert labels from string to array if needed
                labels: updates.labels !== undefined
                    ? (typeof updates.labels === 'string' 
                        ? updates.labels.split(',').map(l => l.trim()).filter(l => l)
                        : updates.labels || [])
                    : undefined,
                updated_at: new Date().toISOString()
            };
            
            // Fix UUID fields that might be objects
            const uuidFields = ['assignee_id', 'project_id', 'epic_id', 'sprint_id'];
            uuidFields.forEach(field => {
                if (updatedTask[field] && typeof updatedTask[field] === 'object') {
                    // If it's an object, try to extract the id property
                    updatedTask[field] = updatedTask[field].id || null;
                }
                // Also handle empty strings or 'current-user'
                if (updatedTask[field] === '' || updatedTask[field] === 'current-user') {
                    updatedTask[field] = null;
                }
            });
            
            // Remove undefined values
            Object.keys(updatedTask).forEach(key => 
                updatedTask[key] === undefined && delete updatedTask[key]
            );
            
            console.log('[LimsService] Updating task with data:', {
                taskId,
                ...updatedTask,
                description: updatedTask.description ? '...' : undefined
            });
            
            return await this.db.update('tasks', taskId, updatedTask);
        } catch (error) {
            console.error('[LimsService] Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            return await this.db.delete('tasks', taskId);
        } catch (error) {
            console.error('[LimsService] Error deleting task:', error);
            throw error;
        }
    }

    async getProjects(filters = {}) {
        try {
            const projects = await this.db.findMany('projects', filters, {
                orderBy: 'created_at',
                ascending: false
            });
            return projects;
        } catch (error) {
            console.error('[LimsService] Error getting projects:', error);
            return [];
        }
    }

    async getActiveProjectsCount() {
        try {
            const projects = await this.db.findMany('projects', { status: 'active' });
            return projects.length;
        } catch (error) {
            console.error('[LimsService] Error counting active projects:', error);
            return 0;
        }
    }

    async getTeamMembersCount() {
        try {
            const teamMembers = await this.db.findMany('team_members', {});
            return teamMembers.length;
        } catch (error) {
            console.error('[LimsService] Error counting team members:', error);
            return 0;
        }
    }

    closeDashboard() {
        internalBridge.emit('window:requestVisibility', { name: 'lims-dashboard', visible: false });
    }

    // Sprint management
    async getSprints(projectId) {
        try {
            const sprints = await this.db.findMany('sprints', { project_id: projectId }, {
                orderBy: 'start_date.desc'
            });
            return sprints;
        } catch (error) {
            console.error('[LimsService] Error getting sprints:', error);
            return [];
        }
    }

    async createSprint(sprintData) {
        try {
            const sprint = {
                ...sprintData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return await this.db.create('sprints', sprint);
        } catch (error) {
            console.error('[LimsService] Error creating sprint:', error);
            throw error;
        }
    }

    // Analytics
    async getTaskMetrics(period = '7d') {
        try {
            // TODO: Implement actual metrics calculation
            const tasks = await this.getTasks();
            const now = new Date();
            const periodMs = this.parsePeriod(period);
            const startDate = new Date(now.getTime() - periodMs);

            const tasksInPeriod = tasks.filter(task => {
                const taskDate = new Date(task.created_at);
                return taskDate >= startDate;
            });

            return {
                total: tasksInPeriod.length,
                completed: tasksInPeriod.filter(t => t.status === 'done').length,
                inProgress: tasksInPeriod.filter(t => t.status === 'in_progress').length,
                pending: tasksInPeriod.filter(t => t.status === 'todo').length
            };
        } catch (error) {
            console.error('[LimsService] Error getting task metrics:', error);
            return { total: 0, completed: 0, inProgress: 0, pending: 0 };
        }
    }

    parsePeriod(period) {
        const units = {
            'd': 24 * 60 * 60 * 1000,
            'w': 7 * 24 * 60 * 60 * 1000,
            'm': 30 * 24 * 60 * 60 * 1000
        };
        const match = period.match(/^(\d+)([dwm])$/);
        if (match) {
            const [, num, unit] = match;
            return parseInt(num) * units[unit];
        }
        return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    }

    // Team Members
    async getTeamMembers() {
        try {
            console.log('[LimsService] Getting team members');
            const members = await this.db.findMany('team_members', {}, {
                orderBy: 'name',
                ascending: true
            });
            console.log(`[LimsService] Got ${members.length} team members`);
            return members;
        } catch (error) {
            console.error('[LimsService] Error getting team members:', error);
            return [];
        }
    }

    // Comments Management
    async getTaskComments(taskId) {
        try {
            console.log('[LimsService] Getting comments for task:', taskId);
            const comments = await this.db.findMany('task_comments', { task_id: taskId }, {
                orderBy: 'created_at',
                ascending: false
            });
            console.log(`[LimsService] Got ${comments.length} comments`);
            
            // Transform comments to match UI expectations
            return comments.map(comment => ({
                ...comment,
                content: comment.comment, // Map 'comment' field to 'content'
                author_name: 'tmbuwa09@gmail.com', // Default author name
                author_id: comment.user_id
            }));
        } catch (error) {
            console.error('[LimsService] Error getting task comments:', error);
            return [];
        }
    }

    async addTaskComment(taskId, commentData) {
        try {
            console.log('[LimsService] Adding comment to task:', taskId);
            
            // Generate a proper UUID for default_user or use the actual user_id
            let userId = commentData.author_id;
            if (!userId || userId === 'default_user') {
                // Use tmbuwa09@gmail.com's UUID as the default user
                userId = '67b18306-260d-4a8e-a249-90d26158999e';
            }
            
            const comment = {
                task_id: taskId,
                user_id: userId,
                comment: commentData.content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const created = await this.db.create('task_comments', comment);
            
            // Return with author info for UI
            return {
                ...created,
                author_name: commentData.author_name || 'Unknown User',
                content: created.comment // Map 'comment' field to 'content' for UI consistency
            };
        } catch (error) {
            console.error('[LimsService] Error adding task comment:', error);
            throw error;
        }
    }

    async updateTaskComment(commentId, updates) {
        try {
            console.log('[LimsService] Updating comment:', commentId);
            const updatedComment = {
                comment: updates.content,
                updated_at: new Date().toISOString()
            };
            return await this.db.update('task_comments', commentId, updatedComment);
        } catch (error) {
            console.error('[LimsService] Error updating comment:', error);
            throw error;
        }
    }

    async deleteTaskComment(commentId) {
        try {
            console.log('[LimsService] Deleting comment:', commentId);
            return await this.db.delete('task_comments', commentId);
        } catch (error) {
            console.error('[LimsService] Error deleting comment:', error);
            throw error;
        }
    }

    // Activity History Management
    async getTaskActivities(taskId) {
        try {
            console.log('[LimsService] Getting activities for task:', taskId);
            const activities = await this.db.findMany('task_activities', { task_id: taskId }, {
                orderBy: 'created_at',
                ascending: false
            });
            console.log(`[LimsService] Got ${activities.length} activities`);
            return activities;
        } catch (error) {
            console.error('[LimsService] Error getting task activities:', error);
            return [];
        }
    }

    async addTaskActivity(taskId, activityData) {
        try {
            console.log('[LimsService] Adding activity to task:', taskId);
            
            // Generate a proper UUID for default_user or use the actual user_id
            let userId = activityData.user_id;
            if (!userId || userId === 'default_user') {
                // Use tmbuwa09@gmail.com's UUID as the default user
                userId = '67b18306-260d-4a8e-a249-90d26158999e';
            }
            
            const activity = {
                task_id: taskId,
                user_id: userId,
                user_name: activityData.user_name || 'System',
                action: activityData.action,
                from_value: activityData.from_value || null,
                to_value: activityData.to_value || null,
                metadata: activityData.metadata || null,
                created_at: new Date().toISOString()
            };
            
            const created = await this.db.create('task_activities', activity);
            
            // Return with timestamp field for UI consistency
            return {
                ...created,
                timestamp: created.created_at
            };
        } catch (error) {
            console.error('[LimsService] Error adding task activity:', error);
            // Don't throw error for activity logging - it shouldn't break the main operation
            return null;
        }
    }

    // Enhanced updateTask to log activities
    async updateTask(taskId, updates) {
        try {
            // Get current task state for comparison
            const currentTask = await this.getTask(taskId);
            
            const updatedTask = {
                ...updates,
                // Convert labels from string to array if needed
                labels: updates.labels !== undefined
                    ? (typeof updates.labels === 'string' 
                        ? updates.labels.split(',').map(l => l.trim()).filter(l => l)
                        : updates.labels || [])
                    : undefined,
                updated_at: new Date().toISOString()
            };
            
            // Fix UUID fields that might be objects
            const uuidFields = ['assignee_id', 'project_id', 'epic_id', 'sprint_id'];
            uuidFields.forEach(field => {
                if (updatedTask[field] && typeof updatedTask[field] === 'object') {
                    // If it's an object, try to extract the id property
                    updatedTask[field] = updatedTask[field].id || null;
                }
                // Also handle empty strings or 'current-user'
                if (updatedTask[field] === '' || updatedTask[field] === 'current-user') {
                    updatedTask[field] = null;
                }
            });
            
            // Remove undefined values
            Object.keys(updatedTask).forEach(key => 
                updatedTask[key] === undefined && delete updatedTask[key]
            );
            
            console.log('[LimsService] Updating task with data:', {
                taskId,
                ...updatedTask,
                description: updatedTask.description ? '...' : undefined
            });
            
            const result = await this.db.update('tasks', taskId, updatedTask);
            
            // Log activities for significant changes
            if (currentTask) {
                // Status change
                if (updates.status && updates.status !== currentTask.status) {
                    await this.addTaskActivity(taskId, {
                        action: 'status_changed',
                        from_value: currentTask.status,
                        to_value: updates.status,
                        user_name: updates.user_name || 'User'
                    });
                }
                
                // Priority change
                if (updates.priority && updates.priority !== currentTask.priority) {
                    await this.addTaskActivity(taskId, {
                        action: 'priority_changed',
                        from_value: currentTask.priority,
                        to_value: updates.priority,
                        user_name: updates.user_name || 'User'
                    });
                }
                
                // Assignee change
                if (updates.assignee_id !== undefined && updates.assignee_id !== currentTask.assignee_id) {
                    await this.addTaskActivity(taskId, {
                        action: 'assigned',
                        from_value: currentTask.assignee_id,
                        to_value: updates.assignee_id,
                        user_name: updates.user_name || 'User'
                    });
                }
                
                // Due date change
                if (updates.due_date !== undefined && updates.due_date !== currentTask.due_date) {
                    await this.addTaskActivity(taskId, {
                        action: 'due_date_changed',
                        from_value: currentTask.due_date,
                        to_value: updates.due_date,
                        user_name: updates.user_name || 'User'
                    });
                }
            }
            
            return result;
        } catch (error) {
            console.error('[LimsService] Error updating task:', error);
            throw error;
        }
    }

    // Enhanced createTask to log activity
    async createTask(taskData) {
        try {
            
            // Clean the task data before creating
            const cleanedData = { ...taskData };
            
            // Fix UUID fields that might be objects or invalid values
            const uuidFields = ['assignee_id', 'project_id', 'epic_id', 'sprint_id'];
            uuidFields.forEach(field => {
                if (cleanedData[field] && typeof cleanedData[field] === 'object') {
                    // If it's an object, try to extract the id property
                    cleanedData[field] = cleanedData[field].id || null;
                }
                // Handle empty strings or 'current-user'
                if (cleanedData[field] === '' || cleanedData[field] === 'current-user') {
                    cleanedData[field] = null;
                }
            });
            
            // Only include fields that exist in the database
            const task = {
                title: cleanedData.title,
                description: cleanedData.description || null,
                status: cleanedData.status || 'todo',
                priority: cleanedData.priority || 'medium',
                due_date: cleanedData.due_date || null,
                assignee_id: cleanedData.assignee_id || null,
                project_id: cleanedData.project_id, // Required field
                epic_id: cleanedData.epic_id || null,
                sprint_id: cleanedData.sprint_id || null,
                story_points: cleanedData.story_points || null,
                time_estimate: cleanedData.time_estimate || null,
                time_spent: cleanedData.time_spent || 0,
                position: cleanedData.position || null,
                // Convert labels from string to array if needed
                labels: typeof cleanedData.labels === 'string' 
                    ? cleanedData.labels.split(',').map(l => l.trim()).filter(l => l)
                    : cleanedData.labels || [],
                completion_percentage: cleanedData.completion_percentage || 0,
                ai_insights: cleanedData.ai_insights || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Ensure project_id is provided (it's required)
            if (!task.project_id) {
                throw new Error('project_id is required to create a task');
            }
            
            console.log('[LimsService] Creating task with cleaned data:', {
                ...task,
                description: task.description ? '...' : undefined // Don't log full description
            });
            
            const created = await this.db.create('tasks', task);
            
            // Log creation activity
            await this.addTaskActivity(created.id, {
                action: 'created',
                user_name: taskData.user_name || 'User'
            });
            
            return created;
        } catch (error) {
            console.error('[LimsService] Error creating task:', error);
            throw error;
        }
    }

    // Subscribe to real-time updates
    subscribeToTasks(callback) {
        return this.db.subscribe('tasks', {}, (payload) => {
            console.log('[LimsService] Task update:', payload);
            callback(payload);
        });
    }

    subscribeToProjects(callback) {
        return this.db.subscribe('projects', {}, (payload) => {
            console.log('[LimsService] Project update:', payload);
            callback(payload);
        });
    }

    subscribeToTaskComments(taskId, callback) {
        return this.db.subscribe('task_comments', { task_id: taskId }, (payload) => {
            console.log('[LimsService] Comment update:', payload);
            callback(payload);
        });
    }
}

const limsService = new LimsService();

module.exports = limsService;