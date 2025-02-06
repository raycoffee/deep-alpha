// src/services/chatService.js
import { Redis } from '@upstash/redis'
import { configDotenv } from "dotenv";

configDotenv();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export const chatService = {

  async createChat(userId, title) {
    const chatId = Date.now().toString();
    const chat = {
      id: chatId,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add chat to user's chat list
    await redis.hset(`user:${userId}:chats`, {
      [chatId]: JSON.stringify(chat)
    });

    return chat;
  },

  // Get all chats for a user
  async getUserChats(userId) {
    const chats = await redis.hgetall(`user:${userId}:chats`);
    return Object.values(chats || {}).map(chat => chat)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // Get a specific chat
  async getChat(userId, chatId) {
    const chat = await redis.hget(`user:${userId}:chats`, chatId);
    return chat ? chat : null;
  },

  // Add a message to a chat
  async addMessage(userId, chatId, message) {
    const chat = await this.getChat(userId, chatId);
    if (!chat) throw new Error('Chat not found');

    chat.messages.push({
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    });
    chat.updatedAt = new Date().toISOString();

    await redis.hset(`user:${userId}:chats`, {
      [chatId]: JSON.stringify(chat)
    });

    return chat;
  },

  // Update chat title
  async updateChatTitle(userId, chatId, title) {
    const chat = await this.getChat(userId, chatId);
    if (!chat) throw new Error('Chat not found');

    chat.title = title;
    chat.updatedAt = new Date().toISOString();

    await redis.hset(`user:${userId}:chats`, {
      [chatId]: JSON.stringify(chat)
    });

    return chat;
  },

  // Delete a chat
  async deleteChat(userId, chatId) {
    await redis.hdel(`user:${userId}:chats`, chatId);
    return true;
  },

  // Get chat history for context
  async getChatHistory(userId, chatId) {
    const chat = await this.getChat(userId, chatId);
    if (!chat) throw new Error('Chat not found');

    return chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      // Include any additional data you want to send to Anthropic
      data: msg.data
    }));
  }
};