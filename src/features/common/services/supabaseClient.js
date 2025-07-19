const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.serviceSupabase = null;
        this.authStateListeners = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            console.log('[SupabaseClient] Already initialized');
            return;
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('[SupabaseClient] Missing Supabase configuration. Please check your .env file.');
            throw new Error('Supabase configuration missing');
        }

        // Create client for regular operations (respects RLS)
        this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
                storage: {
                    getItem: (key) => {
                        // Use electron-store for persistence in Electron app
                        const Store = require('electron-store');
                        const store = new Store();
                        return store.get(key);
                    },
                    setItem: (key, value) => {
                        const Store = require('electron-store');
                        const store = new Store();
                        store.set(key, value);
                    },
                    removeItem: (key) => {
                        const Store = require('electron-store');
                        const store = new Store();
                        store.delete(key);
                    }
                }
            }
        });

        // Create service client for admin operations (bypasses RLS)
        if (supabaseServiceKey) {
            this.serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
        }

        // Set up auth state change listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('[SupabaseClient] Auth state changed:', event);
            this.notifyAuthStateListeners(event, session);
        });

        this.initialized = true;
        console.log('[SupabaseClient] Initialized successfully');
    }

    // Auth methods
    async signUp(email, password, metadata = {}) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        
        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async getSession() {
        const { data, error } = await this.supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    async getUser() {
        const { data, error } = await this.supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    }

    async updateUser(updates) {
        const { data, error } = await this.supabase.auth.updateUser(updates);
        if (error) throw error;
        return data;
    }

    async resetPassword(email) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    }

    // Auth state management
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }

    notifyAuthStateListeners(event, session) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(event, session);
            } catch (error) {
                console.error('[SupabaseClient] Error in auth state listener:', error);
            }
        });
    }

    // Database helpers
    getClient() {
        if (!this.initialized) {
            throw new Error('SupabaseClient not initialized. Call initialize() first.');
        }
        return this.supabase;
    }

    getServiceClient() {
        if (!this.initialized) {
            throw new Error('SupabaseClient not initialized. Call initialize() first.');
        }
        if (!this.serviceSupabase) {
            throw new Error('Service client not available. Check SUPABASE_SERVICE_KEY.');
        }
        return this.serviceSupabase;
    }

    // Database operations
    from(table) {
        return this.getClient().from(table);
    }

    // Storage operations
    storage(bucket) {
        return this.getClient().storage.from(bucket);
    }

    // Realtime subscriptions
    channel(name) {
        return this.getClient().channel(name);
    }

    // RPC calls
    async rpc(functionName, params = {}) {
        const { data, error } = await this.getClient().rpc(functionName, params);
        if (error) throw error;
        return data;
    }
}

// Export singleton instance
const supabaseClient = new SupabaseClient();
module.exports = supabaseClient;