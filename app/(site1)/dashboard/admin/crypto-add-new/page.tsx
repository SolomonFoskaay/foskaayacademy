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
}

//Timer Interface
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
    const abortControllerRef = useRef<AbortController | null>(null);
    const [timer, setTimer] = useState<TimerState>({
        startTime: null,
        endTime: null,
        duration: ''
    });

    // Time format duration helper
    const formatDuration = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
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
        const { isAdmin } = await checkAuthAndRole();
        setIsAuthorized(isAdmin);
    };

    const handleNewCryptosChange = (cryptos: { symbol: string, name: string }[]) => {
        setNewCryptos(cryptos);
    };

    const handleAddNew = async () => {
        setIsProcessing(true);
        setError(null);
        setResults(null);
        setPreflightInfo(null);
        setAwaitingConfirmation(false);

        // Start timer
        setTimer({
            startTime: Date.now(),
            endTime: null,
            duration: ''
        });

        abortControllerRef.current = new AbortController();

        try {
            const symbols = newCryptos.map(crypto => crypto.symbol);
            const names = newCryptos.map(crypto => crypto.name);

            const results = await addNewCryptoAssets({
                signal: abortControllerRef.current.signal,
                onProgress: (current, total) => setProgress({ current, total }),
                onStatusUpdate: (message) => setStatus(message),
                symbolsList: symbols,
                namesList: names,
                onPreflightComplete: async (preflightResults) => {
                    setPreflightInfo(preflightResults.preflightInfo);
                    setAwaitingConfirmation(true);

                    // Wait for user confirmation
                    return new Promise((resolve) => {
                        const handleConfirm = (proceed: boolean) => {
                            setAwaitingConfirmation(false);
                            resolve(proceed);
                        };
                        window.confirmPreflight = handleConfirm;
                    });
                }
            });

            setResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            // Stop timer
            setTimer(prev => ({
                ...prev,
                endTime: Date.now(),
                duration: formatDuration(Date.now() - prev.startTime!)
            }));
            setIsProcessing(false);
            setStatus('');
            setProgress({ current: 0, total: 0 });
        }
    };

    const handleConfirmPreflight = (proceed: boolean) => {
        window.confirmPreflight?.(proceed);
    };

    const handleCancel = () => {
        abortControllerRef.current?.abort();
        setIsProcessing(false);
        setStatus('Operation cancelled');
    };

    if (!isAuthorized) {
        return <div>Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <div className="mt-[300px] max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Add New Cryptocurrencies</h1>

                    {/* Current List Display */}
                    <div className="mb-8">
                        <DonorATHCryptoListDisplay onNewCryptosChange={handleNewCryptosChange} />
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-8">
                        <button
                            onClick={handleAddNew}
                            disabled={isProcessing || newCryptos.length === 0}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
                        >
                            Add New Cryptocurrencies
                        </button>

                        {isProcessing && !awaitingConfirmation && (
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Progress Display */}
                    {isProcessing && !awaitingConfirmation && (
                        <div className="mb-8">
                            <div className="mb-4">
                                <div className="h-2 bg-gray-200 rounded">
                                    <div
                                        className="h-full bg-blue-500 rounded"
                                        style={{
                                            width: `${(progress.current / progress.total) * 100}%`
                                        }}
                                    />
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {progress.current} / {progress.total}
                                </div>
                            </div>
                            <div className="text-gray-700">{status}</div>
                        </div>
                    )}

                    {/* Preflight Confirmation */}
                    {awaitingConfirmation && preflightInfo && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
                                <h2 className="text-xl font-bold mb-4">Confirm Operation</h2>
                                <div className="mb-4">
                                    {preflightInfo.existingAssets.length > 0 && (
                                        <div className="mb-2">
                                            <p>Existing assets (will be skipped):</p>
                                            <p className="text-sm text-gray-600 break-all">
                                                {preflightInfo.existingAssets.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                    {preflightInfo.newAssets.length > 0 && (
                                        <div>
                                            <p>New assets to add:</p>
                                            <p className="text-sm text-gray-600 break-all">
                                                {preflightInfo.newAssets.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => handleConfirmPreflight(true)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Proceed
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