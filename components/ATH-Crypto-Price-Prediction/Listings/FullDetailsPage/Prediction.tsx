// /components/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/Prediction.tsx
import React from 'react';
import { FibResult, FibLevel } from '../../../../utils/formulars/FoskaayFibV1';
import { formatDistanceToNow } from 'date-fns';

interface PredictionProps {
    symbol: string;
    fibResults: FibResult;
}

const Prediction = ({ symbol, fibResults }: PredictionProps) => {
    // Helper function to get gradient based on percentage
    const getGradient = (percentage: number) => {
        if (percentage <= 78.6) {
            return `linear-gradient(90deg, rgba(22,163,74,0.9) 0%, rgba(34,197,94,0.6) 100%)`; // Green gradient
        } else if (percentage <= 124.6) {
            return `linear-gradient(90deg, rgba(234,179,8,0.9) 0%, rgba(250,204,21,0.6) 100%)`; // Yellow gradient
        } else {
            return `linear-gradient(90deg, rgba(220,38,38,0.9) 0%, rgba(239,68,68,0.6) 100%)`; // Red gradient
        }
    };

    // Helper function to get zone background color
    const getZoneBackground = (percentage: number) => {
        if (percentage <= 78.6) {
            return 'bg-green-900/10 dark:bg-green-900/20';
        } else if (percentage <= 124.6) {
            return 'bg-yellow-900/10 dark:bg-yellow-900/20';
        } else {
            return 'bg-red-900/10 dark:bg-red-900/20';
        }
    };

    return (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6">
                {/* Market Cycle Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            2018-2021 {symbol} Market Cycle ATH (PMCATH)
                        </h3>
                        <p className="text-xl font-bold text-yellow-600">
                            ${fibResults.pmcATH.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            2022-2025 {symbol} Market Cycle ATL (CMCATL)
                        </h3>
                        <p className="text-xl font-bold text-red-600">
                            ${fibResults.cmcATL.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            {symbol} Current Price
                        </h3>
                        <p className="text-xl font-bold text-green-600">
                            ${fibResults.currentPrice.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-8">
                    <h3 className="text-sm text-gray-600 dark:text-gray-400">
                        {symbol} 2025 Predicted ATH (CMCATH)
                    </h3>
                    <p className="text-xl font-bold text-purple-600">
                        ${fibResults.cmcATH.min.toLocaleString()} - ${fibResults.cmcATH.max.toLocaleString()}
                    </p>
                </div>

                {/* Current Zone Indicator */}
                <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ background: getGradient(fibResults.currentZone.range[1]) }}>
                    <h3 className="text-lg font-bold mb-2 text-white">
                        {symbol} Price Is Currently In {fibResults.currentZone.name}
                    </h3>
                    <p className="text-sm text-white/90">
                        {fibResults.currentZone.description}
                    </p>
                </div>

                {/* Fibonacci Levels */}
                <h2 className="text-2xl font-bold mb-4">
                    {symbol} Price Predictions (Fibonacci Levels)
                </h2>

                <div className="space-y-4">
                {fibResults.levels.map((level, index) => {
  const percentToGo = ((level.price - fibResults.currentPrice) / fibResults.currentPrice * 100);
  const multiplier = (percentToGo / 100).toFixed(2);
  
  return (
    <div key={index} className={`relative ${getZoneBackground(level.percentage)}`}>
      <div className="p-4 rounded-lg border dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Level {level.percentage}% - {level.name}
            </span>
            <p className="text-lg font-semibold">
              ${level.price.toLocaleString()}
            </p>
          </div>
          {level.isAchieved ? (
            <div className="text-right">
              <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
                Achieved
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {level.achievedDate && 
                  `Reached in ${level.daysToAchieve} days`}
              </p>
            </div>
          ) : (
            <div className="text-right">
              <span className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
                Target
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {percentToGo.toFixed(2)}% ({multiplier}x) to go
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar with Gradient */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 h-full transition-all duration-500"
            style={{
              width: `${level.progressPercentage}%`,
              background: getGradient(level.percentage)
            }}
          />
          <div className="absolute top-0 right-0 text-xs text-gray-500 -mt-1">
            {level.progressPercentage.toFixed(0)}%
          </div>
        </div>

        {/* Hint Text */}
        <div className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          {level.percentage > 161.80 ? (
            <p className="text-amber-600 dark:text-amber-400">
              <strong>Warning:</strong> {symbol} has already delivered {level.progressPercentage.toFixed(2)}% 
              ({(level.progressPercentage / 100).toFixed(2)}x) this cycle assuming you accumulated early at 
              the accumulation stages (Level 0.00%-78.00%). The market is getting over-extended, and the risk 
              of market cycle top is imminent. It may not reach this price prediction of ${level.price.toLocaleString()} 
              before the current market cycle tops out and starts declining - Always DYOR (Do Your Own Research).
            </p>
          ) : (
            <p>
              <strong>Hint:</strong> If you acquire {symbol} at the current price (${fibResults.currentPrice.toLocaleString()}), 
              it can potentially increase by {percentToGo.toFixed(2)}% to reach this target (${level.price.toLocaleString()}), 
              which is equivalent to a {multiplier}x {symbol} price prediction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
})}
                </div>

                {/* Prediction Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Prediction Summary</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Based on the 2021 Market Cycle ATH of ${fibResults.pmcATH.toLocaleString()}
                        and current cycle's ATL of ${fibResults.cmcATL.toLocaleString()},
                        {symbol} is predicted to reach between ${fibResults.cmcATH.min.toLocaleString()}
                        and ${fibResults.cmcATH.max.toLocaleString()} by 2025.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Last updated: {formatDistanceToNow(new Date(fibResults.lastUpdated))} ago
                        <br />
                        Prediction started: {new Date(fibResults.predictionStartDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Prediction;