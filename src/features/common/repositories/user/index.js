const sqliteRepository = require('./sqlite.repository');
const supabaseRepository = require('./supabase.repository');

let authService = null;

function getAuthService() {
    if (!authService) {
        authService = require('../../services/authService');
    }
    return authService;
}

function getBaseRepository() {
    const service = getAuthService();
    if (!service) {
        throw new Error('AuthService could not be loaded for the user repository.');
    }
    const user = service.getCurrentUser();
    if (user && user.isLoggedIn && user.mode === 'supabase') {
        return supabaseRepository;
    }
    return sqliteRepository;
}

const userRepositoryAdapter = {
    findOrCreate: (user) => {
        // This function receives the full user object, which includes the uid. No need to inject.
        return getBaseRepository().findOrCreate(user);
    },
    
    getById: () => {
        const uid = getAuthService().getCurrentUserId();
        return getBaseRepository().getById(uid);
    },



    update: (updateData) => {
        const uid = getAuthService().getCurrentUserId();
        return getBaseRepository().update({ uid, ...updateData });
    },

    deleteById: () => {
        const uid = getAuthService().getCurrentUserId();
        return getBaseRepository().deleteById(uid);
    }
};

module.exports = {
    ...userRepositoryAdapter
}; 