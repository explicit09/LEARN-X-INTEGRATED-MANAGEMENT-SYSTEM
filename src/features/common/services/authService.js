const { BrowserWindow, shell } = require('electron');
const supabaseClient = require('./supabaseClient');
const encryptionService = require('./encryptionService');
const migrationService = require('./migrationService');
const sessionRepository = require('../repositories/session');
const permissionService = require('./permissionService');

class AuthService {
    constructor() {
        this.currentUserId = 'default_user';
        this.currentUserMode = 'local'; // 'local' or 'supabase'
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        sessionRepository.setAuthService(this);
    }

    initialize() {
        if (this.isInitialized) return this.initializationPromise;

        this.initializationPromise = new Promise((resolve) => {
            // Initialize Supabase client first
            supabaseClient.initialize();
            
            // Set up auth state listener
            supabaseClient.onAuthStateChange(async (event, session) => {
                const previousUser = this.currentUser;
                
                if (session?.user) {
                    // User signed IN
                    console.log(`[AuthService] Supabase user signed in:`, session.user.id);
                    this.currentUser = session.user;
                    this.currentUserId = session.user.id;
                    this.currentUserMode = 'supabase';

                    // Clean up any zombie sessions from a previous run for this user
                    await sessionRepository.endAllActiveSessions();

                    // Initialize encryption key for the logged-in user if permissions are already granted
                    if (process.platform === 'darwin' && !(await permissionService.checkKeychainCompleted(this.currentUserId))) {
                        console.warn('[AuthService] Keychain permission not yet completed for this user. Deferring key initialization.');
                    } else {
                        await encryptionService.initializeKey(session.user.id);
                    }

                    // Check for and run data migration for the user (background)
                    migrationService.checkAndRunMigration(session.user);

                } else {
                    // User signed OUT
                    console.log(`[AuthService] No Supabase user.`);
                    if (previousUser) {
                        console.log(`[AuthService] User logged out: ${previousUser.id}`);
                        if (global.modelStateService) {
                            await global.modelStateService.clearUserData();
                        }
                    }
                    this.currentUser = null;
                    this.currentUserId = 'default_user';
                    this.currentUserMode = 'local';

                    // End active sessions for the local/default user as well
                    await sessionRepository.endAllActiveSessions();
                    
                    encryptionService.resetSessionKey();
                }
                
                this.broadcastUserState();
                
                if (!this.isInitialized) {
                    this.isInitialized = true;
                    console.log('[AuthService] Initialized and resolved initialization promise.');
                    resolve();
                }
            });

            // Check for existing session
            this.checkExistingSession().then(resolve);
        });

        return this.initializationPromise;
    }

    async checkExistingSession() {
        try {
            const session = await supabaseClient.getSession();
            if (session) {
                console.log('[AuthService] Found existing session');
                // Auth state change listener will handle the rest
            }
        } catch (error) {
            console.error('[AuthService] Error checking existing session:', error);
        }
    }

    async signUp(email, password, metadata = {}) {
        try {
            const data = await supabaseClient.signUp(email, password, metadata);
            console.log(`[AuthService] User signed up successfully`);
            return { success: true, data };
        } catch (error) {
            console.error('[AuthService] Error signing up:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const data = await supabaseClient.signIn(email, password);
            console.log(`[AuthService] User signed in successfully`);
            return { success: true, data };
        } catch (error) {
            console.error('[AuthService] Error signing in:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            // End all active sessions for the current user BEFORE signing out
            await sessionRepository.endAllActiveSessions();
            
            await supabaseClient.signOut();
            console.log('[AuthService] User sign-out initiated successfully.');
            // Auth state change listener will handle the rest
            return { success: true };
        } catch (error) {
            console.error('[AuthService] Error signing out:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await supabaseClient.resetPassword(email);
            console.log('[AuthService] Password reset email sent');
            return { success: true };
        } catch (error) {
            console.error('[AuthService] Error resetting password:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProfile(updates) {
        try {
            const data = await supabaseClient.updateUser(updates);
            console.log('[AuthService] Profile updated successfully');
            return { success: true, data };
        } catch (error) {
            console.error('[AuthService] Error updating profile:', error);
            return { success: false, error: error.message };
        }
    }

    async startWebAuthFlow() {
        try {
            const webUrl = process.env.PICKLEGLASS_WEB_URL || 'http://localhost:3000';
            const authUrl = `${webUrl}/login?mode=electron`;
            console.log(`[AuthService] Opening auth URL in browser: ${authUrl}`);
            await shell.openExternal(authUrl);
            return { success: true };
        } catch (error) {
            console.error('[AuthService] Failed to open auth URL:', error);
            return { success: false, error: error.message };
        }
    }

    broadcastUserState() {
        const userState = this.getCurrentUser();
        console.log('[AuthService] Broadcasting user state change:', userState);
        BrowserWindow.getAllWindows().forEach(win => {
            if (win && !win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
                win.webContents.send('user-state-changed', userState);
            }
        });
    }

    getCurrentUserId() {
        return this.currentUserId;
    }

    getCurrentUser() {
        const isLoggedIn = !!(this.currentUserMode === 'supabase' && this.currentUser);

        if (isLoggedIn) {
            return {
                uid: this.currentUser.id,
                email: this.currentUser.email,
                displayName: this.currentUser.user_metadata?.displayName || this.currentUser.email,
                mode: 'supabase',
                isLoggedIn: true,
                metadata: this.currentUser.user_metadata || {}
            };
        }
        
        return {
            uid: this.currentUserId, // returns 'default_user'
            email: 'local@glass.app',
            displayName: 'Local User',
            mode: 'local',
            isLoggedIn: false
        };
    }

    async getSession() {
        try {
            return await supabaseClient.getSession();
        } catch (error) {
            console.error('[AuthService] Error getting session:', error);
            return null;
        }
    }

    async getAccessToken() {
        try {
            const session = await this.getSession();
            return session?.access_token || null;
        } catch (error) {
            console.error('[AuthService] Error getting access token:', error);
            return null;
        }
    }

    isAuthenticated() {
        return this.currentUserMode === 'supabase' && this.currentUser !== null;
    }

    // Helper method for migration from Firebase
    async migrateFirebaseUser(firebaseUser) {
        console.log('[AuthService] Migrating Firebase user to Supabase:', firebaseUser.email);
        // This is a placeholder - actual migration would require backend coordination
        // to create Supabase accounts from Firebase user data
        return { success: false, error: 'Migration not implemented' };
    }
}

// Export singleton instance
const authService = new AuthService();
module.exports = authService;