// /components/donor/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { checkAuthAndRole} from '@/utils/verification/donor-verification/verify-donor-nft';
import { cryptoSymbols, cryptoNames } from '../../DonorATHCryptoList';
import Chart from "./Chart";
import ContentMain from "./ContentMain";
import Link from "next/link";
import ContentSidebar from "./ContentSidebar";

interface CycleData {
  ath: number;
  ath_time: string;
  atl: number;
  atl_time: string;
}

interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volumefrom: number;  
}

interface CryptoData {
  success: boolean;
  symbol: string;
  cycles: {
    [key: string]: CycleData;
  };
  currentPrice: number;
  data: HistoricalDataPoint[];
}

const DonorATHCPPListingsFullDetailsPage = ({ slug }: { slug: string }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get crypto name from ATHCryptoList
  const getCryptoFullName = (symbol: string) => {
    const nameIndex = cryptoSymbols.indexOf(symbol.toUpperCase());
    const cryptoName = cryptoNames[nameIndex] || symbol;
    return `${cryptoName} (${symbol.toUpperCase()})`;
  };

  useEffect(() => {
    // Use verify utils to confirm 
    // if user have required access or not
    const checkAuth = async () => {
      try {
        const { isAdmin } = await checkAuthAndRole();
        setIsAdmin(isAdmin);
        
        if (isAdmin) {
          await fetchData();
        }
      } catch (err) {
        setError('Authorization check failed');
      }
    };

    const fetchData = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/ath-crypto-price-prediction/crypto-assets/historical-prices/symbol-single?symbol=${slug}`);
        // const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        if (!data.success) {
          throw new Error(data.error || 'API request failed');
        }

        setCryptoData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="border-gray-900">
        DONOR VERSION: Calculating Selected {slug} Crypto Coin/Token Historical Data...With FoskaayFib!
          <br />
        Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <div>Checking permissions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!cryptoData) {
    return null;
  }

  return (
    <div>

      {/* Breadcrumbs */}
      <nav className="text-sm mb-4">
        <Link href="/donor/crypto-ath-price-prediction" className="text-blue-500 hover:underline">
        <br /> {/* this break helps to create needed space on mobile betwen nav and notification header bar */}
        ← Back to 
        ATH Crypto Price Prediction Homepage (Donor Version)
        </Link>
        <span className="mx-2">{">>"}</span>
        <span>{getCryptoFullName(slug)}</span>
      </nav>

      <div className="flex flex-col w-full">
        {/* SEO Optimized Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            2022 - 2025 {getCryptoFullName(cryptoData.symbol)} ATH Crypto Price Prediction
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive price analysis and ATH prediction for {getCryptoFullName(cryptoData.symbol)}.
            Track historical data, market trends, and price movements to make educative and informed decisions.
          </p>
        </div>

        {/* Full-width chart section */}
        <div className="w-full mb-8">
          <Chart cryptoData={cryptoData} />
        </div>

        {/* Two-column layout below chart */}
        <div className="flex flex-col lg:flex-row gap-8">
          <ContentMain cryptoData={cryptoData} />
          {/* <ContentSidebar /> */}
        </div>
      </div>

      {/* Back to Homepage Link at Bottom */}
      <div className="mt-4">
        <Link href="/donor/crypto-ath-price-prediction" className="text-blue-500 hover:underline">
        ← Back to Crypto ATH Price Prediction Homepage (Donor Version)
        </Link>
      </div>

    </div>
  );
};

export default DonorATHCPPListingsFullDetailsPage;