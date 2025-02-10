import yahooFinance from 'yahoo-finance2';

yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

// Get current price and basic info
export const getCurrentPriceData = async (symbol, timeframe = 'CURRENT') => {
    try {
        const quote = await yahooFinance.quote(symbol);

        // If timeframe is CURRENT, return only current data
        if (timeframe === 'CURRENT') {
            return {
                currentPrice: quote.regularMarketPrice,
                priceChange: quote.regularMarketChange,
                priceChangePercent: quote.regularMarketChangePercent,
                volume: quote.regularMarketVolume,
                marketCap: quote.marketCap,
                fiftyDayAverage: quote.fiftyDayAverage,
                twoHundredDayAverage: quote.twoHundredDayAverage,
                dayHigh: quote.regularMarketDayHigh,
                dayLow: quote.regularMarketDayLow,
                previousClose: quote.regularMarketPreviousClose
            };
        }

        // For other timeframes, get historical data for price change calculation
        const historicalData = await getHistoricalPrices(symbol, timeframe);
        return {
            ...historicalData,
            currentPrice: quote.regularMarketPrice,
            fiftyDayAverage: quote.fiftyDayAverage,
            twoHundredDayAverage: quote.twoHundredDayAverage,
            dayHigh: quote.regularMarketDayHigh,
            dayLow: quote.regularMarketDayLow,
            volume: quote.regularMarketVolume,
            marketCap: quote.marketCap
        };
    } catch (error) {
        console.error(`Error fetching current price for ${symbol}:`, error);
        throw error;
    }
};

// Get fundamentals and company info (no timeframe needed)
export const getCompanyOverview = async (symbol) => {
    try {
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'assetProfile', 'financialData']
        });

        return {
            peRatio: quoteSummary.summaryDetail.forwardPE,
            marketCap: quoteSummary.summaryDetail.marketCap,
            beta: quoteSummary.summaryDetail.beta,
            dividendYield: quoteSummary.summaryDetail.dividendYield,
            sector: quoteSummary.assetProfile.sector,
            industry: quoteSummary.assetProfile.industry,
            priceToBook: quoteSummary.defaultKeyStatistics.priceToBook,
            profitMargins: quoteSummary.defaultKeyStatistics.profitMargins,
            returnOnEquity: quoteSummary.financialData.returnOnEquity,
            quickRatio: quoteSummary.financialData.quickRatio,
            currentRatio: quoteSummary.financialData.currentRatio,
            debtToEquity: quoteSummary.financialData.debtToEquity,
            revenueGrowth: quoteSummary.financialData.revenueGrowth,
            grossMargins: quoteSummary.financialData.grossMargins,
            earningsGrowth: quoteSummary.financialData.earningsGrowth,
            operatingMargins: quoteSummary.financialData.operatingMargins
        };
    } catch (error) {
        console.error(`Error fetching overview for ${symbol}:`, error);
        throw error;
    }
};

// Get historical prices for performance calculation
export const getHistoricalPrices = async (symbol, timeframe = 'YTD') => {
    try {
        if (timeframe === 'CURRENT') {
            return {};  // Return empty object for current timeframe
        }

        // Calculate period1 based on timeframe
        let period1;
        const now = new Date();

        switch (timeframe) {
            case 'YTD':
                period1 = new Date(now.getFullYear(), 0, 1);
                break;
            case 'MTD':
                period1 = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'QTD':
                const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
                period1 = new Date(now.getFullYear(), quarterMonth, 1);
                break;
            case '1Y':
                period1 = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case 'ALL':
                period1 = new Date('2000-01-01');
                break;
            default:
                period1 = new Date(now.getFullYear(), 0, 1); // Default to YTD
        }

        const result = await yahooFinance.chart(symbol, {
            period1: period1.toISOString().split('T')[0],
            period2: new Date().toISOString().split('T')[0],
            interval: '1d'
        });

        if (!result.quotes || result.quotes.length === 0) {
            throw new Error('No historical data available');
        }

        // Calculate performances
        const currentPrice = result.quotes[result.quotes.length - 1].close;
        const startPrice = result.quotes[0].close;
        const performancePercent = ((currentPrice - startPrice) / startPrice) * 100;

        // Calculate moving averages
        const calculateMA = (period) => {
            const prices = result.quotes.slice(-period).map(q => q.close);
            return prices.reduce((a, b) => a + b, 0) / period;
        };

        return {
            prices: result.quotes,
            periodPerformance: performancePercent,
            timeframe: timeframe,
            movingAverage50: calculateMA(50),
            movingAverage200: calculateMA(200),
            data: result.quotes.map(day => ({
                date: day.date,
                close: day.close,
                volume: day.volume,
                high: day.high,
                low: day.low
            }))
        };
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
};

// Get earnings data (no timeframe needed)
export const getEarningsData = async (symbol) => {
    try {
        const earnings = await yahooFinance.quoteSummary(symbol, {
            modules: ['earnings', 'earningsHistory', 'earningsTrend']
        });

        return {
            earningsPerShare: earnings.earnings.earningsChart,
            earningsHistory: earnings.earningsHistory.history,
            earningsTrend: earnings.earningsTrend.trend
        };
    } catch (error) {
        console.error(`Error fetching earnings data for ${symbol}:`, error);
        throw error;
    }
};

// Get recommendations (no timeframe needed)
export const getAnalystRecommendations = async (symbol) => {
    try {
        const recommendations = await yahooFinance.recommendationsBySymbol(symbol);
        return recommendations;
    } catch (error) {
        console.error(`Error fetching recommendations for ${symbol}:`, error);
        throw error;
    }
};

// Get valuation metrics (no timeframe needed)
export const getValuationMetrics = async (symbol) => {
    try {
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'price']
        });

        return {
            peRatio: quoteSummary.summaryDetail.forwardPE,
            pbRatio: quoteSummary.defaultKeyStatistics.priceToBook,
            psRatio: quoteSummary.summaryDetail.priceToSalesTrailing12Months,
            evToEbitda: quoteSummary.defaultKeyStatistics.enterpriseToEbitda,
            enterpriseValue: quoteSummary.defaultKeyStatistics.enterpriseValue,
            dividendYield: quoteSummary.summaryDetail.dividendYield
                ? (quoteSummary.summaryDetail.dividendYield * 100).toFixed(2)
                : 0
        };
    } catch (error) {
        console.error(`Error fetching valuation metrics for ${symbol}:`, error);
        throw error;
    }
};

