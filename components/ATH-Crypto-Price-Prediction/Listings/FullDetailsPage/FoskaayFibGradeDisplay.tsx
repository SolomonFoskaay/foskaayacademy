// /components/ATH-Crypto-Price-Prediction/Listings/FullDetailsPage/FoskaayFibGradeDisplay.tsx
import React from 'react';
import { FoskaayFibGrade } from '../../../../utils/formulars/FoskaayFibV1';

interface FoskaayFibGradeDisplayProps {
    symbol: string;
    grade: {
        currentGrade: FoskaayFibGrade;
        allGrades: FoskaayFibGrade[];        
    };
    currentPrice: number;
}

const FoskaayFibGradeDisplay: React.FC<FoskaayFibGradeDisplayProps> = ({ symbol, grade, currentPrice }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">FoskaayFib Grade</h3>
            <div className="text-4xl font-bold mb-4" style={{ color: grade.currentGrade.color }}>
                {grade.currentGrade.grade}
            </div>
            
            {/* Grade Scale */}
            <div className="mb-4">
                <div className="h-2 rounded-full flex overflow-hidden">
                    {grade.allGrades.map((g, index) => (
                        <div
                            key={index}
                            className="flex-1 transition-opacity duration-300"
                            style={{
                                backgroundColor: g.color,
                                opacity: g.grade === grade.currentGrade.grade ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-1 text-xs">
                    {grade.allGrades.map((g, index) => (
                        <span
                            key={index}
                            style={{
                                color: g.grade === grade.currentGrade.grade ? g.color : 'currentColor',
                                opacity: g.grade === grade.currentGrade.grade ? 1 : 0.5
                            }}
                        >
                            {g.grade}
                        </span>
                    ))}
                </div>
            </div>

            {/* Grade Description */}
            <p className="text-sm">
                FoskaayFib Grade "{grade.currentGrade.grade}" means that {symbol} at Current Price of ${currentPrice.toLocaleString()} is in a{' '}
                <span className="font-semibold" style={{ color: grade.currentGrade.color }}>
                    {grade.currentGrade.name}
                </span>
                {' '} of 2022-2025 FoskaayFib {symbol} Bull Market Price Prediction!
            </p>
        </div>
    );
};

export default FoskaayFibGradeDisplay;