// /components/ATH-Crypto-Price-Prediction/page.tsx
"use client"
import { useEffect, useState } from 'react';
import ATHCryptoPricePredictionPage from './Page';
import { calculateFoskaayFibLevels } from '@/utils/formulars/FoskaayFibV1';

interface HistoricalPrice {
  time: string;
  close: number;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  pmcATH: number;
  cmcATL: number;
  foskaayFibGrade: string;
  predictedRange: {
    min: number;
    max: number;
  };
  predictionStartDate: string;
}

export default function ATHCryptoPricePrediction() {
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Use historical-data endpoint with no symbol to get all coins
        const response = await fetch('/api/ath-crypto-price-prediction/historical-data/multiple-crypto-list');
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        // Process the data using your existing FoskaayFib calculations
        const processedData = data.data.map((crypto: any) => {
          const foskaayFibResults = calculateFoskaayFibLevels(
            crypto.pmcATH,
            crypto.cmcATL,
            crypto.currentPrice,
            crypto.predictionStartDate,
            crypto.prices
          );

          return {
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            marketCap: crypto.marketCap,
            currentPrice: crypto.currentPrice,
            pmcATH: crypto.pmcATH,
            cmcATL: crypto.cmcATL,
            foskaayFibGrade: foskaayFibResults.grade.currentGrade.grade,
            predictedRange: foskaayFibResults.cmcATH,
            predictionStartDate: crypto.predictionStartDate
          };
        });

        setCryptoList(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch cryptocurrency data:', err);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCryptoData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchCryptoData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Full-width chart section */}
      <div className="w-full mb-8">
        <ATHCryptoPricePredictionPage
          isLoading={isLoading}
          cryptoList={cryptoList}
          error={error}
        />
      </div>
    </div>
  );
}
