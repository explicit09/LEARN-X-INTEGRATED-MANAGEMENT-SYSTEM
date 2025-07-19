const supabaseClient = require('./supabaseClient');

class SupabaseDatabase {
    constructor() {
        this.client = null;
    }

    initialize() {
        this.client = supabaseClient.getClient();
        console.log('[SupabaseDatabase] Initialized');
    }

    // Generic CRUD operations
    async create(table, data) {
        const { data: result, error } = await this.client
            .from(table)
            .insert(data)
            .select()
            .single();
        
        if (error) throw error;
        return result;
    }

    async createMany(table, dataArray) {
        const { data: results, error } = await this.client
            .from(table)
            .insert(dataArray)
            .select();
        
        if (error) throw error;
        return results;
    }

    async findById(table, id) {
        const { data, error } = await this.client
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    }

    async findOne(table, filters) {
        let query = this.client.from(table).select('*');
        
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findMany(table, filters = {}, options = {}) {
        let query = this.client.from(table).select('*');
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                query = query.in(key, value);
            } else if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });
        
        // Apply sorting
        if (options.orderBy) {
            query = query.order(options.orderBy, { ascending: options.ascending ?? true });
        }
        
        // Apply pagination
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async update(table, id, updates) {
        const { data, error } = await this.client
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateMany(table, filters, updates) {
        let query = this.client.from(table).update(updates);
        
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    }

    async delete(table, id) {
        const { error } = await this.client
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    async deleteMany(table, filters) {
        let query = this.client.from(table).delete();
        
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        
        const { error } = await query;
        if (error) throw error;
        return true;
    }

    // Upsert operation
    async upsert(table, data, options = {}) {
        const { data: result, error } = await this.client
            .from(table)
            .upsert(data, {
                onConflict: options.onConflict || 'id',
                ...options
            })
            .select();
        
        if (error) throw error;
        return result;
    }

    // Count operations
    async count(table, filters = {}) {
        let query = this.client.from(table).select('*', { count: 'exact', head: true });
        
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        
        const { count, error } = await query;
        if (error) throw error;
        return count;
    }

    // Transaction support (using RPC functions)
    async transaction(callback) {
        // Note: Supabase doesn't have built-in transaction support in JS client
        // You'll need to create PostgreSQL functions for complex transactions
        console.warn('[SupabaseDatabase] Direct transaction support not available. Use RPC functions for complex operations.');
        return await callback(this);
    }

    // Text search
    async search(table, column, searchTerm, filters = {}) {
        let query = this.client
            .from(table)
            .select('*')
            .textSearch(column, searchTerm);
        
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    // Realtime subscriptions
    subscribe(table, filters = {}, callback) {
        const channel = this.client
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: Object.entries(filters)
                        .map(([key, value]) => `${key}=eq.${value}`)
                        .join('&')
                },
                (payload) => callback(payload)
            )
            .subscribe();
        
        return () => channel.unsubscribe();
    }

    // Storage helpers
    async uploadFile(bucket, path, file, options = {}) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .upload(path, file, options);
        
        if (error) throw error;
        return data;
    }

    async downloadFile(bucket, path) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .download(path);
        
        if (error) throw error;
        return data;
    }

    async deleteFile(bucket, paths) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .remove(paths);
        
        if (error) throw error;
        return data;
    }

    getFileUrl(bucket, path) {
        const { data } = this.client.storage
            .from(bucket)
            .getPublicUrl(path);
        
        return data.publicUrl;
    }
}

// Export singleton instance
const supabaseDatabase = new SupabaseDatabase();
module.exports = supabaseDatabase;