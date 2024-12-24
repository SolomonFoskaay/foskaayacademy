// /components/donor/ATH-Crypto-Price-Prediction/DonorFFGradeIndex.tsx 
import { useState, useEffect } from 'react';
import { calculateFoskaayFibLevels, FoskaayFibResult } from '@/utils/formulars/FoskaayFibV1';
import { cryptoSymbols } from './DonorATHCryptoList';

interface HistoricalDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    marketCap: number;
}

interface FFGradeResult {
    symbol: string;
    foskaayFibResults: FoskaayFibResult;
}

// Track total number of api calls made for optimization when needed
// Add counter outside component to persist between renders
let apiCallCount = 0;

export function useDonorFFGrades() {
    const [ffGrades, setFFGrades] = useState<Record<string, FFGradeResult>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset counter at start of each useEffect
        apiCallCount = 0;

        // Make API Calls
        const fetchHistoricalData = async (symbol: string) => {
            try {
                // Track api calls
                apiCallCount++;
                console.log(`API Call #${apiCallCount} for ${symbol}`);

                // 🔍 ANALYSIS: Currently making one API call per symbol
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);
                if (!response.ok) throw new Error(`Failed to fetch ${symbol} data`);

                const data = await response.json();
                if (!data.success) throw new Error(data.error);

                // Using the same data for both grade and levels calculations
                const historicalPrices = data.data.map((item: HistoricalDataPoint) => ({
                    time: item.time,
                    close: item.close
                }));

                // Get current price from the latest data point
                const currentPrice = data.data[data.data.length - 1].close;

                // Find PMCATH (2021 highest)
                const pmcData = data.data.filter((item: HistoricalDataPoint) => {
                    const date = new Date(item.time);
                    return date.getFullYear() === 2021;
                });
                const pmcATH = Math.max(...pmcData.map(item => item.high));

                // Find CMCATL (lowest after PMCATH)
                const cmcData = data.data.filter((item: HistoricalDataPoint) => {
                    const date = new Date(item.time);
                    return date > new Date(pmcData[pmcData.length - 1].time);
                });
                const cmcATL = Math.min(...cmcData.map(item => item.low));

                const predictionStartDate = '2022-06-01';

                // 🔍 ANALYSIS: Single calculation using the same data
                const foskaayFibResults = calculateFoskaayFibLevels(
                    pmcATH,
                    cmcATL,
                    currentPrice,
                    predictionStartDate,
                    historicalPrices
                );

                setFFGrades(prev => ({
                    ...prev,
                    [symbol]: {
                        symbol,
                        foskaayFibResults // Contains both grade and levels
                    }
                }));
            } catch (err) {
                console.error(`Error fetching ${symbol}:`, err);
            }
        };

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 🔍 ANALYSIS: Making parallel calls for all symbols
                await Promise.all(cryptoSymbols.map(fetchHistoricalData));
            } catch (err) {
                setError('Failed to fetch some cryptocurrency data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return { ffGrades, loading, error };
}

// Helper function to format level display consistent with Prediction component
export function formatFFLevel(price: number, percentage: number): string {
    // Find the next unachieved level from FoskaayFib levels
    return `FFLevel-${percentage.toFixed(2)}%-$${price.toLocaleString()}`;
}