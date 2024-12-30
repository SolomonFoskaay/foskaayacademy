// /components/ATH-Crypto-Price-Prediction/index.tsx
"use client"
import { useEffect, useState } from 'react';
import ATHCryptoPricePredictionPage from './Page';
import { cryptoSymbols, getCurrentList } from './ATHCryptoList';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  totalVolume24h: number;
  tokenImageURL: string;
}

export default function ATHCryptoPricePrediction() {
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symbolsLoaded, setSymbolsLoaded] = useState(false);

  // First, ensure crypto symbols are loaded
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const { symbols } = await getCurrentList();
        if (symbols.length > 0) {
          setSymbolsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load crypto symbols:', err);
        setError('Failed to load cryptocurrency list. Please try again later.');
        setIsLoading(false);
      }
    };

    loadSymbols();
  }, []);

  // Then fetch crypto data once symbols are loaded
  useEffect(() => {
    if (!symbolsLoaded) return;

    const fetchCryptoData = async () => {
      try {
        const symbols = cryptoSymbols.join(',');
        const response = await fetch(
          `/api/ath-crypto-price-prediction/crypto-assets/live-prices/symbol-all?symbols=${symbols}&timestamp=${new Date().getTime()}`
        // const response = await fetch(`/api/ath-crypto-price-prediction/historical-data/multiple-crypto-list?symbols=${symbols}&timestamp=${new Date().getTime()}`);
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        setCryptoList(data.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch cryptocurrency data:', err);
        setError('Failed to fetch cryptocurrency data. Kindly reload the page or revisit later!');
        setIsLoading(false);
      }
    };

    fetchCryptoData();
  }, [symbolsLoaded]);

  return (
    <div className="flex flex-col w-full">
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