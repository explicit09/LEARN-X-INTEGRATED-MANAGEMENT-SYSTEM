import { html, css, LitElement } from '../../../../assets/lit-core-2.7.4.min.js';
import { taskEventBus, TASK_EVENTS } from '../utils/TaskEventBus.js';

// Chart.js will be loaded dynamically to avoid import issues
let Chart = null;

/**
 * TaskReportingModule - Advanced reporting and analytics for task management
 * Provides insights into task completion, time tracking, sprint performance, and productivity
 */
export class TaskReportingModule extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            overflow-y: auto;
        }

        .reporting-container {
            padding: 16px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            background: var(--background-primary, transparent);
        }

        .report-header {
            display: none; /* Hide the redundant header since we have toolbar */
        }

        .report-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary, #e5e5e7);
        }

        .report-controls {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            padding: 16px;
            background: var(--background-secondary, rgba(0, 0, 0, 0.4));
            border-radius: var(--border-radius, 7px);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            margin-bottom: 16px;
            justify-content: space-between;
        }

        .date-range-selector {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .date-input {
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-primary, #e5e5e7);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
        }

        .filter-button {
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-primary, #e5e5e7);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }

        .filter-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .filter-button.active {
            background: var(--accent-background, rgba(0, 122, 255, 0.2));
            border-color: var(--accent-color, #007aff);
            color: var(--accent-color, #007aff);
        }

        .export-button {
            background: var(--success-background, rgba(52, 199, 89, 0.2));
            border: 1px solid var(--success-color, #34c759);
            color: var(--success-color, #34c759);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .export-button:hover {
            background: var(--success-color, #34c759);
            color: white;
        }

        /* Report Sections */
        .report-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .report-card {
            background: var(--background-secondary, rgba(0, 0, 0, 0.4));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: var(--border-radius, 7px);
            padding: 20px;
            backdrop-filter: blur(10px);
        }

        .report-card.full-width {
            grid-column: 1 / -1;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary, #e5e5e7);
        }

        .card-subtitle {
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            margin-top: 4px;
        }

        /* Statistics */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }

        .stat-item {
            text-align: center;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 600;
            color: var(--text-primary, #e5e5e7);
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 14px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .stat-change {
            font-size: 12px;
            margin-top: 4px;
        }

        .stat-change.positive {
            color: var(--success-color, #34c759);
        }

        .stat-change.negative {
            color: var(--error-color, #ff3b30);
        }

        /* Charts */
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 16px;
        }

        .chart-container.small {
            height: 200px;
        }

        /* Tables */
        .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }

        .report-table th,
        .report-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .report-table th {
            font-weight: 600;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            font-size: 12px;
            text-transform: uppercase;
        }

        .report-table td {
            color: var(--text-primary, #e5e5e7);
            font-size: 14px;
        }

        .report-table tr:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.05));
        }

        /* Progress bars */
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--background-tertiary, rgba(0, 0, 0, 0.4));
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--accent-color, #007aff);
            transition: width 0.3s ease;
        }

        /* Loading state */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        /* Empty state */
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        /* Tabs - matching task management style */
        .report-tabs {
            display: flex;
            gap: 2px;
            margin-bottom: 20px;
            padding: 16px;
            background: var(--background-secondary, rgba(0, 0, 0, 0.4));
            border-radius: var(--border-radius, 7px);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .tab-button {
            background: transparent;
            border: none;
            color: var(--text-color, #e5e5e7);
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
            border-radius: 4px;
            opacity: 0.7;
        }

        .tab-button:hover {
            opacity: 1;
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .tab-button.active {
            opacity: 1;
            background: var(--accent-background, rgba(0, 122, 255, 0.2));
            color: var(--accent-color, #007aff);
        }

        /* Filters panel */
        .filters-panel {
            background: var(--background-tertiary, rgba(0, 0, 0, 0.2));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            display: none;
        }

        .filters-panel.show {
            display: block;
        }

        .filter-row {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        .filter-group {
            flex: 1;
            min-width: 200px;
        }

        .filter-label {
            font-size: 12px;
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            margin-bottom: 4px;
        }

        .filter-select {
            width: 100%;
            background: var(--background-secondary, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            color: var(--text-primary, #e5e5e7);
            padding: 8px;
            border-radius: 6px;
            font-size: 14px;
        }

        /* Label and status badges */
        .label-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            background: var(--accent-background, rgba(0, 122, 255, 0.2));
            color: var(--accent-color, #007aff);
            border: 1px solid var(--accent-color, #007aff);
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-badge.active {
            background: var(--success-background, rgba(52, 199, 89, 0.2));
            color: var(--success-color, #34c759);
            border: 1px solid var(--success-color, #34c759);
        }
        
        .status-badge.planned {
            background: var(--warning-background, rgba(255, 159, 10, 0.2));
            color: var(--warning-color, #ff9f0a);
            border: 1px solid var(--warning-color, #ff9f0a);
        }
        
        .status-badge.completed {
            background: var(--muted-background, rgba(255, 255, 255, 0.1));
            color: var(--text-muted, rgba(255, 255, 255, 0.6));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }
        
        .insights {
            color: var(--text-primary, #e5e5e7);
            font-size: 14px;
            line-height: 1.8;
        }
        
        .insights p {
            margin: 8px 0;
        }
        
        .insights strong {
            color: var(--accent-color, #007aff);
            font-weight: 600;
        }
    `;

    static properties = {
        dateRange: { type: Object },
        selectedTab: { type: String },
        showFilters: { type: Boolean },
        filters: { type: Object },
        loading: { type: Boolean },
        reportData: { type: Object }
    };

    constructor() {
        super();
        this.dateRange = this.getDefaultDateRange();
        this.selectedTab = 'overview';
        this.showFilters = false;
        this.filters = {
            project: 'all',
            user: 'all',
            label: 'all',
            priority: 'all'
        };
        this.loading = true;
        this.reportData = {};
        this.charts = {};
    }

    async connectedCallback() {
        super.connectedCallback();
        console.log('[TaskReporting] Component connected');
        
        // Try to load Chart.js dynamically
        if (!Chart) {
            try {
                console.log('[TaskReporting] Loading Chart.js...');
                // Try different import methods for better Electron compatibility
                if (window.Chart) {
                    // If Chart.js is loaded globally
                    Chart = window.Chart;
                    console.log('[TaskReporting] Chart.js found in window object');
                } else {
                    // Try dynamic import
                    const chartModule = await import('chart.js/auto');
                    Chart = chartModule.Chart || chartModule.default || chartModule;
                    console.log('[TaskReporting] Chart.js loaded via dynamic import');
                }
            } catch (error) {
                console.error('[TaskReporting] Failed to load Chart.js:', error);
                // Try requiring Chart.js as a fallback (for Electron)
                try {
                    if (window.require) {
                        Chart = window.require('chart.js/auto');
                        console.log('[TaskReporting] Chart.js loaded via require');
                    }
                } catch (requireError) {
                    console.error('[TaskReporting] Also failed to require Chart.js:', requireError);
                    // Continue without charts - the module can still show data tables
                }
            }
        }
        
        this.loadReportData();
        
        // Listen for task updates
        taskEventBus.on(TASK_EVENTS.TASK_CREATED, () => this.loadReportData());
        taskEventBus.on(TASK_EVENTS.TASK_UPDATED, () => this.loadReportData());
        taskEventBus.on(TASK_EVENTS.TASK_DELETED, () => this.loadReportData());
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Destroy charts
        Object.values(this.charts).forEach(chart => chart.destroy());
    }

    getDefaultDateRange() {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }

    async loadReportData() {
        console.log('[TaskReporting] Loading report data...');
        this.loading = true;
        
        try {
            // Fetch all necessary data
            const [tasks, timeEntries, sprints, users] = await Promise.all([
                this.fetchTasks(),
                this.fetchTimeEntries(),
                this.fetchSprints(),
                this.fetchUsers()
            ]);
            
            console.log('[TaskReporting] Data fetched:', { 
                tasks: tasks.length, 
                timeEntries: timeEntries.length, 
                sprints: sprints.length, 
                users: users.length 
            });

            // Process and calculate metrics
            this.reportData = {
                overview: this.calculateOverviewMetrics(tasks, timeEntries),
                productivity: this.calculateProductivityMetrics(tasks, timeEntries, users),
                timeTracking: this.calculateTimeMetrics(tasks, timeEntries),
                sprints: this.calculateSprintMetrics(tasks, sprints),
                labels: this.calculateLabelMetrics(tasks),
                trends: this.calculateTrends(tasks, timeEntries)
            };

            this.loading = false;
            this.requestUpdate();
            
            // Update charts after render
            await this.updateComplete;
            this.updateCharts();
        } catch (error) {
            console.error('[TaskReporting] Error loading report data:', error);
            this.loading = false;
        }
    }

    async fetchTasks() {
        try {
            if (window.api?.lims?.getTasks) {
                const tasks = await window.api.lims.getTasks();
                // Filter by date range
                return tasks.filter(task => {
                    const createdAt = new Date(task.created_at);
                    return createdAt >= new Date(this.dateRange.start) && 
                           createdAt <= new Date(this.dateRange.end + 'T23:59:59');
                });
            }
            return [];
        } catch (error) {
            console.error('[TaskReporting] Error fetching tasks:', error);
            return [];
        }
    }

    async fetchTimeEntries() {
        // Time tracking might not be implemented yet
        // Return empty array for now
        return [];
    }

    async fetchSprints() {
        try {
            if (window.api?.lims?.getSprints) {
                // Get sprints for all projects
                const projects = await window.api.lims.getProjects();
                const allSprints = [];
                for (const project of projects) {
                    const sprints = await window.api.lims.getSprints(project.id);
                    allSprints.push(...sprints);
                }
                return allSprints;
            }
            return [];
        } catch (error) {
            console.error('[TaskReporting] Error fetching sprints:', error);
            return [];
        }
    }

    async fetchUsers() {
        try {
            if (window.api?.lims?.getTeamMembers) {
                const members = await window.api.lims.getTeamMembers();
                return members.map(member => ({
                    id: member.id,
                    email: member.email,
                    display_name: member.name || member.email
                }));
            }
            return [];
        } catch (error) {
            console.error('[TaskReporting] Error fetching users:', error);
            return [];
        }
    }

    calculateOverviewMetrics(tasks, timeEntries) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const blockedTasks = tasks.filter(t => t.is_blocked).length;
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
        
        const totalTimeSpent = timeEntries.reduce((sum, entry) => {
            const duration = entry.end_time ? 
                new Date(entry.end_time) - new Date(entry.start_time) : 0;
            return sum + duration;
        }, 0);
        
        const avgTaskCompletionTime = completedTasks > 0 ? 
            totalTimeSpent / completedTasks / (1000 * 60 * 60) : 0; // in hours
        
        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            blockedTasks,
            completionRate,
            totalTimeSpent: totalTimeSpent / (1000 * 60 * 60), // in hours
            avgTaskCompletionTime
        };
    }

    calculateProductivityMetrics(tasks, timeEntries, users) {
        const userMetrics = {};
        
        users.forEach(user => {
            const userTasks = tasks.filter(t => t.assigned_to === user.id);
            const userTimeEntries = timeEntries.filter(t => t.user_id === user.id);
            
            const totalTime = userTimeEntries.reduce((sum, entry) => {
                const duration = entry.end_time ? 
                    new Date(entry.end_time) - new Date(entry.start_time) : 0;
                return sum + duration;
            }, 0) / (1000 * 60 * 60); // in hours
            
            userMetrics[user.id] = {
                name: user.display_name || user.email,
                tasksCompleted: userTasks.filter(t => t.status === 'done').length,
                tasksTotal: userTasks.length,
                timeSpent: totalTime,
                avgTimePerTask: userTasks.length > 0 ? totalTime / userTasks.length : 0
            };
        });
        
        return userMetrics;
    }

    calculateTimeMetrics(tasks, timeEntries) {
        // Group time entries by day
        const dailyTime = {};
        const taskTime = {};
        
        timeEntries.forEach(entry => {
            const date = new Date(entry.start_time).toISOString().split('T')[0];
            const duration = entry.end_time ? 
                new Date(entry.end_time) - new Date(entry.start_time) : 0;
            const hours = duration / (1000 * 60 * 60);
            
            dailyTime[date] = (dailyTime[date] || 0) + hours;
            taskTime[entry.task_id] = (taskTime[entry.task_id] || 0) + hours;
        });
        
        // Find tasks with most time spent
        const topTasks = Object.entries(taskTime)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([taskId, hours]) => {
                const task = tasks.find(t => t.id === taskId);
                return {
                    id: taskId,
                    title: task?.title || 'Unknown Task',
                    hours: hours.toFixed(1)
                };
            });
        
        return {
            dailyTime,
            topTasks,
            totalHours: Object.values(dailyTime).reduce((a, b) => a + b, 0)
        };
    }

    calculateSprintMetrics(tasks, sprints) {
        const sprintMetrics = sprints.map(sprint => {
            const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);
            const completed = sprintTasks.filter(t => t.status === 'done').length;
            const total = sprintTasks.length;
            
            return {
                id: sprint.id,
                name: sprint.name,
                completed,
                total,
                completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
                status: sprint.status,
                startDate: sprint.start_date,
                endDate: sprint.end_date
            };
        });
        
        return sprintMetrics;
    }

    calculateLabelMetrics(tasks) {
        const labelCounts = {};
        
        tasks.forEach(task => {
            if (task.labels && Array.isArray(task.labels)) {
                task.labels.forEach(label => {
                    labelCounts[label] = (labelCounts[label] || 0) + 1;
                });
            }
        });
        
        return Object.entries(labelCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([label, count]) => ({ label, count }));
    }

    calculateTrends(tasks, timeEntries) {
        // Calculate daily task creation and completion
        const dailyMetrics = {};
        
        tasks.forEach(task => {
            const createdDate = new Date(task.created_at).toISOString().split('T')[0];
            
            if (!dailyMetrics[createdDate]) {
                dailyMetrics[createdDate] = { created: 0, completed: 0 };
            }
            
            dailyMetrics[createdDate].created++;
            
            if (task.status === 'done' && task.completed_at) {
                const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
                if (!dailyMetrics[completedDate]) {
                    dailyMetrics[completedDate] = { created: 0, completed: 0 };
                }
                dailyMetrics[completedDate].completed++;
            }
        });
        
        return dailyMetrics;
    }

    updateCharts() {
        // Update completion rate chart
        this.updateCompletionChart();
        
        // Update time tracking chart
        this.updateTimeChart();
        
        // Update productivity chart
        this.updateProductivityChart();
        
        // Update trends chart
        this.updateTrendsChart();
    }

    updateCompletionChart() {
        const canvas = this.shadowRoot.querySelector('#completionChart');
        if (!canvas || !Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.completion) {
            this.charts.completion.destroy();
        }
        
        const data = this.reportData.overview;
        
        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
                datasets: [{
                    data: [
                        data.completedTasks,
                        data.inProgressTasks,
                        data.totalTasks - data.completedTasks - data.inProgressTasks - data.blockedTasks,
                        data.blockedTasks
                    ],
                    backgroundColor: [
                        'rgba(52, 199, 89, 0.8)',
                        'rgba(0, 122, 255, 0.8)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 59, 48, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    updateTimeChart() {
        const canvas = this.shadowRoot.querySelector('#timeChart');
        if (!canvas || !Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.time) {
            this.charts.time.destroy();
        }
        
        const timeData = this.reportData.timeTracking;
        const dates = Object.keys(timeData.dailyTime).sort();
        const hours = dates.map(date => timeData.dailyTime[date]);
        
        this.charts.time = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Hours Logged',
                    data: hours,
                    backgroundColor: 'rgba(0, 122, 255, 0.6)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateProductivityChart() {
        const canvas = this.shadowRoot.querySelector('#productivityChart');
        if (!canvas || !Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.productivity) {
            this.charts.productivity.destroy();
        }
        
        const productivityData = this.reportData.productivity;
        const users = Object.values(productivityData).slice(0, 10);
        
        this.charts.productivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: users.map(u => u.name),
                datasets: [
                    {
                        label: 'Tasks Completed',
                        data: users.map(u => u.tasksCompleted),
                        backgroundColor: 'rgba(52, 199, 89, 0.6)',
                        borderColor: 'rgba(52, 199, 89, 1)',
                        borderWidth: 1,
                        yAxisID: 'y-tasks'
                    },
                    {
                        label: 'Hours Spent',
                        data: users.map(u => u.timeSpent),
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        yAxisID: 'y-time'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    'y-tasks': {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    'y-time': {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    updateTrendsChart() {
        const canvas = this.shadowRoot.querySelector('#trendsChart');
        if (!canvas || !Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }
        
        const trendsData = this.reportData.trends;
        const dates = Object.keys(trendsData).sort();
        
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [
                    {
                        label: 'Tasks Created',
                        data: dates.map(date => trendsData[date].created),
                        borderColor: 'rgba(0, 122, 255, 1)',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Tasks Completed',
                        data: dates.map(date => trendsData[date].completed),
                        borderColor: 'rgba(52, 199, 89, 1)',
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    handleDateChange(type, event) {
        this.dateRange = {
            ...this.dateRange,
            [type]: event.target.value
        };
        this.loadReportData();
    }

    handleTabChange(tab) {
        this.selectedTab = tab;
    }

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }

    handleFilterChange(filterType, value) {
        this.filters = {
            ...this.filters,
            [filterType]: value
        };
        this.loadReportData();
    }

    async exportReport() {
        // Generate CSV export
        const csv = this.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task-report-${this.dateRange.start}-to-${this.dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateCSV() {
        const data = this.reportData.overview;
        const productivity = this.reportData.productivity;
        
        let csv = 'Task Management Report\n';
        csv += `Date Range: ${this.dateRange.start} to ${this.dateRange.end}\n\n`;
        
        csv += 'Overview Metrics\n';
        csv += 'Metric,Value\n';
        csv += `Total Tasks,${data.totalTasks}\n`;
        csv += `Completed Tasks,${data.completedTasks}\n`;
        csv += `In Progress Tasks,${data.inProgressTasks}\n`;
        csv += `Blocked Tasks,${data.blockedTasks}\n`;
        csv += `Completion Rate,${data.completionRate}%\n`;
        csv += `Total Time Spent,${data.totalTimeSpent.toFixed(1)} hours\n`;
        csv += `Average Task Completion Time,${data.avgTaskCompletionTime.toFixed(1)} hours\n\n`;
        
        csv += 'User Productivity\n';
        csv += 'User,Tasks Completed,Total Tasks,Time Spent (hours),Avg Time per Task (hours)\n';
        
        Object.values(productivity).forEach(user => {
            csv += `${user.name},${user.tasksCompleted},${user.tasksTotal},${user.timeSpent.toFixed(1)},${user.avgTimePerTask.toFixed(1)}\n`;
        });
        
        return csv;
    }

    renderOverviewTab() {
        const data = this.reportData.overview || {};
        
        return html`
            <div class="report-grid">
                <!-- Key Metrics -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Key Metrics</div>
                            <div class="card-subtitle">Overall performance indicators</div>
                        </div>
                    </div>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${data.totalTasks || 0}</div>
                            <div class="stat-label">Total Tasks</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.completionRate || 0}%</div>
                            <div class="stat-label">Completion Rate</div>
                            <div class="stat-change positive">↑ 5.2%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${(data.totalTimeSpent || 0).toFixed(0)}h</div>
                            <div class="stat-label">Time Logged</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${data.blockedTasks || 0}</div>
                            <div class="stat-label">Blocked Tasks</div>
                            <div class="stat-change negative">↑ 2</div>
                        </div>
                    </div>
                </div>

                <!-- Task Status Distribution -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Task Status Distribution</div>
                            <div class="card-subtitle">Current task breakdown by status</div>
                        </div>
                    </div>
                    <div class="chart-container small">
                        <canvas id="completionChart"></canvas>
                    </div>
                </div>

                <!-- Trends -->
                <div class="report-card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Task Creation vs Completion Trends</div>
                            <div class="card-subtitle">Daily task flow over time</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="trendsChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    renderProductivityTab() {
        const productivity = this.reportData.productivity || {};
        const topUsers = Object.values(productivity)
            .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
            .slice(0, 10);
        
        return html`
            <div class="report-grid">
                <!-- User Productivity Chart -->
                <div class="report-card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">User Productivity Overview</div>
                            <div class="card-subtitle">Tasks completed and time spent by user</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="productivityChart"></canvas>
                    </div>
                </div>

                <!-- Top Performers -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Top Performers</div>
                            <div class="card-subtitle">Most productive team members</div>
                        </div>
                    </div>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Tasks</th>
                                <th>Time</th>
                                <th>Avg/Task</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topUsers.map(user => html`
                                <tr>
                                    <td>${user.name}</td>
                                    <td>${user.tasksCompleted}/${user.tasksTotal}</td>
                                    <td>${user.timeSpent.toFixed(1)}h</td>
                                    <td>${user.avgTimePerTask.toFixed(1)}h</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>

                <!-- Productivity Metrics -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Team Productivity</div>
                            <div class="card-subtitle">Overall team performance</div>
                        </div>
                    </div>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${topUsers.reduce((sum, u) => sum + u.tasksCompleted, 0)}</div>
                            <div class="stat-label">Total Completed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${(topUsers.reduce((sum, u) => sum + u.timeSpent, 0) / topUsers.length).toFixed(1)}h</div>
                            <div class="stat-label">Avg Time/User</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTimeTab() {
        const timeData = this.reportData.timeTracking || {};
        
        return html`
            <div class="report-grid">
                <!-- Time Tracking Chart -->
                <div class="report-card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Daily Time Tracking</div>
                            <div class="card-subtitle">Hours logged per day</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="timeChart"></canvas>
                    </div>
                </div>

                <!-- Top Time-Consuming Tasks -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Most Time-Consuming Tasks</div>
                            <div class="card-subtitle">Tasks with highest time investment</div>
                        </div>
                    </div>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(timeData.topTasks || []).map(task => html`
                                <tr>
                                    <td>${task.title}</td>
                                    <td>${task.hours}h</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>

                <!-- Time Summary -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Time Summary</div>
                            <div class="card-subtitle">Overall time metrics</div>
                        </div>
                    </div>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <div class="stat-value">${(timeData.totalHours || 0).toFixed(0)}</div>
                            <div class="stat-label">Total Hours</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${((timeData.totalHours || 0) / 30).toFixed(1)}</div>
                            <div class="stat-label">Daily Average</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSprintsTab() {
        const sprints = this.reportData.sprints || [];
        
        return html`
            <div class="report-grid">
                <!-- Sprint Performance -->
                <div class="report-card full-width">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Sprint Performance</div>
                            <div class="card-subtitle">Task completion by sprint</div>
                        </div>
                    </div>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Sprint</th>
                                <th>Status</th>
                                <th>Tasks</th>
                                <th>Completion</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sprints.map(sprint => html`
                                <tr>
                                    <td>${sprint.name}</td>
                                    <td>
                                        <span class="status-badge ${sprint.status}">
                                            ${sprint.status}
                                        </span>
                                    </td>
                                    <td>${sprint.completed}/${sprint.total}</td>
                                    <td>${sprint.completionRate}%</td>
                                    <td>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${sprint.completionRate}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderLabelsTab() {
        const labels = this.reportData.labels || [];
        const totalTasks = labels.reduce((sum, l) => sum + l.count, 0);
        
        return html`
            <div class="report-grid">
                <!-- Label Distribution -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Label Distribution</div>
                            <div class="card-subtitle">Task categorization by labels</div>
                        </div>
                    </div>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Label</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${labels.map(label => html`
                                <tr>
                                    <td>
                                        <span class="label-badge">${label.label}</span>
                                    </td>
                                    <td>${label.count}</td>
                                    <td>${((label.count / totalTasks) * 100).toFixed(1)}%</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>

                <!-- Label Insights -->
                <div class="report-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Label Insights</div>
                            <div class="card-subtitle">Key findings from label data</div>
                        </div>
                    </div>
                    <div class="insights">
                        <p>• Most used label: <strong>${labels[0]?.label || 'N/A'}</strong> (${labels[0]?.count || 0} tasks)</p>
                        <p>• Total unique labels: <strong>${labels.length}</strong></p>
                        <p>• Average tasks per label: <strong>${labels.length > 0 ? (totalTasks / labels.length).toFixed(1) : '0'}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        console.log('[TaskReporting] Rendering, loading:', this.loading, 'selectedTab:', this.selectedTab);
        
        return html`
            <div class="reporting-container">
                <!-- Date range selector in header -->
                <div class="report-controls">
                    <div class="date-range-selector">
                        <label>From:</label>
                        <input 
                            type="date" 
                            class="date-input"
                            .value=${this.dateRange.start}
                            @change=${(e) => this.handleDateChange('start', e)}
                        />
                        <label>To:</label>
                        <input 
                            type="date" 
                            class="date-input"
                            .value=${this.dateRange.end}
                            @change=${(e) => this.handleDateChange('end', e)}
                        />
                    </div>
                    <button class="export-button" @click=${() => this.exportReport()}>
                        <span>📊</span>
                        Export
                    </button>
                </div>

                ${this.showFilters ? html`
                    <div class="filters-panel show">
                        <div class="filter-row">
                            <div class="filter-group">
                                <div class="filter-label">Project</div>
                                <select 
                                    class="filter-select"
                                    @change=${(e) => this.handleFilterChange('project', e.target.value)}
                                >
                                    <option value="all">All Projects</option>
                                    <!-- Add project options dynamically -->
                                </select>
                            </div>
                            <div class="filter-group">
                                <div class="filter-label">User</div>
                                <select 
                                    class="filter-select"
                                    @change=${(e) => this.handleFilterChange('user', e.target.value)}
                                >
                                    <option value="all">All Users</option>
                                    <!-- Add user options dynamically -->
                                </select>
                            </div>
                            <div class="filter-group">
                                <div class="filter-label">Label</div>
                                <select 
                                    class="filter-select"
                                    @change=${(e) => this.handleFilterChange('label', e.target.value)}
                                >
                                    <option value="all">All Labels</option>
                                    <!-- Add label options dynamically -->
                                </select>
                            </div>
                            <div class="filter-group">
                                <div class="filter-label">Priority</div>
                                <select 
                                    class="filter-select"
                                    @change=${(e) => this.handleFilterChange('priority', e.target.value)}
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="report-tabs">
                    <button 
                        class="tab-button ${this.selectedTab === 'overview' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        class="tab-button ${this.selectedTab === 'productivity' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('productivity')}
                    >
                        Productivity
                    </button>
                    <button 
                        class="tab-button ${this.selectedTab === 'time' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('time')}
                    >
                        Time Tracking
                    </button>
                    <button 
                        class="tab-button ${this.selectedTab === 'sprints' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('sprints')}
                    >
                        Sprints
                    </button>
                    <button 
                        class="tab-button ${this.selectedTab === 'labels' ? 'active' : ''}"
                        @click=${() => this.handleTabChange('labels')}
                    >
                        Labels
                    </button>
                </div>

                ${this.loading ? html`
                    <div class="loading">
                        <span>Loading report data...</span>
                    </div>
                ` : html`
                    ${this.selectedTab === 'overview' ? this.renderOverviewTab() : ''}
                    ${this.selectedTab === 'productivity' ? this.renderProductivityTab() : ''}
                    ${this.selectedTab === 'time' ? this.renderTimeTab() : ''}
                    ${this.selectedTab === 'sprints' ? this.renderSprintsTab() : ''}
                    ${this.selectedTab === 'labels' ? this.renderLabelsTab() : ''}
                `}
            </div>
        `;
    }
}

customElements.define('task-reporting-module', TaskReportingModule);