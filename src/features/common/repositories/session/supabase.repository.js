const supabaseDatabase = require('../../services/supabaseDatabase');

class SessionSupabaseRepository {
    constructor() {
        this.tableName = 'sessions';
        this.db = supabaseDatabase;
        this.authService = null;
    }

    setAuthService(authService) {
        this.authService = authService;
    }

    async getById(id) {
        try {
            return await this.db.findById(this.tableName, id);
        } catch (error) {
            console.error('[SessionRepository] Error getting session by id:', error);
            return null;
        }
    }

    async create(uid, type = 'ask') {
        const sessionId = require('crypto').randomUUID();
        const now = new Date().toISOString();
        
        const sessionData = {
            id: sessionId,
            user_id: uid,
            title: `Session @ ${new Date().toLocaleTimeString()}`,
            session_type: type,
            started_at: now,
            updated_at: now,
            is_active: true,
            sync_state: 'synced'
        };
        
        try {
            await this.db.create(this.tableName, sessionData);
            console.log(`[SessionRepository] Created session ${sessionId} for user ${uid} (type: ${type})`);
            return sessionId;
        } catch (error) {
            console.error('[SessionRepository] Failed to create session:', error);
            throw error;
        }
    }

    async getAllByUserId(uid) {
        try {
            return await this.db.findMany(
                this.tableName, 
                { user_id: uid },
                { orderBy: 'started_at', ascending: false }
            );
        } catch (error) {
            console.error('[SessionRepository] Error getting sessions by user id:', error);
            return [];
        }
    }

    async updateTitle(id, title) {
        try {
            await this.db.update(this.tableName, id, { 
                title, 
                updated_at: new Date().toISOString() 
            });
            return { changes: 1 };
        } catch (error) {
            console.error('[SessionRepository] Error updating session title:', error);
            return { changes: 0 };
        }
    }

    async deleteWithRelatedData(id) {
        try {
            // Note: In Supabase, you would typically set up cascade deletes
            // in your database schema. For now, we'll delete manually.
            
            // Delete related data
            await this.db.deleteMany('transcripts', { session_id: id });
            await this.db.deleteMany('ai_messages', { session_id: id });
            await this.db.deleteMany('summaries', { session_id: id });
            
            // Delete the session
            await this.db.delete(this.tableName, id);
            
            return { success: true };
        } catch (error) {
            console.error('[SessionRepository] Error deleting session with related data:', error);
            throw error;
        }
    }

    async getActiveSessionsByUserId(uid) {
        try {
            return await this.db.findMany(
                this.tableName,
                { user_id: uid, is_active: true },
                { orderBy: 'started_at', ascending: false }
            );
        } catch (error) {
            console.error('[SessionRepository] Error getting active sessions:', error);
            return [];
        }
    }

    async endSession(id) {
        try {
            await this.db.update(this.tableName, id, {
                is_active: false,
                ended_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.log(`[SessionRepository] Ended session ${id}`);
            return { success: true };
        } catch (error) {
            console.error('[SessionRepository] Error ending session:', error);
            return { success: false };
        }
    }

    async endAllActiveSessions() {
        try {
            const uid = this.authService?.getCurrentUserId();
            if (!uid) return;

            const activeSessions = await this.getActiveSessionsByUserId(uid);
            
            for (const session of activeSessions) {
                await this.endSession(session.id);
            }
            
            console.log(`[SessionRepository] Ended ${activeSessions.length} active sessions for user ${uid}`);
        } catch (error) {
            console.error('[SessionRepository] Error ending all active sessions:', error);
        }
    }

    async updateSyncState(id, syncState) {
        try {
            await this.db.update(this.tableName, id, {
                sync_state: syncState,
                updated_at: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('[SessionRepository] Error updating sync state:', error);
            return { success: false };
        }
    }

    async getRecentSessions(uid, limit = 10) {
        try {
            return await this.db.findMany(
                this.tableName,
                { user_id: uid },
                { 
                    orderBy: 'started_at', 
                    ascending: false,
                    limit 
                }
            );
        } catch (error) {
            console.error('[SessionRepository] Error getting recent sessions:', error);
            return [];
        }
    }

    async deleteOldSessions(uid, daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            // First get the sessions to delete
            const oldSessions = await this.db.findMany(
                this.tableName,
                { 
                    user_id: uid,
                    started_at: { lt: cutoffDate.toISOString() }
                }
            );
            
            // Delete each session with its related data
            for (const session of oldSessions) {
                await this.deleteWithRelatedData(session.id);
            }
            
            console.log(`[SessionRepository] Deleted ${oldSessions.length} old sessions for user ${uid}`);
            return { deletedCount: oldSessions.length };
        } catch (error) {
            console.error('[SessionRepository] Error deleting old sessions:', error);
            return { deletedCount: 0 };
        }
    }

    // Real-time subscription for session updates
    subscribeToUserSessions(uid, callback) {
        return this.db.subscribe(
            this.tableName,
            { user_id: uid },
            (payload) => {
                console.log('[SessionRepository] Session update:', payload);
                callback(payload);
            }
        );
    }
}

// Export singleton instance
const sessionSupabaseRepository = new SessionSupabaseRepository();
module.exports = sessionSupabaseRepository;