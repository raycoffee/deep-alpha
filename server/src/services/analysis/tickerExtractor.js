import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const extractionTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a financial analysis assistant that extracts stock ticker symbols from user queries.
Your task is to identify company names and their corresponding ticker symbols.
Always return your response in valid JSON format.`],
    ["user", `Extract the stock ticker from this query: {query}

Instructions:
1. Identify any company names or stock tickers in the query
2. Return the standardized stock ticker(s)
3. If no valid ticker is found, return null
4. If a company name is mentioned without a ticker, convert it to its ticker (e.g., "Apple" → "AAPL")

Return your response in this structure (but as valid JSON) -> ticker: "AAPL"
`]
]);

export const extractTicker = async (model, query) => {
    try {
        const chain = extractionTemplate.pipe(model).pipe(new JsonOutputParser());
        
        const response = await chain.invoke({
            query: query
        });

        return response;
    } catch (error) {
        console.error('Error in ticker extraction:', error);
        throw error;
    }
};