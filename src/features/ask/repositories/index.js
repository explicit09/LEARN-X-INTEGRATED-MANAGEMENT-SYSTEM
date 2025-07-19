const sqliteRepository = require('./sqlite.repository');
const supabaseRepository = require('./supabase.repository');
const authService = require('../../common/services/authService');

function getBaseRepository() {
    const user = authService.getCurrentUser();
    if (user && user.isLoggedIn && user.mode === 'supabase') {
        return supabaseRepository;
    }
    return sqliteRepository;
}

// The adapter layer that injects the UID
const askRepositoryAdapter = {
    addAiMessage: ({ sessionId, role, content, model }) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().addAiMessage({ uid, sessionId, role, content, model });
    },
    getAllAiMessagesBySessionId: (sessionId) => {
        // This function does not require a UID at the service level.
        return getBaseRepository().getAllAiMessagesBySessionId(sessionId);
    }
};

module.exports = askRepositoryAdapter; 