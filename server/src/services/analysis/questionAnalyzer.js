
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const questionTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a financial analysis assistant that categorizes user questions about stocks.
Your task is to identify what type of analysis the user is requesting.`],
    ["user", `Analyze this query about a stock: {query}

Identify what information the user is seeking. Common categories include:
1. PERFORMANCE - General performance questions ("How is Tesla doing?", "What's happening with AAPL?")
2. VALUATION - Questions about whether the stock is fairly valued ("Is MSFT overvalued?", "Is Apple cheap right now?")
3. RECOMMENDATION - Direct questions about buying/selling ("Should I buy NVDA?", "Is it time to sell Tesla?")
4. COMPARISON - Comparing stocks ("Which is better, AAPL or MSFT?")
5. FUNDAMENTALS - Questions about company financials ("What's Tesla's profit margin?", "How much revenue does AAPL make?")

Return your analysis in this JSON structure:

    "category": "PERFORMANCE | VALUATION | RECOMMENDATION | COMPARISON | FUNDAMENTALS",
    "specificMetrics": ["pe_ratio", "revenue_growth", "profit_margin", "stock_price", "ytd_performance", etc],
    "timeframe": "YTD | MTD | QTD | 1Y | ALL | CURRENT",
    "comparisonTickers": ["AAPL", "MSFT"] // only for COMPARISON category
`]
]);

const analyzeQuestion = async (model, query) => {
    try {
        const chain = questionTemplate.pipe(model).pipe(new JsonOutputParser());
        
        const analysis = await chain.invoke({
            query: query
        });

        return analysis;
    } catch (error) {
        console.error('Error in question analysis:', error);
        throw error;
    }
};

export default analyzeQuestion;