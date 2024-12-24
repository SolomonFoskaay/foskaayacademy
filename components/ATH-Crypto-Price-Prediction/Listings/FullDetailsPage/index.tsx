// /components/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { cryptoSymbols, cryptoNames } from '../../ATHCryptoList';
import Chart from "./Chart";
import ContentMain from "./ContentMain";
import Link from "next/link";
import ContentSidebar from "./ContentSidebar";

interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap: number;
}

interface CryptoData {
  success: boolean;
  symbol: string;
  data: HistoricalDataPoint[];
}

const ATHCPPListingsFullDetailsPage = ({ slug }: { slug: string }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get crypto full name from ATHCryptoList for symbols
  const getCryptoFullName = (symbol: string) => {
    const nameIndex = cryptoSymbols.indexOf(symbol.toUpperCase());
    const cryptoName = cryptoNames[nameIndex] || symbol;
    return `${cryptoName} (${symbol.toUpperCase()})`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Before loading page or making API call, Check if crypto is in the allowed list
        // Ensure non-donor version can only show lFoskaayFib stats for listed cryptos only
        //Donor version can check even unlisted crypto for unlimited cryptos allowed by the API
        if (!cryptoSymbols.includes(slug.toUpperCase())) {
          window.location.href = '/crypto-ath-price-prediction/access-denied';
          return;
        }

        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        if (!data.success) {
          throw new Error(data.error || 'API request failed');
        }

        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="border-gray-900">
        NON-DONOR VERSION: Calculating Selected {slug} Crypto Coin/Token Historical Data...With FoskaayFib!
          <br />
        Loading...
        </div>
      </div>
    );
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
        <Link href="/crypto-ath-price-prediction" className="text-blue-500 hover:underline">
        <br /> {/* this break helps to create needed space on mobile betwen nav and notification header bar */}
        ← Back to 
        ATH Crypto Price Prediction Homepage (Non-Donor Version)
        </Link>
        <span className="mx-2">{">>"}</span>
        <span>{slug.toUpperCase()}</span>
      </nav>

      <div className="flex flex-col w-full">
        {/* SEO Optimized Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            2022 - 2025 {cryptoData.symbol} ATH Crypto Price Prediction
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive price analysis and ATH prediction for {cryptoData.symbol}.
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
        <Link href="/crypto-ath-price-prediction" className="text-blue-500 hover:underline">
        ← Back to Crypto ATH Price Prediction Homepage (Non-Donor Version)
        </Link>
      </div>

    </div>
  );
};

export default ATHCPPListingsFullDetailsPage;