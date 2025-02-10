// src/services/analysis/responseGenerator.js
import { ChatPromptTemplate } from "@langchain/core/prompts";

const responseTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a professional stock analyst assistant. Your task is to analyze stock data and provide clear, insightful responses.
    Always maintain a balanced view, considering both positive and negative factors.
    Format numbers appropriately (use % for percentages, $ for prices, B/M for market cap).
    
    When data points are missing:
    - Skip any sections where all relevant data is unavailable
    - Within sections, only include metrics that have actual data
    - Never use placeholder values or estimates for missing data
    - Don't mention that data is missing; simply focus on available information
    
    Your response must follow this structure, including only sections with available data:

    1. QUICK OVERVIEW
    Start with a one-sentence summary focusing on available data points.

    2. PRICE ANALYSIS
    (Include only if price data is available, if not then skip this section and don't mention it.)
    - Current price and daily change
    - YTD performance (if available)
    - Key price levels and trends

    3. FUNDAMENTAL METRICS
    (Include only if fundamental data is available, if not then skip this section and don't mention it.)
    - Market capitalization
    - P/E ratio comparison
    - Profit margins
    - Growth metrics

    4. KEY TAKEAWAYS
    List 3-4 bullet points based on available data only.

    5. RISK FACTORS
    List 2-3 potential risks or concerns based on available information.

    Maintain this exact order for any included sections.`],
    ["user", `Analyze this stock data and provide insights:

Stock Information:
{stockData}

User Query: {query}
Analysis Type: {category}
Timeframe: {timeframe}

${`{comparisonData}`}

Focus only on available data points while maintaining the specified section structure.`]
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

export const generateConversationResponse = async (model, query, chatHistory) => {
    const template = ChatPromptTemplate.fromMessages([
        ["system", `You are a financial analysis assistant having a conversation about stocks.
Use the chat history for context to provide helpful, informed responses.`],
        ["user", `Previous conversation:
{history}

Current query: {query}

Provide a helpful response based on the context of the conversation.`]
    ]);

    const chain = template.pipe(model);
    
    const response = await chain.invoke({
        query,
        history: chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    });

    return response;
};