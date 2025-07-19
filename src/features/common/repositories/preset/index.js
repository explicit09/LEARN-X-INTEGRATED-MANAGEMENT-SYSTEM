const sqliteRepository = require('./sqlite.repository');
const supabaseRepository = require('./supabase.repository');
const authService = require('../../services/authService');

function getBaseRepository() {
    const user = authService.getCurrentUser();
    if (user && user.isLoggedIn && user.mode === 'supabase') {
        return supabaseRepository;
    }
    return sqliteRepository;
}

const presetRepositoryAdapter = {
    getPresets: () => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().getPresets(uid);
    },

    getPresetTemplates: () => {
        return getBaseRepository().getPresetTemplates();
    },

    create: (options) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().create({ uid, ...options });
    },

    update: (id, options) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().update(id, options, uid);
    },

    delete: (id) => {
        const uid = authService.getCurrentUserId();
        return getBaseRepository().delete(id, uid);
    },
};

module.exports = presetRepositoryAdapter; 