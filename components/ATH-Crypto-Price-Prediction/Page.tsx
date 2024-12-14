// /components/ATH-Crypto-Price-Prediction/page.tsx 
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cryptoSymbols, cryptoNames } from './ATHCryptoList';

interface ATHCryptoPricePredictionPageProps {
  cryptoList: any[];
  isLoading: boolean;
  error: string | null;
}

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
};

const formatMarketCap = (marketCap: number) => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}Trillion`; // Trillions
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}Billion`;  // Billions
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}Million`;  // Millions
  return `$${marketCap.toLocaleString()}`; // Less than a million
};


const formattotalVolume24h = (totalVolume24h: number) => {
  if (totalVolume24h >= 1e9) return `$${(totalVolume24h / 1e9).toFixed(2)}B`;
  if (totalVolume24h >= 1e6) return `$${(totalVolume24h / 1e6).toFixed(2)}M`;
  return `$${totalVolume24h.toLocaleString()}`;
};

const getGradeColor = (grade: string) => {
  const gradeColors: { [key: string]: string } = {
    'A': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'B': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    'C': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100',
    'D': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'E': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'F': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    'G': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
    'H': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'I': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
    'J': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    'K': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  };
  return gradeColors[grade] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
};

// main function
export default function ATHCryptoPricePredictionPage({
  cryptoList,
  isLoading,
  error
}: ATHCryptoPricePredictionPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'marketCap', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  const filteredAndSortedData = useMemo(() => {
    let filtered = cryptoList.filter(crypto => {
      const nameIndex = cryptoSymbols.indexOf(crypto.symbol);
      const cryptoName = cryptoNames[nameIndex] || crypto.symbol;

      return (
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cryptoName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [cryptoList, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUpIcon className="h-4 w-4 text-blue-500" />
      : <ArrowDownIcon className="h-4 w-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <p>FoskaayFib Crypto ATH Price Prediction List</p>
        <p> Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* SEO Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-500 mb-4">
          2022 - 2025 (Market Cycle) Crypto ATH Price Prediction List Using FoskaayFib Levels & Grades (Beta-V1.29.110)
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Crypto ATH List with Advanced market cycle analysis and price predictions for top cryptocurrencies.
          Get detailed FoskaayFib grades, accumulation zones, and price targets based on
          historical market cycles. Crypto ATH Calculator for Crypto ATH Prediction.
        </p>
        <p className="text-xs mx-auto">
          Disclaimer: This is for EDUCATIONAL purposes ONLY and not Financial, Investment or Trading Advice in any listed crypto coins/token.
          Always Do Your Own Research (DYOR).
          Kindly consult professional financial/legal advisers before making financial/investment decisions.
          Using whole or part of content means you agree that we are not liable for any losses that you may sufer thereafter (including you agree not to initiate any lawsuit in person or as group)
          and you will be solely responsible for your decisions and actions and ensuring that accessing this content is legally permitted in your jurisdiction.
        </p>
        <p className="text-l text-yellow-600 max-w-3xl mx-auto">
          <Link href="/donate" >
            <b>SUPPORT PLEASE:</b> If you find this FREE Crypto ATH Price Prediction Calculator Tool helpful and want to keep it going
            (it took me lots of sleepless-nights to build & continue to maintain for FREE).
            <br />
            Kindly DONATE here (Hint: Mint ExploreWeb3 Donor NFT to unlock more EXCLUSIVE Features coming soon) - THANKS!
          </Link>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search cryptocurrency by name or symbol..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {/* ID */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                {/* Name */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                {/* MarketCap */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                  onClick={() => handleSort('marketCap')}
                >
                  <div className="flex items-center">
                    Market Cap
                    <SortIcon column="marketCap" />
                  </div>
                </th>
                {/* Price */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                  onClick={() => handleSort('currentPrice')}
                >
                  <div className="flex items-center">
                    Price
                    <SortIcon column="currentPrice" />
                  </div>
                </th>
                {/* Liquidity (24H) */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                  onClick={() => handleSort('totalVolume24h')}
                >
                  <div className="flex items-center">
                    Liquidity (24H Volume)
                    <SortIcon column="totalVolume24h" />
                  </div>
                </th>
                {/* FoskaayFib Grade  */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                  onClick={() => handleSort('foskaayFibGrade')}
                >
                  <div className="flex items-center">
                    FoskaayFib Grade (FFGrade)
                    <SortIcon column="foskaayFibGrade" />
                  </div>
                </th>
                {/* FoskaayFib Price Prediction */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  2025 Price Target
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((crypto, index) => {
                const nameIndex = cryptoSymbols.indexOf(crypto.symbol);
                const cryptoName = cryptoNames[nameIndex] || crypto.symbol;

                return (
                  <tr key={crypto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    {/* Asset Name Values */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        <img
                          src={crypto.tokenImageURL}
                          alt={`${cryptoName} logo`}
                          className="h-6 w-6 mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cryptoName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {crypto.symbol}
                          </div>
                        </div>
                      </Link>
                    </td>
                    {/* Marketcap values*/}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        {formatMarketCap(crypto.marketCap)}
                      </Link>
                    </td>
                    {/* Price values */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        {formatPrice(crypto.currentPrice)}
                      </Link>
                    </td>
                    {/* Liquidity (24H) values */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        {formattotalVolume24h(crypto.totalVolume24h)}
                      </Link>
                    </td>
                    {/* FoskaayFib Grades Values */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(crypto.foskaayFibGrade)}`}>
                          Calculate {crypto.symbol} FFGrade {/* {crypto.foskaayFibGrade} */}
                        </span>
                      </Link>
                    </td>
                    {/* FoskaayFib Price Prediction value */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <Link href={`/crypto-ath-price-prediction/${crypto.symbol.toLowerCase()}`} target='_blank' className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Unveil Now {">>"}
                          </div>
                        </div>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <nav className="flex items-center space-x-2">
          {Array.from({ length: Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>

      {/* Video Section */}
      <div className="mb-8 flex flex-col items-center">
        <br />
        <h2 className="mb-6 text-purple-500 text-center">
          <b>
            FREE Crypto ATH Price Prediction Tool:
            FoskaayFib Levels & Grades EXPLAINED below:
          </b>
        </h2>
        <iframe
          width="70%"
          height="515"
          src="https://www.youtube.com/embed/xg8jNOED8f4"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }} // Optional: Use CSS for border styling
        ></iframe>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Data updates every 5 minutes (Or Reload the page). Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-2">
          Powered by FoskaayFib Market Cycle Analysis.
          Historical data provided by {" "}
          <Link href="https://www.cryptocompare.com" target="_blank">
            CryptoCompare.
          </Link>
        </p>
      </div>
    </div>
  );
}