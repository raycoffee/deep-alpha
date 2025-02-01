// src/controllers/analysisController.js
import { configDotenv } from "dotenv";
import { ChatAnthropic } from "@langchain/anthropic";
import { extractTicker } from "../services/analysis/tickerExtractor.js";
import analyzeQuestion from "../services/analysis/questionAnalyzer.js";
import { fetchRequiredData } from "../services/analysis/metricsMapper.js";
import { generateAnalysisResponse } from "../services/analysis/responseGenerator.js";
import { saveChatHistory, getChatHistory } from "../services/upstash/chatHistory.js";

configDotenv();

const model = new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-haiku-20240307",
    maxTokens: 1000,
    temperature: 0
});

export const analyzeStock = async (req, res) => {
    try {
        const { query, sessionId } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        // Step 1: Extract ticker
        const tickerInfo = await extractTicker(model, query);
        if (!tickerInfo.ticker) {
            return res.status(400).json({
                success: false,
                error: 'No stock ticker found in query'
            });
        }

        // Step 2: Analyze question
        const questionAnalysis = await analyzeQuestion(model, query);

        
        // Step 3: Fetch stock data
        const stockData = await fetchRequiredData(
            tickerInfo.ticker,
            questionAnalysis.category,
            questionAnalysis.specificMetrics,
            questionAnalysis.timeframe
        );

        // Step 4: Handle comparison if needed
        let comparisonData = null;
        if (questionAnalysis.category === 'COMPARISON' && questionAnalysis.comparisonTickers) {
            comparisonData = await Promise.all(
                questionAnalysis.comparisonTickers.map(async (ticker) => {
                    if (ticker !== tickerInfo.ticker) {
                        return await fetchRequiredData(
                            ticker,
                            questionAnalysis.category,
                            questionAnalysis.specificMetrics,
                            questionAnalysis.timeframe
                        );
                    }
                })
            );
        }

        // Step 5: Generate LLM analysis
        const analysisResponse = await generateAnalysisResponse(model, {
            query,
            category: questionAnalysis.category,
            timeframe: questionAnalysis.timeframe,
            stockData,
            comparisonData
        });

        // Step 6: Prepare final response
        const response = {
            success: true,
            data: {
                query,
                ticker: tickerInfo.ticker,
                analysis: questionAnalysis,
                stockData,
                comparisonData,
                llmResponse: analysisResponse
            }
        };

        // Step 7: Save to chat history
        if (sessionId) {
            await saveChatHistory(sessionId, {
                query,
                response: response.data,
                timestamp: new Date()
            });
        }

        res.json(response);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error analyzing stock query'
        });
    }
};

export const getChatHistoryHandler = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = await getChatHistory(sessionId);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error fetching chat history'
        });
    }
};