// src/services/analysis/metricsMapper.js
import { getCurrentPriceData, getCompanyOverview, getHistoricalPrices, getAnalystRecommendations } from '../yahoo/stockData.js';

// Map categories to required metrics
const categoryMetricsMap = {
    PERFORMANCE: [
        'stock_price',
        'ytd_performance',
        'price_change',
        'volume',
        'market_cap'
    ],
    VALUATION: [
        'pe_ratio',
        'price_to_book',
        'market_cap',
        'beta'
    ],
    RECOMMENDATION: [
        'analyst_recommendations',
        'pe_ratio',
        'ytd_performance',
        'fifty_day_avg',
        'two_hundred_day_avg'
    ],
    FUNDAMENTALS: [
        'profit_margins',
        'revenue_growth',
        'market_cap',
        'sector',
        'industry'
    ],
    COMPARISON: [
        'pe_ratio',
        'market_cap',
        'ytd_performance',
        'profit_margins'
    ]
};

// Map metrics to Yahoo Finance functions
const metricToFunctionMap = {
    'stock_price': getCurrentPriceData,
    'price_change': getCurrentPriceData,
    'volume': getCurrentPriceData,
    'fifty_day_avg': getCurrentPriceData,
    'two_hundred_day_avg': getCurrentPriceData,
    
    'pe_ratio': getCompanyOverview,
    'price_to_book': getCompanyOverview,
    'market_cap': getCompanyOverview,
    'beta': getCompanyOverview,
    'sector': getCompanyOverview,
    'industry': getCompanyOverview,
    'profit_margins': getCompanyOverview,
    
    'ytd_performance': getHistoricalPrices,
    'mtd_performance': getHistoricalPrices,
    
    'analyst_recommendations': getAnalystRecommendations
};

// Function to get required functions based on metrics
export const getRequiredFunctions = (metrics) => {
    const uniqueFunctions = new Set();
    metrics.forEach(metric => {
        const func = metricToFunctionMap[metric];
        if (func) uniqueFunctions.add(func);
    });
    return Array.from(uniqueFunctions);
};

// Function to get default metrics for a category
export const getDefaultMetrics = (category) => {
    return categoryMetricsMap[category] || [];
};

// Main function to fetch all required data
export const fetchRequiredData = async (symbol, category, specificMetrics = [], timeframe = 'CURRENT') => {
    // Combine default metrics with specific metrics
    const defaultMetrics = getDefaultMetrics(category);
    const allMetrics = [...new Set([...defaultMetrics, ...specificMetrics])];
    
    // Get all required functions
    const requiredFunctions = getRequiredFunctions(allMetrics);
    
    try {
        // Execute all required functions
        const results = await Promise.all(
            requiredFunctions.map(func => func(symbol))
        );
        
        // Combine results
        const combinedData = results.reduce((acc, result) => ({...acc, ...result}), {});
        
        return {
            metrics: allMetrics,
            data: combinedData
        };
    } catch (error) {
        console.error(`Error fetching required data for ${symbol}:`, error);
        throw error;
    }
};