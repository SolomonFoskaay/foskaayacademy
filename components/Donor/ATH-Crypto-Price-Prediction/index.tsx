// /components/donor/ATH-Crypto-Price-Prediction/index.tsx
"use client"
import { useEffect, useState } from 'react';
import { checkAuthAndRole } from '@/utils/verification/donor-verification/verify-donor-nft';
import DonorATHCryptoPricePredictionPage from './Page';
import { cryptoSymbols, getCurrentList } from './DonorATHCryptoList';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  marketCap: number;
  currentPrice: number;
  totalVolume24h: number;
  tokenImageURL: string;
}

export default function DonorATHCryptoPricePrediction() {
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [symbolsLoaded, setSymbolsLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAdmin } = await checkAuthAndRole();
        setIsAdmin(isAdmin);
        
        if (isAdmin) {
          // Load symbols first
          const { symbols } = await getCurrentList();
          if (symbols.length > 0) {
            setSymbolsLoaded(true);
          }
        }
      } catch (err) {
        setError('Authorization check failed');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch crypto data only after symbols are loaded and user is authorized
  useEffect(() => {
    if (!isAdmin || !symbolsLoaded) return;

    const fetchCryptoData = async () => {
      try {
        const symbols = cryptoSymbols.join(',');
        const response = await fetch(
          `/api/ath-crypto-price-prediction/crypto-assets/live-prices/symbol-all?symbols=${symbols}&timestamp=${new Date().getTime()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        setCryptoList(data.data);
      } catch (err) {
        setError('Failed to fetch cryptocurrency data. Kindly reload the page or revisit later!');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [isAdmin, symbolsLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="border-gray-900">
          DONOR VERSION: Calculating Crypto ATH Price Prediction List With FoskaayFib
          <br />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <div>Checking permissions...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="w-full mb-8">
        <DonorATHCryptoPricePredictionPage
          isLoading={loading}
          cryptoList={cryptoList}
          error={error}
        />
      </div>
    </div>
  );
}