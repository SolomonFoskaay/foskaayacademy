// /app/(site1)/dashboard/admin/crypto-add-new/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { checkAuthAndRole } from '@/utils/verification/verify-admin';
import { addNewCryptoAssets } from '@/utils/api/crypto-add-new-manager';
import DonorATHCryptoListDisplay from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoListDisplay';

// type declaration for window.confirmPreflight
declare global {
    interface Window {
        confirmPreflight?: (proceed: boolean) => void;
    }
}

interface PreflightInfo {
    existingAssets: string[];
    newAssets: string[];
    priceInfo: {
        [key: string]: {
            name: string;
            price: number;
        }
    };
}

interface TimerState {
    startTime: number | null;
    endTime: number | null;
    duration: string;
}

export default function CryptoAddNew() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [status, setStatus] = useState<string>('');
    const [preflightInfo, setPreflightInfo] = useState<PreflightInfo | null>(null);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
    const [newCryptos, setNewCryptos] = useState<{ symbol: string, name: string }[]>([]);
    const [selectedCryptos, setSelectedCryptos] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [timer, setTimer] = useState<TimerState>({
        startTime: null,
        endTime: null,
        duration: ''
    });

    // Format duration helper
    const formatDuration = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    };

    // Format price helper
    const formatPrice = (price: number): string => {
        if (price === 0) return 'Price unavailable';
        return `$${price < 0.01 ? price.toFixed(10) : price.toLocaleString()}`;
    };

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing && timer.startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const duration = formatDuration(now - timer.startTime!);
                setTimer(prev => ({ ...prev, duration }));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isProcessing, timer.startTime]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { isAdmin } = await checkAuthAndRole();
            setIsAuthorized(isAdmin);
        } catch (error) {
            setError('Failed to verify authorization');
            setIsAuthorized(false);
        }
    };

    // handleStartProcess function
    const handleStartProcess = async () => {
        if (newCryptos.length === 0) {
            setError('No cryptocurrencies to add');
            return;
        }

        try {
            setError(null);
            setAwaitingConfirmation(true);
            setIsProcessing(true);
            setTimer({ startTime: Date.now(), endTime: null, duration: '' });

            const symbolsList = newCryptos.map(crypto => crypto.symbol);
            const namesList = newCryptos.map(crypto => crypto.name);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            // Create a promise to handle the preflight confirmation
            const results = await addNewCryptoAssets({
                signal: controller.signal,
                onProgress: (current, total) => setProgress({ current, total }),
                onStatusUpdate: setStatus,
                symbolsList,
                namesList,
                selectedAssets: selectedCryptos,
                onPreflightComplete: async (results) => {
                    setPreflightInfo(results.preflightInfo);

                    // Initialize selected cryptos with new assets that have prices
                    const assetsWithPrices = results.preflightInfo.newAssets.filter(
                        symbol => results.preflightInfo.priceInfo[symbol]?.price > 0
                    );
                    setSelectedCryptos(assetsWithPrices);

                    // Return a new Promise for the confirmation
                    return new Promise((resolve) => {
                        window.confirmPreflight = (proceed) => {
                            if (proceed) {
                                // Only resolve with true if we have selected cryptos
                                resolve(selectedCryptos.length > 0);
                            } else {
                                resolve(false);
                            }
                            setAwaitingConfirmation(false);
                        };
                    });
                }
            });

            if (results) {
                setResults(results);
                setTimer(prev => ({ ...prev, endTime: Date.now() }));
            }
        } catch (error) {
            console.error('Process error:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
            setAwaitingConfirmation(false);
            abortControllerRef.current = null;
        }
    };

    // Handle selected crypto to start adding to db
    const handleConfirmPreflight = (proceed: boolean) => {
        if (window.confirmPreflight) {
            // Only proceed if we have selected cryptos or if canceling
            if (!proceed || selectedCryptos.length > 0) {
                window.confirmPreflight(proceed);
            } else {
                setError('Please select at least one cryptocurrency to proceed');
            }
        }
    };

    const toggleCryptoSelection = (symbol: string) => {
        setSelectedCryptos(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        );
    };

    if (!isAuthorized) {
        return <div>Checking authorization...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mt-[300px] max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Add New Cryptocurrencies</h1>

                <div className="space-y-6">
                    <DonorATHCryptoListDisplay
                        onNewCryptosChange={setNewCryptos}
                        disabled={isProcessing}
                    />

                    <button
                        onClick={handleStartProcess}
                        disabled={isProcessing || newCryptos.length === 0}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        Add New Cryptocurrencies
                    </button>

                    {/* Processing Status */}
                    {isProcessing && (
                        <div className="mt-4">
                            <p>Processing... {progress.current}/{progress.total}</p>
                            <p>{status}</p>
                        </div>
                    )}

                    {/* Preflight Confirmation Modal */}
                    {awaitingConfirmation && preflightInfo && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">Confirm New Cryptocurrencies</h3>

                                {preflightInfo.existingAssets.length > 0 && (
                                    <div className="mb-4">
                                        <p className="font-semibold text-yellow-500">
                                            These assets already exist and will be skipped:
                                        </p>
                                        <p className="text-sm">
                                            {preflightInfo.existingAssets.join(', ')}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <p className="font-semibold text-green-500 mb-2">
                                        New assets to be added:
                                    </p>
                                    <div className="space-y-2">
                                        {newCryptos
                                            .filter(crypto => preflightInfo.newAssets.includes(crypto.symbol))
                                            .map(crypto => (
                                                <div key={crypto.symbol} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCryptos.includes(crypto.symbol)}
                                                        onChange={() => toggleCryptoSelection(crypto.symbol)}
                                                        className="form-checkbox"
                                                    />
                                                    <span>
                                                        {crypto.name} ({crypto.symbol}): {' '}
                                                        {formatPrice(preflightInfo.priceInfo[crypto.symbol]?.price)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => handleConfirmPreflight(true)}
                                        disabled={selectedCryptos.length === 0}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                    >
                                        Proceed with Selected ({selectedCryptos.length})
                                    </button>
                                    <button
                                        onClick={() => handleConfirmPreflight(false)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timer Display */}
                    <div className="mb-4 text-white">
                        {timer.startTime && (
                            <div className="text-lg">
                                Time Elapsed: {timer.duration}
                                {timer.endTime && (
                                    <span className="ml-2 text-green-400">
                                        (Completed)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Display */}
                    {results && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-900 text-green-100 rounded-lg">
                                <h2 className="font-bold mb-3">Results:</h2>
                                <p>✅ New assets added: {results.newAssetsAdded}</p>
                                <p>📊 Historical data points added: {results.newDataPointsAdded}</p>

                                {results.successfulAssets.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold">Successfully added:</p>
                                        <p className="text-sm break-all">
                                            {results.successfulAssets.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {results.failedAssets.length > 0 && (
                                <div className="p-4 bg-red-900 text-red-100 rounded-lg">
                                    <h2 className="font-bold mb-3">Failed Assets:</h2>
                                    <ul className="list-disc list-inside space-y-1">
                                        {results.failedAssets.map((fail: { symbol: string, reason: string }, index: number) => (
                                            <li key={index}>
                                                {fail.symbol}: {fail.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-900 text-red-100 rounded-lg">
                            <p className="font-medium">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}