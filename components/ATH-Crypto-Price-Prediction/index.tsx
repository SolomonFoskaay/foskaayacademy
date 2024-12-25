// /components/ATH-Crypto-Price-Prediction/index.tsx
"use client"
import { useEffect, useState } from 'react';
import ATHCryptoPricePredictionPage from './Page';
import { cryptoSymbols } from './ATHCryptoList';

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

  const fetchCryptoData = async () => {
    try {
      const symbols = cryptoSymbols.join(',');
      const response = await fetch(`/api/ath-crypto-price-prediction/historical-data/multiple-crypto-list?symbols=${symbols}&timestamp=${new Date().getTime()}`);
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

  useEffect(() => {
    fetchCryptoData();
  }, []);

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