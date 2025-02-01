// src/services/analysis/responseGenerator.js
import { ChatPromptTemplate } from "@langchain/core/prompts";

const responseTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a professional stock analyst assistant. Your task is to analyze stock data and provide clear, insightful responses.
    Always maintain a balanced view, considering both positive and negative factors.
    Format numbers appropriately (use % for percentages, $ for prices, B/M for market cap).`],
    ["user", `Based on the following data, provide a comprehensive analysis of {query}

Stock Information:
{stockData}

Analysis Type: {category}
Timeframe: {timeframe}

${

  `{comparisonData}`
}

Provide a clear, detailed response that:
1. Directly answers the user's question
2. Highlights key metrics and their significance
3. Provides context for the numbers
4. Includes relevant trends
5. Mentions any important caveats or considerations`]
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