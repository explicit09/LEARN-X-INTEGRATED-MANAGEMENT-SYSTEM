const supabaseSummaryRepository = {
    saveSummary: ({ uid, sessionId, tldr, text, bullet_json, action_json, model }) => {
        // TODO: Implement Supabase logic
        return Promise.resolve(null);
    },

    getSummaryBySessionId: (sessionId) => {
        // TODO: Implement Supabase logic
        return Promise.resolve(null);
    }
};

module.exports = supabaseSummaryRepository;