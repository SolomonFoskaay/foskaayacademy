// /components/donor/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/ContentMain.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { calculateFoskaayFibLevels } from '@/utils/formulars/FoskaayFibV1';
import DonorPrediction from './Prediction';
import { cryptoSymbols, cryptoNames } from '../../DonorATHCryptoList';

interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volumefrom: number;
}

interface CycleData {
  ath: number;
  ath_time: string;
  atl: number;
  atl_time: string;
}

interface ContentMainProps {
  cryptoData: {
    symbol: string;
    cycles: {
      [key: string]: CycleData;
    };
    currentPrice: number;
    data: HistoricalDataPoint[];
  };
}

const ContentMain = ({ cryptoData }: ContentMainProps) => {
  // Helper function to display name and symbol (keep this for donor version)
  const getCryptoFullName = (symbol: string) => {
    const nameIndex = cryptoSymbols.indexOf(symbol.toUpperCase());
    const cryptoName = cryptoNames[nameIndex] || symbol;
    return `${cryptoName} (${symbol.toUpperCase()})`;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: string; end: string | null }>({ start: '', end: null });
  const itemsPerPage = 50;

  const { symbol, cycles, currentPrice, data } = cryptoData;

  // Calculate FoskaayFibonacci levels
  const FoskaayFibResults = useMemo(() => {
    const pmcATH = cycles['2018-2021']?.ath || 0;
    const cmcATL = cycles['2022-2025']?.atl || 0;

    return calculateFoskaayFibLevels(
      pmcATH,
      cmcATL,
      currentPrice,
      '2022-06-01', // predictionStartDate
      data.map(item => ({  // historical prices for achievement tracking
        time: item.time,
        close: item.close
      }))
    );
  }, [cycles, currentPrice, data]);

  // Filter data based on date range
  const filteredData = data.filter(item => {
    if (!dateRange.start) return true;
    const itemDate = new Date(item.time);
    const startDate = new Date(dateRange.start);
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    if (endDate) {
      return itemDate >= startDate && itemDate <= endDate;
    }
    return itemDate.toDateString() === startDate.toDateString();
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Quick date range selections
  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="w-full lg:w-2/3">
      <div className="rounded-lg bg-white dark:bg-black/20 p-6 shadow-md">

        {/* Market Statistics Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{getCryptoFullName(cryptoData.symbol)} Crypto Market Cycle Statistics</h2>
        </section>

        {/* Prediction Component */}
        <DonorPrediction 
        symbol={cryptoData.symbol}
        cryptoFullName={getCryptoFullName(cryptoData.symbol)}
        FoskaayFibResults={FoskaayFibResults}
      />

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
            width="95%"
            height="515"
            src="https://www.youtube.com/embed/xg8jNOED8f4"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }} // Optional: Use CSS for border styling
          ></iframe>
        </div>

        {/* Historical Price Data Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{getCryptoFullName(cryptoData.symbol)} Historical Price Data</h2>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
              <input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                onClick={() => setDateRange({ start: '', end: null })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setQuickDateRange(7)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">1W</button>
              <button onClick={() => setQuickDateRange(14)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">2W</button>
              <button onClick={() => setQuickDateRange(30)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">1M</button>
              <button onClick={() => setQuickDateRange(90)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">3M</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Open</th>
                  <th className="px-4 py-2">High</th>
                  <th className="px-4 py-2">Low</th>
                  <th className="px-4 py-2">Close</th>
                  <th className="px-4 py-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">{item.time}</td>
                    <td className="px-4 py-2">${item.open.toLocaleString()}</td>
                    <td className="px-4 py-2">${item.high.toLocaleString()}</td>
                    <td className="px-4 py-2">${item.low.toLocaleString()}</td>
                    <td className="px-4 py-2">${item.close.toLocaleString()}</td>
                    <td className="px-4 py-2">{item.volumefrom.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContentMain;