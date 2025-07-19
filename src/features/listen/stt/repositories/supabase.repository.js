const supabaseSttRepository = {
    addTranscript: ({ uid, sessionId, speaker, text }) => {
        // TODO: Implement Supabase logic
        return Promise.resolve(null);
    },

    getAllTranscriptsBySessionId: (sessionId) => {
        // TODO: Implement Supabase logic
        return Promise.resolve([]);
    }
};

module.exports = supabaseSttRepository;