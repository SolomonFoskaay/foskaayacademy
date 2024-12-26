// /app/(site1)/dashboard/crypto-historical-data-updater/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { checkAuthAndRole } from '@/utils/verification/verify-admin';
import { updateCryptoDatabase } from '@/utils/api/crypto-historical-data-manager';
import { cryptoSymbols } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';

interface ConfigState {
    cryptoCount: number;
    fromTop: boolean;
    dataPointThreshold: number;
}

export default function CryptoHistoricalDataUpdater() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [status, setStatus] = useState<string>('');
    const [cryptoCount, setCryptoCount] = useState<number>(5);
    const [fromTop, setFromTop] = useState<boolean>(true);
    const [dataPointThreshold, setDataPointThreshold] = useState<number>(2001);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { isAdmin } = await checkAuthAndRole();
        setIsAuthorized(isAdmin);
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        setError(null);
        setResults(null);
        setIsPaused(false);
        setStatus('Initializing update...');
        abortControllerRef.current = new AbortController();

        try {
            const results = await updateCryptoDatabase({
                signal: abortControllerRef.current.signal,
                onProgress: (current, total) => setProgress({ current, total }),
                onStatusUpdate: (status) => setStatus(status),
                isPaused: () => isPaused,
                count: cryptoCount,
                fromTop: fromTop,
                dataPointThreshold: dataPointThreshold
            });
            setResults(results);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('Update was stopped');
            } else {
                setError(err.message);
            }
        } finally {
            setIsUpdating(false);
            setIsPaused(false);
            setStatus('');
        }
    };

    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);
    const handleStop = () => {
        abortControllerRef.current?.abort();
        setIsUpdating(false);
        setIsPaused(false);
        setStatus('Operation stopped');
    };

    if (!isAuthorized) {
        return <div className="mt-[200px] p-4">Checking authorization...</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <div className="mt-[300px] max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        Crypto Historical Data Updater
                    </h1>

                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Cryptocurrencies
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={cryptoSymbols.length}
                                value={cryptoCount}
                                onChange={(e) => setCryptoCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), cryptoSymbols.length))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={isUpdating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Highest Data Point Threshold
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={dataPointThreshold}
                                onChange={(e) => setDataPointThreshold(parseInt(e.target.value) || 2001)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={isUpdating}
                                placeholder="e.g., 2001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Processing Direction
                            </label>
                            <select
                                value={fromTop ? 'top' : 'bottom'}
                                onChange={(e) => setFromTop(e.target.value === 'top')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={isUpdating}
                            >
                                <option value="top">From Top (First coin/token)</option>
                                <option value="bottom">From Bottom (Last coin/token)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-8 space-x-4">
                        {!isUpdating ? (
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                                         hover:bg-blue-700 transition-colors font-medium"
                            >
                                Update Historical Data
                            </button>
                        ) : (
                            <>
                                {!isPaused ? (
                                    <button
                                        onClick={handlePause}
                                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg 
                                                 hover:bg-yellow-700 transition-colors font-medium"
                                    >
                                        Pause Update
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleResume}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg 
                                                 hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Resume Update
                                    </button>
                                )}
                                <button
                                    onClick={handleStop}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg 
                                             hover:bg-red-700 transition-colors font-medium"
                                >
                                    Stop Update
                                </button>
                            </>
                        )}
                    </div>

                    {isUpdating && (
                        <div className="mb-6">
                            <div className="h-2 bg-gray-200 rounded-full mb-2">
                                <div 
                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>Processing {progress.current} of {progress.total} cryptocurrencies</p>
                                <p className="mt-1">{isPaused ? "PAUSED - " : ""}{status}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                            <p className="font-medium">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
                                <h2 className="font-bold mb-3">Update Results:</h2>
                                <p>✅ New assets added: {results.newAssetsAdded}</p>
                                <p>📊 New data points added: {results.newDataPointsAdded}</p>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200">
                                    <h2 className="font-bold mb-3">Warnings:</h2>
                                    <ul className="list-disc list-inside space-y-1">
                                        {results.errors.map((error: string, index: number) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}