const supabaseDatabase = require('../services/supabaseDatabase');

/**
 * Template for Supabase repository implementation
 * Replace 'tableName' with your actual table name
 * Replace 'Model' with your model name
 */
class SupabaseModelRepository {
    constructor() {
        this.tableName = 'your_table_name'; // UPDATE THIS
        this.db = supabaseDatabase;
    }

    // Create operations
    async create(data) {
        try {
            // Add user_id if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user') {
                data.user_id = userId;
            }
            
            return await this.db.create(this.tableName, data);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error creating record:`, error);
            throw error;
        }
    }

    async createMany(dataArray) {
        try {
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            // Add user_id to all records if authenticated
            if (userId && userId !== 'default_user') {
                dataArray = dataArray.map(data => ({ ...data, user_id: userId }));
            }
            
            return await this.db.createMany(this.tableName, dataArray);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error creating records:`, error);
            throw error;
        }
    }

    // Read operations
    async findById(id) {
        try {
            return await this.db.findById(this.tableName, id);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding by id:`, error);
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            return await this.db.findMany(this.tableName, { user_id: userId });
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding by user id:`, error);
            throw error;
        }
    }

    async findAll(filters = {}, options = {}) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return await this.db.findMany(this.tableName, filters, options);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding all:`, error);
            throw error;
        }
    }

    async findOne(filters) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return await this.db.findOne(this.tableName, filters);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding one:`, error);
            throw error;
        }
    }

    // Update operations
    async update(id, updates) {
        try {
            // Remove user_id from updates to prevent changing ownership
            delete updates.user_id;
            
            return await this.db.update(this.tableName, id, updates);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error updating:`, error);
            throw error;
        }
    }

    async updateMany(filters, updates) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            // Remove user_id from updates
            delete updates.user_id;
            
            return await this.db.updateMany(this.tableName, filters, updates);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error updating many:`, error);
            throw error;
        }
    }

    // Delete operations
    async delete(id) {
        try {
            return await this.db.delete(this.tableName, id);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error deleting:`, error);
            throw error;
        }
    }

    async deleteMany(filters) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return await this.db.deleteMany(this.tableName, filters);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error deleting many:`, error);
            throw error;
        }
    }

    async deleteByUserId(userId) {
        try {
            return await this.db.deleteMany(this.tableName, { user_id: userId });
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error deleting by user id:`, error);
            throw error;
        }
    }

    // Upsert operation
    async upsert(data, options = {}) {
        try {
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user') {
                data.user_id = userId;
            }
            
            return await this.db.upsert(this.tableName, data, options);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error upserting:`, error);
            throw error;
        }
    }

    // Count operation
    async count(filters = {}) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return await this.db.count(this.tableName, filters);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error counting:`, error);
            throw error;
        }
    }

    // Search operation
    async search(column, searchTerm, filters = {}) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return await this.db.search(this.tableName, column, searchTerm, filters);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error searching:`, error);
            throw error;
        }
    }

    // Real-time subscription
    subscribe(callback, filters = {}) {
        try {
            // Add user filter if authenticated
            const authService = require('../services/authService');
            const userId = authService.getCurrentUserId();
            
            if (userId && userId !== 'default_user' && !filters.user_id) {
                filters.user_id = userId;
            }
            
            return this.db.subscribe(this.tableName, filters, callback);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error subscribing:`, error);
            throw error;
        }
    }
}

module.exports = SupabaseModelRepository;