// Get financial statements data (no timeframe needed)
export const getFinancialStatements = async (symbol) => {
    try {
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
            modules: ['financialData', 'incomeStatementHistory', 'cashflowStatementHistory']
        });

        const financials = quoteSummary.financialData;
        const income = quoteSummary.incomeStatementHistory.incomeStatementHistory[0];
        const cashflow = quoteSummary.cashflowStatementHistory.cashflowStatements[0];

        return {
            revenue: income.totalRevenue,
            netIncome: income.netIncome,
            operatingIncome: income.operatingIncome,
            ebitda: financials.ebitda,
            freeCashFlow: cashflow.freeCashFlow,
            totalCash: financials.totalCash,
            totalDebt: financials.totalDebt,
            operatingCashFlow: cashflow.operatingCashFlow
        };
    } catch (error) {
        console.error(`Error fetching financial statements for ${symbol}:`, error);
        throw error;
    }
};

// Get financial ratios (no timeframe needed)
export const getFinancialRatios = async (symbol) => {
    try {
        const quoteSummary = await yahooFinance.quoteSummary(symbol, {
            modules: ['financialData', 'defaultKeyStatistics']
        });

        const financials = quoteSummary.financialData;
        const keyStats = quoteSummary.defaultKeyStatistics;

        return {
            grossMargin: financials.grossMargins
                ? (financials.grossMargins * 100).toFixed(2)
                : null,
            operatingMargin: financials.operatingMargins
                ? (financials.operatingMargins * 100).toFixed(2)
                : null,
            profitMargin: financials.profitMargins
                ? (financials.profitMargins * 100).toFixed(2)
                : null,
            revenueGrowth: financials.revenueGrowth
                ? (financials.revenueGrowth * 100).toFixed(2)
                : null,
            earningsGrowth: financials.earningsGrowth
                ? (financials.earningsGrowth * 100).toFixed(2)
                : null,
            debtToEquity: financials.debtToEquity,
            returnOnAssets: financials.returnOnAssets
                ? (financials.returnOnAssets * 100).toFixed(2)
                : null,
            returnOnEquity: financials.returnOnEquity
                ? (financials.returnOnEquity * 100).toFixed(2)
                : null,
            assetTurnover: keyStats.assetTurnover,
            inventoryTurnover: keyStats.inventoryTurnover,
            shortRatio: keyStats.shortRatio
        };
    } catch (error) {
        console.error(`Error fetching financial ratios for ${symbol}:`, error);
        throw error;
    }
};

// Main function to fetch all required data
export const fetchStockData = async (symbol, metrics = [], timeframe = 'CURRENT') => {
    const result = {};

    try {
        // Only fetch what's needed
        const promises = [];
        const functionCalls = new Set();

        if (metrics.includes('stock_price') ||
            metrics.includes('volume') ||
            metrics.includes('day_change')) {
            promises.push(getCurrentPriceData(symbol, timeframe));
            functionCalls.add('price');
        }

        if (metrics.includes('pe_ratio') ||
            metrics.includes('market_cap') ||
            metrics.includes('profit_margins') ||
            metrics.includes('revenue_growth')) {
            promises.push(getCompanyOverview(symbol));
            functionCalls.add('overview');
        }

        if (metrics.includes('ytd_performance') ||
            metrics.includes('mtd_performance') ||
            metrics.includes('historical_prices')) {
            promises.push(getHistoricalPrices(symbol, timeframe));
            functionCalls.add('performance');
        }

        if (metrics.includes('earnings') ||
            metrics.includes('eps_trend')) {
            promises.push(getEarningsData(symbol));
            functionCalls.add('earnings');
        }

        if (metrics.includes('analyst_recommendations')) {
            promises.push(getAnalystRecommendations(symbol));
            functionCalls.add('recommendations');
        }

        const results = await Promise.all(promises);

        // Map results back to their categories
        const functionArray = Array.from(functionCalls);
        results.forEach((data, index) => {
            result[functionArray[index]] = data;
        });

        return {
            ...result,
            timeframe
        };
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        throw error;
    }
};