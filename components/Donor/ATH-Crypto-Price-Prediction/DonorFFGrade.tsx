// /components/donor/ATH-Crypto-Price-Prediction/DonorFFGradeIndex.tsx 
import { useState, useEffect } from 'react';
import { calculateFoskaayFibLevels, FoskaayFibResult } from '@/utils/formulars/FoskaayFibV1';
import { cryptoSymbols, cryptoNames } from './DonorATHCryptoList';
import DonorPrediction from './Listings/FullDetailsPage/Prediction';

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

export function useDonorFFGrades() {
  const [ffGrades, setFFGrades] = useState<Record<string, FFGradeResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async (symbol: string) => {
      try {
        const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Failed to fetch ${symbol} data`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

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
            foskaayFibResults
          }
        }));
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      try {
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