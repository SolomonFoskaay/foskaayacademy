// /app/(site1)/dashboard/admin/crypto-live-data-updater/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { checkAuthAndRole } from '@/utils/verification/verify-admin';
import { updateLivePrices } from '@/utils/api/crypto-live-data-manager';
import { cryptoNames, cryptoSymbols } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';

interface PreflightInfo {
    totalAssets: number;
    existingAssets: string[];
    newAssets: string[];
    lastUpdateTime: number | null;
}

interface ProgressState {
    current: number;
    total: number;
    currentSymbol?: string;
}

// Timer Interface
interface TimerState {
    startTime: number | null;
    endTime: number | null;
    duration: string;
}

export default function CryptoLivePriceUpdater() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(false);
    const [autoUpdateInterval, setAutoUpdateInterval] = useState(5); // minutes
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [preflightInfo, setPreflightInfo] = useState<PreflightInfo | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const autoUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalOptions = [
        { label: '1 Minute', value: 1 },
        { label: '2 Minutes', value: 2 },
        { label: '3 Minutes', value: 3 },
        { label: '4 Minutes', value: 4 },
        { label: '5 Minutes', value: 5 },
        { label: '10 Minutes', value: 10 },
        { label: '15 Minutes', value: 15 },
        { label: '30 Minutes', value: 30 },
        { label: '45 Minutes', value: 45 },
        { label: '1 Hour', value: 60 },
        { label: '2 Hours', value: 120 }
    ];
    const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [progress, setProgress] = useState<ProgressState>({
        current: 0,
        total: 0,
        currentSymbol: undefined
    });
    const [timer, setTimer] = useState<TimerState>({
        startTime: null,
        endTime: null,
        duration: ''
    });

    // Add format duration helper
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

        if (isUpdating && timer.startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const duration = formatDuration(now - timer.startTime!);
                setTimer(prev => ({ ...prev, duration }));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isUpdating, timer.startTime]);

    // Timer useEffect for countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAutoUpdateEnabled && nextUpdateTime) {
            timer = setInterval(() => {
                const now = new Date();
                const diff = nextUpdateTime.getTime() - now.getTime();
                if (diff <= 0) {
                    setTimeRemaining('Updating...');
                } else {
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    setTimeRemaining(`Next update in: ${minutes}m ${seconds}s`);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isAutoUpdateEnabled, nextUpdateTime]);

    useEffect(() => {
        checkAuth();
        return () => {
            if (autoUpdateTimerRef.current) {
                clearInterval(autoUpdateTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isAutoUpdateEnabled && !autoUpdateTimerRef.current && !isUpdating) {
            handleUpdate(); // Initial update
            autoUpdateTimerRef.current = setInterval(handleUpdate, autoUpdateInterval * 60 * 1000);
        } else if (!isAutoUpdateEnabled && autoUpdateTimerRef.current) {
            clearInterval(autoUpdateTimerRef.current);
            autoUpdateTimerRef.current = null;
        }
    }, [isAutoUpdateEnabled, autoUpdateInterval]);

    const checkAuth = async () => {
        const { isAdmin } = await checkAuthAndRole();
        setIsAuthorized(isAdmin);
    };

    const handleUpdate = async () => {
        if (!isAuthorized || isUpdating) return;

        setIsUpdating(true);
        setError(null);
        setProgress({ current: 0, total: 0, currentSymbol: undefined });

        // Start timer
        setTimer({
            startTime: Date.now(),
            endTime: null,
            duration: ''
        });

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const results = await updateLivePrices({
                signal: controller.signal,
                onProgress: (current, total, currentSymbol) => {
                    setProgress({ current, total, currentSymbol });
                },
                onStatusUpdate: setStatus,
                isPaused: () => isPaused
            });

            setResults(results);

            if (isAutoUpdateEnabled) {
                const next = new Date();
                next.setMinutes(next.getMinutes() + autoUpdateInterval);
                setNextUpdateTime(next);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            // Stop timer
            setTimer(prev => ({
                ...prev,
                endTime: Date.now(),
                duration: formatDuration(Date.now() - prev.startTime!)
            }));
            setIsUpdating(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsUpdating(false);
        if (isAutoUpdateEnabled) {
            setIsAutoUpdateEnabled(false);
        }
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    if (!isAuthorized) {
        return <div className="p-4">Not authorized</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <div className="mt-[300px] max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-white">Crypto Live Price Updater</h1>

                    <div className="space-y-6">
                        {/* Auto-update Controls */}
                        <div className="flex flex-col space-y-4 p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAutoUpdateEnabled}
                                        onChange={(e) => {
                                            setIsAutoUpdateEnabled(e.target.checked);
                                            if (e.target.checked) {
                                                const next = new Date();
                                                next.setMinutes(next.getMinutes() + autoUpdateInterval);
                                                setNextUpdateTime(next);
                                            } else {
                                                setNextUpdateTime(null);
                                            }
                                        }}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                        disabled={isUpdating}
                                    />
                                    <span className="ml-2 text-white">Enable Auto-Update</span>
                                </label>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="text-white">Update Interval:</label>
                                <select
                                    value={autoUpdateInterval}
                                    onChange={(e) => {
                                        const newInterval = parseInt(e.target.value);
                                        setAutoUpdateInterval(newInterval);
                                        if (isAutoUpdateEnabled) {
                                            const next = new Date();
                                            next.setMinutes(next.getMinutes() + newInterval);
                                            setNextUpdateTime(next);
                                        }
                                    }}
                                    className="w-40 p-2 border rounded bg-gray-800 text-white"
                                    disabled={isUpdating}
                                >
                                    {intervalOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isAutoUpdateEnabled && timeRemaining && (
                                <div className="text-sm text-blue-400">
                                    {timeRemaining}
                                </div>
                            )}
                        </div>

                        {/* Assets Overview */}
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 text-white">Assets Overview</h2>
                            <div className="space-y-2 text-gray-300">
                                <p>Total Cryptocurrencies: {cryptoSymbols.length}</p>
                                {preflightInfo && (
                                    <>
                                        <p>Assets with Live Prices: {preflightInfo.existingAssets.length}</p>
                                        <p>Assets Pending First Update: {preflightInfo.newAssets.length}</p>
                                        {preflightInfo.lastUpdateTime && (
                                            <p>Last Database Update: {new Date(preflightInfo.lastUpdateTime * 1000).toLocaleString()}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Assets List */}
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 text-white">Cryptocurrencies</h2>
                            <div
                                className="grid grid-cols-4 gap-2 text-sm text-gray-300"
                                style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: '4px'
                                }}
                            >
                                {cryptoSymbols.map((symbol, index) => {
                                    const name = cryptoNames[symbol] || symbol;
                                    return (
                                        <div
                                            key={index}
                                            className="p-2 bg-gray-800 rounded"
                                            style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {name} ({symbol})
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Manual Controls */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className={`px-4 py-2 rounded ${isUpdating ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white`}
                            >
                                Update Live Prices
                            </button>

                            {isUpdating && (
                                <>
                                    <button
                                        onClick={handlePauseResume}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white"
                                    >
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Progress Section */}
                        {isUpdating && (
                            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                                <div className="text-white whitespace-pre-line">
                                    {status}
                                    {progress.current > 0 && (
                                        <div className="mt-2">
                                            Processing {progress.current} of {progress.total} cryptocurrencies
                                            {progress.currentSymbol && (
                                                <div className="text-sm text-gray-400">
                                                    Currently processing: {progress.currentSymbol}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-4">
                                    <div
                                        className="bg-blue-500 h-4 rounded-full transition-all"
                                        style={{
                                            width: `${(progress.current / progress.total) * 100}%`
                                        }}
                                    />
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
                                <div className="p-4 bg-green-900 text-green-100 rounded-lg border border-green-700">
                                    <h2 className="font-bold mb-3">Update Results:</h2>
                                    <p>✨ New prices added: {results.newPricesAdded}</p>
                                    <p>🔄 Prices updated: {results.pricesUpdated}</p>
                                    <p>⏰ Last update time: {new Date(results.lastUpdateTime * 1000).toLocaleString()}</p>
                                </div>

                                {results.errors?.length > 0 && (
                                    <div className="p-4 bg-yellow-900 text-yellow-100 rounded-lg border border-yellow-700">
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

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-900 text-red-100 rounded-lg">
                                <h2 className="font-semibold">Error:</h2>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}