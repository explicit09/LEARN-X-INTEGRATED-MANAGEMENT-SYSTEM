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
                orderBy: 'created_at.desc',
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
            const task = {
                ...taskData,
                status: taskData.status || 'todo',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
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
                updated_at: new Date().toISOString()
            };
            return await this.db.update('tasks', { id: taskId }, updatedTask);
        } catch (error) {
            console.error('[LimsService] Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            return await this.db.delete('tasks', { id: taskId });
        } catch (error) {
            console.error('[LimsService] Error deleting task:', error);
            throw error;
        }
    }

    async getProjects(filters = {}) {
        try {
            const projects = await this.db.findMany('projects', filters, {
                orderBy: 'created_at.desc'
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