// /components/donor/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/Prediction.tsx
import React from 'react';
import { FoskaayFibResult, FoskaayFibLevel } from '../../../../../utils/formulars/FoskaayFibV1';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import FoskaayFibGradeDisplay from './FoskaayFibGradeDisplay';

interface DonorPredictionProps {
    symbol: string;
    cryptoFullName: string;
    FoskaayFibResults: FoskaayFibResult;
}

const DonorPrediction: React.FC<DonorPredictionProps> = ({ 
    symbol,
    cryptoFullName,
    FoskaayFibResults 
}: DonorPredictionProps) => {
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

    // Helper function to generate level hints
    const getLevelHint = (level: FoskaayFibLevel, currentPrice: number) => {
        if (level.isAchieved) {
            // Calculate increase from this level to current price
            const increase = ((currentPrice - level.price) / level.price) * 100;
            const multiplier = (increase / 100).toFixed(2);

            return (
                <p className="text-sm text-green-600 dark:text-green-400">
                    <strong>Achieved:</strong> If you had acquired {cryptoFullName} at this price target (${level.price.toLocaleString()}),
                    you would have achieved a {Math.abs(increase).toFixed(2)}% increase based on the current price of ${currentPrice.toLocaleString()},
                    which is equivalent to a {multiplier}x Price Increase (PI).
                </p>
            );
        } else if (level.percentage > 161.80) {
            const accumulationLevels = FoskaayFibResults.levels.filter(l =>
                l.percentage <= 78.00 && l.isAchieved
            );

            // Get min and max percentages from accumulation levels
            const minIncrease = Math.min(...accumulationLevels.map(l =>
                ((currentPrice - l.price) / l.price) * 100
            ));
            const maxIncrease = Math.max(...accumulationLevels.map(l =>
                ((currentPrice - l.price) / l.price) * 100
            ));

            const minMultiplier = (minIncrease / 100).toFixed(2);
            const maxMultiplier = (maxIncrease / 100).toFixed(2);

            // Calculate potential increase to target
            const percentToGo = ((level.price - currentPrice) / currentPrice) * 100;
            const multiplier = (percentToGo / 100).toFixed(2);

            return (
                <>
                    <p className="text-sm">
                        <strong>Hint:</strong> If you acquire {cryptoFullName} at the current price (${currentPrice.toLocaleString()}),
                        it can potentially increase by {percentToGo.toFixed(2)}% to reach this target (${level.price.toLocaleString()}),
                        which is equivalent to a {multiplier}x {cryptoFullName} price prediction.
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        <strong>Warning:</strong> {cryptoFullName} has already delivered {minIncrease.toFixed(2)}% - {maxIncrease.toFixed(2)}%
                        ({minMultiplier}x - {maxMultiplier}x) this 2022-2025 crypto market cycle assuming you accumulated early at
                        the accumulation stages (Level 0.00%-78.00%) of FoskaayFib Levels crypto predictions. The market is getting
                        over-extended, and the risk of {cryptoFullName} market cycle top and price crash to prepare for next cycle is imminent.
                        {" "} {cryptoFullName} may not reach this price prediction of ${level.price.toLocaleString()} before the current 2025 market cycle
                        tops out and starts declining - Always DYOR (Do Your Own Research).
                    </p>
                </>
            );
        } else {
            // Regular hint for unachieved levels
            const percentToGo = ((level.price - currentPrice) / currentPrice) * 100;
            const multiplier = (percentToGo / 100).toFixed(2);

            return (
                <p className="text-sm">
                    <strong>Hint:</strong> If you acquire {cryptoFullName} at the current price (${currentPrice.toLocaleString()}),
                    it can potentially increase by {percentToGo.toFixed(2)}% to reach this target (${level.price.toLocaleString()}),
                    which is equivalent to a {multiplier}x {cryptoFullName} price prediction.
                </p>
            );
        }
    };


    return (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6">
                {/* Market Cycle Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            2018-2021 {cryptoFullName} Market Cycle ATH (PMCATH)
                        </h3>
                        <p className="text-xl font-bold text-yellow-600">
                            ${FoskaayFibResults.pmcATH.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            2022-2025 {cryptoFullName} Market Cycle ATL (CMCATL)
                        </h3>
                        <p className="text-xl font-bold text-red-600">
                            ${FoskaayFibResults.cmcATL.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-600 dark:text-gray-400">
                            {cryptoFullName} Current Price
                        </h3>
                        <p className="text-xl font-bold text-green-600">
                            ${FoskaayFibResults.currentPrice.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* ATH Prediction and FoskaayFib Grade Display Grid */}
<div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-8">
  <div className="md:col-span-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
    <h3 className="text-sm text-gray-600 dark:text-gray-400">
      {cryptoFullName} 2025 Predicted ATH (CMCATH)
    </h3>
    <p className="text-xl font-bold text-purple-600">
      ${FoskaayFibResults.cmcATH.min.toLocaleString()} - ${FoskaayFibResults.cmcATH.max.toLocaleString()}
    </p>
  </div>
  <div className="md:col-span-7">
    <FoskaayFibGradeDisplay
      symbol={cryptoFullName}
      grade={FoskaayFibResults.grade}
      currentPrice={FoskaayFibResults.currentPrice}
    />
  </div>
</div>

                {/* Current Zone Indicator */}
                <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ background: getGradient(FoskaayFibResults.currentZone.range[1]) }}>
                    <h3 className="text-lg font-bold mb-2 text-white">
                        2022-2025 Crypto Market Cycle {cryptoFullName} Price Is Currently In {FoskaayFibResults.currentZone.name}
                    </h3>
                    <p className="text-sm text-white/90">
                        {FoskaayFibResults.currentZone.description}
                    </p>
                </div>

                {/* Fibonacci Levels */}
                <h2 className="text-2xl font-bold mb-4">
                    2022-2025 Crypto Market Cycle {cryptoFullName} Price Predictions Based On FoskaayFibonacci Levels
                </h2>

                <div className="space-y-4">
                    {FoskaayFibResults.levels.map((level, index) => {
                        const percentToGo = ((level.price - FoskaayFibResults.currentPrice) / FoskaayFibResults.currentPrice * 100);
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
                                    {getLevelHint(level, FoskaayFibResults.currentPrice)}


                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Prediction Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Prediction Summary</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Based on the 2021 Market Cycle ATH of ${FoskaayFibResults.pmcATH.toLocaleString()}
                        {" "} and current cycle's ATL of ${FoskaayFibResults.cmcATL.toLocaleString()},
                        {" "} {cryptoFullName} is predicted to reach between ${FoskaayFibResults.cmcATH.min.toLocaleString()}
                        {" "} and ${FoskaayFibResults.cmcATH.max.toLocaleString()} by 2025.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Last updated: {formatDistanceToNow(new Date(FoskaayFibResults.lastUpdated))} ago
                        <br />
                        Prediction started: {new Date(FoskaayFibResults.predictionStartDate).toLocaleDateString()}
                        <br />
                        Credit: Crypto Historical Data Poweredby {" "}
                        <Link href="https://www.cryptocompare.com/" target='_blank'>
                            <b>
                                CryptoCompare
                            </b>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DonorPrediction;