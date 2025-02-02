// src/services/analysis/responseGenerator.js
import { ChatPromptTemplate } from "@langchain/core/prompts";

const responseTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a professional stock analyst assistant. Your task is to analyze stock data and provide clear, insightful responses.
    Always maintain a balanced view, considering both positive and negative factors.
    Format numbers appropriately (use % for percentages, $ for prices, B/M for market cap).
    
    Your response must follow this EXACT structure with these EXACT section headers:

    1. QUICK OVERVIEW
    Start with a one-sentence summary of the stock's current state.

    2. PRICE ANALYSIS
    - Current price and daily change
    - YTD performance
    - Key price levels and trends

    3. FUNDAMENTAL METRICS
    - Market capitalization
    - P/E ratio comparison
    - Profit margins
    - Growth metrics

    4. KEY TAKEAWAYS
    List 3-4 bullet points of the most important insights.

    5. RISK FACTORS
    List 2-3 potential risks or concerns.

    Make sure each section is clearly separated and maintains this exact order.`],
    ["user", `Analyze this stock data and provide insights:

Stock Information:
{stockData}

User Query: {query}
Analysis Type: {category}
Timeframe: {timeframe}

${`{comparisonData}`}

Remember to maintain the exact section structure specified in the system prompt.`]
]);

export const generateAnalysisResponse = async (model, {
    query,
    category,
    timeframe,
    stockData,
    comparisonData = null
}) => {
    try {
        // Format the stock data for better prompting
        const formattedStockData = JSON.stringify(stockData, null, 2);
        const formattedComparisonData = comparisonData ? JSON.stringify(comparisonData, null, 2) : "No comparison data";

        const chain = responseTemplate;
        
        const response = await chain.pipe(model).invoke({
            query,
            category,
            timeframe,
            stockData: formattedStockData,
            comparisonData: formattedComparisonData
        });

        return response;
    } catch (error) {
        console.error('Error generating analysis response:', error);
        throw error;
    }
};