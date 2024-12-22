// /components/donor/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/Chart.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { cryptoSymbols, cryptoNames } from '../../DonorATHCryptoList';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

type TimeframeType = 'cut' | 'compress';
type ChartStyle = 'line' | 'candlestick';

// Helper function to get interval in milliseconds
const getIntervalMs = (interval: string): number => {
  const value = parseInt(interval);
  if (interval.includes('min')) return value * 60 * 1000;
  if (interval.includes('h')) return value * 60 * 60 * 1000;
  if (interval.includes('d')) return value * 24 * 60 * 60 * 1000;
  if (interval.includes('w')) return value * 7 * 24 * 60 * 60 * 1000;
  if (interval.includes('m')) return value * 30 * 24 * 60 * 60 * 1000;
  if (interval.includes('y')) return value * 365 * 24 * 60 * 60 * 1000;
  return 0;
};

// Add helper function for formatting dates in chart labels
const formatChartDate = (timestamp: string, interval: string): string => {
  const date = new Date(timestamp);
  if (interval.includes('min')) {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  if (interval.includes('h')) {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit'
    });
  }
  if (interval.includes('d')) {
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: '2-digit'
    });
  }
  if (interval.includes('w') || interval.includes('m')) {
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short'
    });
  }
  if (interval.includes('y')) {
    return date.getFullYear().toString();
  }
  return date.toLocaleDateString();
};

const DonorChart = ({ cryptoData }: ChartProps) => {
  // Helper function to display name and symbol
  const getCryptoFullName = (symbol: string) => {
    const nameIndex = cryptoSymbols.indexOf(symbol.toUpperCase());
    const cryptoName = cryptoNames[nameIndex] || symbol;
    return `${cryptoName} (${symbol.toUpperCase()})`;
  };
  const [activeChart, setActiveChart] = useState<'chartjs' | 'tradingview'>('chartjs');
  const [timeframe, setTimeframe] = useState<string>('ALL');
  const [timeframeType, setTimeframeType] = useState<TimeframeType>('cut');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('line');

  const { symbol, data } = cryptoData;

  const timeframes = {
    cut: ['1D', '3D', '1W', '2W', '1M', '3M', '6M', '1Y', 'ALL'],
    compress: [
      '1Min', '3Min', '5Min', '10Min', '15Min', '30Min',
      '1H', '2H', '3H', '4H', '6H', '12H',
      '1D', '1W', '2W', '1M', '3M', '6M', '1Y', '2Y', '4Y'
    ]
  };

  // Group data by interval function
  const groupDataByInterval = (inputData: typeof data, interval: string) => {
    if (!inputData.length) return inputData;

    const intervalMs = getIntervalMs(interval);
    if (!intervalMs) return inputData;

    const groups: { [key: string]: typeof data } = {};
    
    inputData.forEach(dataPoint => {
      const timestamp = new Date(dataPoint.time).getTime();
      const groupKey = Math.floor(timestamp / intervalMs) * intervalMs;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(dataPoint);
    });

    return Object.entries(groups).map(([timestamp, points]) => ({
      time: new Date(parseInt(timestamp)).toISOString(),
      open: points[0].open,
      high: Math.max(...points.map(p => p.high)),
      low: Math.min(...points.map(p => p.low)),
      close: points[points.length - 1].close,
      volume: points.reduce((sum, p) => sum + p.volume, 0)
    }));
  };

  // Process data based on timeframe type
  const processedData = useMemo(() => {
    if (timeframeType === 'cut') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(timeframe) {
        case '1D': filterDate.setDate(now.getDate() - 1); break;
        case '3D': filterDate.setDate(now.getDate() - 3); break;
        case '1W': filterDate.setDate(now.getDate() - 7); break;
        case '2W': filterDate.setDate(now.getDate() - 14); break;
        case '1M': filterDate.setMonth(now.getMonth() - 1); break;
        case '3M': filterDate.setMonth(now.getMonth() - 3); break;
        case '6M': filterDate.setMonth(now.getMonth() - 6); break;
        case '1Y': filterDate.setFullYear(now.getFullYear() - 1); break;
        default: return data;
      }
      
      return data.filter(item => new Date(item.time) >= filterDate);
    } else {
      // Use groupDataByInterval for compression
      return groupDataByInterval(data, timeframe.toLowerCase());
    }
  }, [data, timeframe, timeframeType]);

  // Prepare data for Chart.js
  const lineChartData = useMemo(() => ({
    labels: processedData.map(item => item.time),
    datasets: [{
      label: `${getCryptoFullName(symbol)} Price`,
      data: processedData.map(item => item.close),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.1)',
      tension: 0.1,
      fill: true,
    }]
  }), [processedData, symbol]);

  const barChartData = useMemo(() => ({
    labels: processedData.map(item => item.time),
    datasets: [{
      label: `${getCryptoFullName(symbol)} OHLC`,
      data: processedData.map(item => ({
        x: item.time,
        y: [item.open, item.high, item.low, item.close]
      })),
      backgroundColor: processedData.map(item => 
        item.close >= item.open ? 'rgba(75, 192, 92, 0.5)' : 'rgba(255, 99, 132, 0.5)'
      ),
      borderColor: processedData.map(item => 
        item.close >= item.open ? 'rgb(75, 192, 92)' : 'rgb(255, 99, 132)'
      ),
      borderWidth: 1,
      barPercentage: 0.9,
      categoryPercentage: 0.8,
    }]
  }), [processedData, symbol]);

  // Update chart options for better bar display
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
        text: `${getCryptoFullName(symbol)} Price History`,
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
        offset: true,
        ticks: {
          color: 'rgb(255, 255, 255)',
          callback: (value: any) => {
            const label = lineChartData.labels[value];
            return formatChartDate(label, timeframe.toLowerCase());
          }
        },
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
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeframeType('cut')}
                  className={`px-4 py-2 rounded ${
                    timeframeType === 'cut' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Cut Data
                </button>
                <button
                  onClick={() => setTimeframeType('compress')}
                  className={`px-4 py-2 rounded ${
                    timeframeType === 'compress' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Compress Data
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {timeframes[timeframeType].map((tf) => (
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

              <div className="flex gap-2">
                <button
                  onClick={() => setChartStyle('line')}
                  className={`px-4 py-2 rounded ${
                    chartStyle === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Line Chart
                </button>
                <button
                  onClick={() => setChartStyle('candlestick')}
                  className={`px-4 py-2 rounded ${
                    chartStyle === 'candlestick' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Candlestick
                </button>
              </div>
            </>
          )}
        </div>

        {/* Chart Display */}
        <div className="h-[700px]">
          {activeChart === 'chartjs' ? (
            chartStyle === 'line' ? (
              <Line data={lineChartData as any} options={chartOptions} />
            ) : (
              <Bar data={barChartData as any} options={chartOptions} />
            )
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

export default DonorChart;