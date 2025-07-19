const sqliteRepository = require('./sqlite.repository');
const supabaseRepository = require('./supabase.repository');
const authService = require('../../../common/services/authService');

function getBaseRepository() {
    const user = authService.getCurrentUser();
    if (user && user.isLoggedIn && user.mode === 'supabase') {
        return supabaseRepository;
    }
    return sqliteRepository;
}

const sttRepositoryAdapter = {
    addTranscript: ({ sessionId, speaker, text }) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().addTranscript({ uid, sessionId, speaker, text });
    },
    getAllTranscriptsBySessionId: (sessionId) => {
        return getBaseRepository().getAllTranscriptsBySessionId(sessionId);
    }
};

module.exports = sttRepositoryAdapter; 