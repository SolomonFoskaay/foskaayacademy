// /components/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/Chart.tsx
"use client";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

interface ChartProps {
  cryptoData: {
    symbol: string;
    data: Array<{
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
}

const Chart = ({ cryptoData }: ChartProps) => {
  const [activeChart, setActiveChart] = useState<'chartjs' | 'tradingview'>('chartjs');
  const [timeframe, setTimeframe] = useState<'1W' | '2W' | '1M' | '3M' | '1Y' | 'ALL'>('ALL');
  const { symbol, data } = cryptoData;

  // Filter data based on timeframe
  const getFilteredData = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch(timeframe) {
      case '1W':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '2W':
        filterDate.setDate(now.getDate() - 14);
        break;
      case '1M':
        filterDate.setMonth(now.getMonth() - 1);
        break;
        case '3M':
        filterDate.setMonth(now.getMonth() - 3);
        break;
    case '1Y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.time) >= filterDate);
  };

  const filteredData = getFilteredData();

  // Prepare data for Chart.js
  const chartData = {
    labels: filteredData.map(item => item.time),
    datasets: [{
      label: `${symbol} Price`,
      data: filteredData.map(item => item.close),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.1)',
      tension: 0.1,
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy' as const,
        },
        pan: {
          enabled: true,
          mode: 'xy' as const,
        },
      },
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} Price History`,
        color: 'rgb(255, 255, 255)',
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
          color: 'rgb(255, 255, 255)',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: 'rgb(255, 255, 255)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="w-full mb-8 bg-white dark:bg-black/20 rounded-lg shadow-md">
      <div className="p-6">
        {/* Chart Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveChart('chartjs')}
              className={`px-4 py-2 rounded ${
                activeChart === 'chartjs' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Interactive Chart
            </button>
            <button
              onClick={() => setActiveChart('tradingview')}
              className={`px-4 py-2 rounded ${
                activeChart === 'tradingview' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              TradingView
            </button>
          </div>

          {activeChart === 'chartjs' && (
            <div className="flex gap-2">
              {(['1W', '2W', '1M', '3M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded ${
                    timeframe === tf
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="h-[700px]">
          {activeChart === 'chartjs' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <AdvancedRealTimeChart
              symbol={`BINANCE:${symbol}USD`}
              theme="dark"
              container_id="tradingview_chart"
              autosize
              enable_publishing={false}
              withdateranges={true}
              hide_side_toolbar={false}
              allow_symbol_change={true}
              hotlist={true}
              calendar={true}
              height={700}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chart;