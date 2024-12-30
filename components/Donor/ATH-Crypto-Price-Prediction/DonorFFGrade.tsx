// /components/donor/ATH-Crypto-Price-Prediction/DonorFFGrade.tsx 
import { useState, useEffect } from 'react';
import { calculateFoskaayFibLevels, FoskaayFibResult } from '@/utils/formulars/FoskaayFibV1';
import { cryptoSymbols } from './DonorATHCryptoList';

interface HistoricalDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volumefrom: number;
}

interface FFGradeResult {
    symbol: string;
    foskaayFibResults: FoskaayFibResult;
}

interface CycleData {
    ath: number;
    ath_time: string;
    atl: number;
    atl_time: string;
}

interface BulkResponseData {
    [symbol: string]: {
        success: boolean;
        symbol: string;
        TimeTo: string;
        cycles: {
            [key: string]: CycleData;
        };
        currentPrice: number;
        data: HistoricalDataPoint[];
    };
}

// Track total number of api calls made for optimization
let apiCallCount = 0;

export function useDonorFFGrades() {
    const [ffGrades, setFFGrades] = useState<Record<string, FFGradeResult>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiCallCount = 0;

        const fetchHistoricalData = async () => {
            try {
                // Single API call for all symbols
                apiCallCount++;
                console.log(`Making bulk API call #${apiCallCount} for ${cryptoSymbols.length} symbols`);

                const response = await fetch(
                    `/api/ath-crypto-price-prediction/crypto-assets/historical-prices/symbol-all?symbols=${cryptoSymbols.join(',')}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch bulk data');
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error);
                }

                const bulkData: BulkResponseData = result.data;
                const newGrades: Record<string, FFGradeResult> = {};

                // Process each symbol's data
                Object.entries(bulkData).forEach(([symbol, data]) => {
                    try {
                        // Calculate FoskaayFib results for each symbol
                        const foskaayFibResults = calculateFoskaayFibLevels(
                            data.cycles['2018-2021'].ath,
                            data.cycles['2022-2025'].atl,
                            data.currentPrice,
                            '2022-06-01',
                            data.data
                        );

                        newGrades[symbol] = {
                            symbol,
                            foskaayFibResults
                        };
                    } catch (err) {
                        console.error(`Error processing ${symbol}:`, err);
                    }
                });

                setFFGrades(newGrades);
            } catch (err) {
                console.error('Error fetching grades:', err);
                setError('Failed to fetch grades data');
            } finally {
                setLoading(false);
            }
        };

        fetchHistoricalData();
    }, []);

    return { ffGrades, loading, error };
}

// Helper function to format level display consistent with Prediction component
export function formatFFLevel(price: number, percentage: number): string {
    // Find the next unachieved level from FoskaayFib levels
    return `FFLevel-${percentage.toFixed(2)}%-$${price.toLocaleString()}`;
}