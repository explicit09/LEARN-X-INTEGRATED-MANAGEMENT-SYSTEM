const supabaseDatabase = require('../../common/services/supabaseDatabase');

async function addAiMessage({ uid, sessionId, role, content, model = 'unknown' }) {
    const messageId = require('crypto').randomUUID();
    const now = new Date().toISOString();
    
    const messageData = {
        id: messageId,
        session_id: sessionId,
        user_id: uid,
        sent_at: now,
        role: role,
        content: content,
        model: model,
        created_at: now
    };
    
    try {
        await supabaseDatabase.create('ai_messages', messageData);
        return { id: messageId };
    } catch (error) {
        console.error('[AskRepository] Failed to add AI message:', error);
        throw error;
    }
}

async function getAllAiMessagesBySessionId(sessionId) {
    try {
        const messages = await supabaseDatabase.findMany(
            'ai_messages',
            { session_id: sessionId },
            { orderBy: 'sent_at', ascending: true }
        );
        return messages || [];
    } catch (error) {
        console.error('[AskRepository] Failed to get AI messages:', error);
        return [];
    }
}

module.exports = {
    addAiMessage,
    getAllAiMessagesBySessionId
};