import { getCurrentPriceData, getCompanyOverview, getHistoricalPrices, getAnalystRecommendations, getValuationMetrics, getFinancialStatements, getFinancialRatios } from '../yahoo/stockData.js';

// Map categories to required metrics (remains the same)
const categoryMetricsMap = {
    PERFORMANCE: [
        'stock_price',
        'ytd_performance',
        'price_change',
        'volume',
        'market_cap',
        'beta',
        'rsi',
        'moving_avg_50',
        'moving_avg_200'
    ],
    VALUATION: [
        'pe_ratio',
        'pb_ratio',
        'ps_ratio',
        'ev_ebitda',
        'market_cap',
        'ev',
        'beta',
        'dividend_yield'
    ],
    RECOMMENDATION: [
        'analyst_recommendations',
        'pe_ratio',
        'ytd_performance',
        'moving_avg_50',
        'moving_avg_200',
        'rsi',
        'volume',
        'short_ratio'
    ],
    FUNDAMENTALS: [
        'revenue',
        'net_income',
        'operating_income',
        'ebitda',
        'fcf',
        'gross_margin',
        'operating_margin',
        'profit_margin',
        'revenue_growth',
        'eps_growth',
        'debt_equity',
        'roa',
        'roe',
        'asset_turnover',
        'inventory_turnover',
        'sector',
        'industry'
    ],
    COMPARISON: [
        'pe_ratio',
        'market_cap',
        'ytd_performance',
        'profit_margin',
        'revenue_growth',
        'eps_growth',
        'dividend_yield',
        'beta'
    ]
};

// Define which metrics require historical data
const timeframeDependentMetrics = new Set([
    'ytd_performance',
    'mtd_performance',
    'qtd_performance',
    'one_year_performance',
    'price_change',
    'volume_trend',
    'moving_avg_50',
    'moving_avg_200'
]);

// Map metrics to functions with timeframe handling
const metricToFunctionMap = {
    // Current Price Data (no timeframe needed)
    'stock_price': (symbol) => getCurrentPriceData(symbol),
    'volume': (symbol) => getCurrentPriceData(symbol),
    'rsi': (symbol) => getCurrentPriceData(symbol),

    // Company Overview - Basic Info (no timeframe needed)
    'sector': (symbol) => getCompanyOverview(symbol),
    'industry': (symbol) => getCompanyOverview(symbol),
    'market_cap': (symbol) => getCompanyOverview(symbol),
    'beta': (symbol) => getCompanyOverview(symbol),

    // Valuation Metrics (no timeframe needed)
    'pe_ratio': (symbol) => getValuationMetrics(symbol),
    'pb_ratio': (symbol) => getValuationMetrics(symbol),
    'ps_ratio': (symbol) => getValuationMetrics(symbol),
    'ev_ebitda': (symbol) => getValuationMetrics(symbol),
    'ev': (symbol) => getValuationMetrics(symbol),
    'dividend_yield': (symbol) => getValuationMetrics(symbol),

    // Financial Statements (no timeframe needed)
    'revenue': (symbol) => getFinancialStatements(symbol),
    'net_income': (symbol) => getFinancialStatements(symbol),
    'operating_income': (symbol) => getFinancialStatements(symbol),
    'ebitda': (symbol) => getFinancialStatements(symbol),
    'fcf': (symbol) => getFinancialStatements(symbol),

    // Financial Ratios (no timeframe needed)
    'gross_margin': (symbol) => getFinancialRatios(symbol),
    'operating_margin': (symbol) => getFinancialRatios(symbol),
    'profit_margin': (symbol) => getFinancialRatios(symbol),
    'revenue_growth': (symbol) => getFinancialRatios(symbol),
    'eps_growth': (symbol) => getFinancialRatios(symbol),
    'debt_equity': (symbol) => getFinancialRatios(symbol),
    'roa': (symbol) => getFinancialRatios(symbol),
    'roe': (symbol) => getFinancialRatios(symbol),
    'asset_turnover': (symbol) => getFinancialRatios(symbol),
    'inventory_turnover': (symbol) => getFinancialRatios(symbol),
    'short_ratio': (symbol) => getFinancialRatios(symbol),

    // Historical Performance (timeframe required)
    'ytd_performance': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe || 'YTD'),
    'mtd_performance': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe || 'MTD'),
    'qtd_performance': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe || 'QTD'),
    'one_year_performance': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe || '1Y'),
    'price_change': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe),
    'moving_avg_50': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe),
    'moving_avg_200': (symbol, timeframe) => getHistoricalPrices(symbol, timeframe),

    // Analyst Data (no timeframe needed)
    'analyst_recommendations': (symbol) => getAnalystRecommendations(symbol)
};

// Helper to check if a metric needs timeframe
const isTimeframeDependent = (metric) => timeframeDependentMetrics.has(metric);

export const getRequiredFunctions = (metrics) => {
    const uniqueFunctions = new Set();
    metrics.forEach(metric => {
        const func = metricToFunctionMap[metric];
        if (func) uniqueFunctions.add(func);
    });
    return Array.from(uniqueFunctions);
};

export const getDefaultMetrics = (category) => {
    return categoryMetricsMap[category] || [];
};

export const fetchRequiredData = async (symbol, category, specificMetrics = [], timeframe = 'CURRENT') => {
    const defaultMetrics = getDefaultMetrics(category);
    const allMetrics = [...new Set([...defaultMetrics, ...specificMetrics])];

    try {
        // Group metrics by their functions to avoid duplicate calls
        const metricsByFunction = new Map();
        
        allMetrics.forEach(metric => {
            const func = metricToFunctionMap[metric];
            if (func) {
                if (!metricsByFunction.has(func)) {
                    metricsByFunction.set(func, []);
                }
                metricsByFunction.get(func).push(metric);
            }
        });

        // Execute functions with appropriate timeframe parameter
        const results = await Promise.all(
            Array.from(metricsByFunction.entries()).map(([func, metrics]) => {
                // Check if any of the metrics in this group need timeframe
                const needsTimeframe = metrics.some(isTimeframeDependent);
                return func(symbol, needsTimeframe ? timeframe : undefined);
            })
        );

        // Combine all results
        const combinedData = results.reduce((acc, result) => ({ ...acc, ...result }), {});

        return {
            metrics: allMetrics,
            data: combinedData,
            timeframe: timeframe
        };
    } catch (error) {
        console.error(`Error fetching required data for ${symbol}:`, error);
        throw error;
    }
};