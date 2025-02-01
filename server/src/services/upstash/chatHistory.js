import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const saveChatHistory = async (sessionId, chatData) => {
    try {
        const timestamp = new Date().toISOString();
        const chatEntry = {
            ...chatData,
            timestamp
        };

        await redis.lpush(`chat:${sessionId}`, JSON.stringify(chatEntry));
        
        await redis.ltrim(`chat:${sessionId}`, 0, 49);

        return chatEntry;
    } catch (error) {
        console.error('Error saving chat history:', error);
        throw error;
    }
};

export const getChatHistory = async (sessionId, limit = 10) => {
    try {
        const history = await redis.lrange(`chat:${sessionId}`, 0, limit - 1);
        return history.map(entry => JSON.parse(entry));
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};