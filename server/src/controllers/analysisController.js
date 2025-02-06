// src/controllers/analysisController.js
import { configDotenv } from "dotenv";
import { ChatAnthropic } from "@langchain/anthropic";
import { extractTicker } from "../services/analysis/tickerExtractor.js";
import analyzeQuestion from "../services/analysis/questionAnalyzer.js";
import { fetchRequiredData } from "../services/analysis/metricsMapper.js";
import { generateAnalysisResponse, generateConversationResponse } from "../services/analysis/responseGenerator.js";
import { chatService } from '../services/chat/chatService.js';

configDotenv();

const model = new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-haiku-20240307",
    maxTokens: 1000,
    temperature: 0
});

export const analyzeStock = async (req, res) => {
    try {
        const { query, chatId } = req.body;
        const userId = req.user.id;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        // Get or create chat and get chat history
        let chat;
        let chatHistory = [];
        try {
            if (chatId) {
                chat = await chatService.getChat(userId, chatId);
                if (!chat) {
                    return res.status(404).json({
                        success: false,
                        error: 'Chat not found'
                    });
                }
                chatHistory = chat.messages;
            } else {
                chat = await chatService.createChat(userId, 'New Stock Analysis');
            }

            // Save user's query
            await chatService.addMessage(userId, chat.id, {
                role: 'user',
                content: query
            });
        } catch (error) {
            console.error('Chat service error:', error);
        }

        let responseData = {};
        let analysisResponse;

        // Try to extract ticker first
        const tickerInfo = await extractTicker(model, query);

        // If we have a ticker, do stock analysis
        if (tickerInfo.ticker) {
            const questionAnalysis = await analyzeQuestion(model, query);
            const questionAnalysisObj = JSON.parse(questionAnalysis);

            const stockData = await fetchRequiredData(
                tickerInfo.ticker,
                questionAnalysisObj.category,
                questionAnalysisObj.specificMetrics,
                questionAnalysisObj.timeframe
            );

            let comparisonData = null;
            if (questionAnalysisObj.category === 'COMPARISON' && questionAnalysisObj.comparisonTickers) {
                comparisonData = await Promise.all(
                    questionAnalysisObj.comparisonTickers.map(async (ticker) => {
                        if (ticker !== tickerInfo.ticker) {
                            return await fetchRequiredData(
                                ticker,
                                questionAnalysisObj.category,
                                questionAnalysisObj.specificMetrics,
                                questionAnalysisObj.timeframe
                            );
                        }
                    })
                );
            }

            analysisResponse = await generateAnalysisResponse(model, {
                query,
                category: questionAnalysisObj.category,
                timeframe: questionAnalysisObj.timeframe,
                stockData,
                comparisonData,
                chatHistory
            });

            responseData = {
                query,
                ticker: tickerInfo.ticker,
                analysis: questionAnalysisObj,
                stockData,
                comparisonData,
                llmResponse: analysisResponse
            };
        } else {
            // If no ticker found, just have a conversation with context
            analysisResponse = await generateConversationResponse(model, query, chatHistory);
            responseData = {
                query,
                llmResponse: analysisResponse
            };
        }

        // Save AI response to chat
        try {
            if (chat) {
                await chatService.addMessage(userId, chat.id, {
                    role: 'assistant',
                    content: analysisResponse.content,
                    data: responseData
                });

                // Update chat title if it's new and we have a ticker
                if (!chatId && tickerInfo?.ticker) {
                    await chatService.updateChatTitle(userId, chat.id, `${tickerInfo.ticker} Analysis`);
                }
            }
        } catch (error) {
            console.error('Error saving chat:', error);
        }

        res.json({
            success: true,
            data: {
                chat,
                ...responseData
            }
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error analyzing stock query'
        });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await chatService.getUserChats(userId);

        res.json({
            success: true,
            data: chats
        });
    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting chat history'
        });
    }
};

export const getChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chat = await chatService.getChat(userId, chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found'
            });
        }

        res.json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error getting chat:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting chat'
        });
    }
};