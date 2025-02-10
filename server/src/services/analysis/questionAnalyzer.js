import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const questionTemplate = ChatPromptTemplate.fromMessages([
    ["system", `You are a financial analysis assistant specialized in categorizing user questions about stocks. Your task is to identify the type of analysis the user is requesting and extract relevant details.`],
    ["user", `Analyze the following query about a stock: {query}

Identify the type of information the user is seeking. Categories include:
1. **PERFORMANCE** - General performance questions (e.g., "How is Tesla doing?", "What's happening with AAPL?")
2. **VALUATION** - Questions about stock valuation (e.g., "Is MSFT overvalued?", "Is Apple cheap right now?")
3. **RECOMMENDATION** - Direct buy/sell advice (e.g., "Should I buy NVDA?", "Is it time to sell Tesla?")
4. **COMPARISON** - Comparing multiple stocks (e.g., "Which is better, AAPL or MSFT?")
5. **FUNDAMENTALS** - Questions about company financials (e.g., "What's Tesla's profit margin?", "How much revenue does AAPL make?")

The strict options to choose for "category" are PERFORMANCE, VALUATION, RECOMMENDATION, COMPARISON, FUNDAMENTALS.

The strict options to choose for "specificMetrics" are:
// Financial Performance
"revenue",
"net_income",
"operating_income",
"ebitda",
"fcf",
"gross_margin",
"operating_margin",
"profit_margin",

// Valuation
"pe_ratio",
"market_cap",
"ev",
"ps_ratio",
"pb_ratio",
"ev_ebitda",
"dividend_yield",

// Growth Metrics
"revenue_growth",
"eps_growth",
"debt_equity",
"roa",
"roe",
"asset_turnover",
"inventory_turnover",

// Trading & Performance
"stock_price",
"ytd_performance",
"volume",
"beta",
"short_ratio",
"moving_avg_50",
"moving_avg_200",
"rsi"

The strict options for timeframe are YTD, MTD, QTD, 1Y, ALL, CURRENT.

Provide your analysis in the following JSON structure as key-value pairs and ONLY choose from the listed options:

    "category": "PERFORMANCE | VALUATION | RECOMMENDATION | COMPARISON | FUNDAMENTALS",
    "specificMetrics": ["pe_ratio", "revenue_growth", "profit_margin", "stock_price", "ytd_performance"],
    "timeframe": "YTD | MTD | QTD | 1Y | ALL | CURRENT", // Specify the timeframe if applicable
    "comparisonTickers": ["AAPL", "MSFT"]
    `]
]);

const analyzeQuestion = async (model, query) => {
    try {
        // const chain = questionTemplate.pipe(model).pipe(new JsonOutputParser());
        const chain = questionTemplate.pipe(model)
        const analysis = await chain.invoke({
            query: query
        });


        let analysisObj = ""
        let objStart = false

        for (let i = 0; i < analysis.content.length; i++) {
            let currWord = analysis.content[i]

            if (objStart) {
                analysisObj += currWord
            }

            if (currWord === "{") {
                objStart = true
                analysisObj += "{"
                continue

            } else if (currWord === "}") {
                break
            }
        }


        return analysisObj

    } catch (error) {
        console.error('Error in question analysis:', error);
        throw error;
    }
};

export default analyzeQuestion;