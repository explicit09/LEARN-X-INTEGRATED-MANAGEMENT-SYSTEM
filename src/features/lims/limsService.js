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
            return await this.db.findUnique('tasks', { id: taskId });
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
            const members = await this.db.query('team_members', {
                orderBy: { field: 'name', direction: 'asc' }
            });
            console.log(`[LimsService] Got ${members.length} team members`);
            return members;
        } catch (error) {
            console.error('[LimsService] Error getting team members:', error);
            return [];
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
}

const limsService = new LimsService();

module.exports = limsService;