// /app/(site1)/dashboard/crypto-historical-data-updater/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { checkAuthAndRole } from '@/utils/verification/verify-admin';
import { updateCryptoDatabase } from '@/utils/api/crypto-historical-data-manager';
import { cryptoSymbols } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';

interface PreflightInfo {
    btcCheck: {
        apiTime: number;
        dbTime: number;
        latestTimeTo: number;
        source: 'api' | 'db';
    };
    assetsToUpdate: {
        existingNeedUpdate: string[];
        newAssets: string[];
    };
}

export default function CryptoHistoricalDataUpdater() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [status, setStatus] = useState<string>('');
    const [cryptoCount, setCryptoCount] = useState<number>(cryptoSymbols.length);
    const [fromTop, setFromTop] = useState<boolean>(true);
    const [preflightInfo, setPreflightInfo] = useState<PreflightInfo | null>(null);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
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
        setPreflightInfo(null);
        setAwaitingConfirmation(false);

        abortControllerRef.current = new AbortController();

        try {
            const results = await updateCryptoDatabase({
                signal: abortControllerRef.current.signal,
                onProgress: (current, total) => setProgress({ current, total }),
                onStatusUpdate: setStatus,
                isPaused: () => isPaused,
                count: cryptoCount,
                fromTop,
                onPreflightComplete: async (results) => {
                    if (results.preflightInfo) {
                        setPreflightInfo(results.preflightInfo);
                        setAwaitingConfirmation(true);

                        return new Promise((resolve) => {
                            const handleConfirm = (confirmed: boolean) => {
                                setAwaitingConfirmation(false);
                                resolve(confirmed);
                            };
                            (window as any).handlePreflightConfirm = handleConfirm;
                        });
                    }
                    return true;
                }
            });

            setResults(results);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
            setIsUpdating(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleConfirmPreflight = (confirmed: boolean) => {
        (window as any).handlePreflightConfirm(confirmed);
    };

    if (!isAuthorized) {
        return <div className="p-4">Not authorized</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <div className="mt-[300px] max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-white">Crypto Historical Data Updater</h1>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-white">Number of Cryptocurrencies</label>
                                <input
                                    type="number"
                                    value={cryptoCount}
                                    onChange={(e) => setCryptoCount(parseInt(e.target.value))}
                                    className="w-full p-2 border rounded bg-gray-800 text-white"
                                    min="1"
                                    max={cryptoSymbols.length}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-white">Processing Direction</label>
                                <select
                                    value={fromTop ? "top" : "bottom"}
                                    onChange={(e) => setFromTop(e.target.value === "top")}
                                    className="w-full p-2 border rounded bg-gray-800 text-white"
                                >
                                    <option value="top">From Top (First coins)</option>
                                    <option value="bottom">From Bottom (Last coins)</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                {!isUpdating ? (
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Update Historical Data
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsPaused(!isPaused)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        >
                                            {isPaused ? "Resume" : "Pause"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Status and Progress */}
                        {isUpdating && (
                            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                                <div className="text-white whitespace-pre-line">{status}</div>
                                <div className="w-full bg-gray-700 rounded-full h-4">
                                    <div
                                        className="bg-blue-500 h-4 rounded-full transition-all"
                                        style={{
                                            width: `${(progress.current / progress.total) * 100}%`
                                        }}
                                    />
                                </div>
                                <div className="text-sm text-gray-300">
                                    {progress.current > 0 && (
                                        <p>Processing {progress.current} of {progress.total}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preflight Results */}
                        {awaitingConfirmation && preflightInfo && (
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <h2 className="text-xl font-bold mb-4 text-white">Preflight Check Results</h2>

                                <div className="space-y-4 text-white">
                                    <div>
                                        <h3 className="font-semibold">BTC Timestamp Check:</h3>
                                        <ul className="list-disc list-inside pl-4">
                                            <li>API TimeTo: {preflightInfo.btcCheck.apiTime}</li>
                                            <li>DB time_to: {preflightInfo.btcCheck.dbTime}</li>
                                            <li>Latest time_to: {preflightInfo.btcCheck.latestTimeTo} (from {preflightInfo.btcCheck.source})</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">Assets to Process:</h3>
                                        <ul className="list-disc list-inside pl-4">
                                            <li>New Assets: {preflightInfo.assetsToUpdate.newAssets.length}</li>
                                            <li>Updates Needed: {preflightInfo.assetsToUpdate.existingNeedUpdate.length}</li>
                                        </ul>
                                    </div>

                                    {(preflightInfo.assetsToUpdate.newAssets.length > 0 ||
                                        preflightInfo.assetsToUpdate.existingNeedUpdate.length > 0) && (
                                            <div className="mt-4">
                                                <h3 className="font-semibold">Asset Details:</h3>
                                                {preflightInfo.assetsToUpdate.newAssets.length > 0 && (
                                                    <div className="mt-2">
                                                        <p>New Assets:</p>
                                                        <p className="text-sm text-gray-300 break-all">
                                                            {preflightInfo.assetsToUpdate.newAssets.join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                                {preflightInfo.assetsToUpdate.existingNeedUpdate.length > 0 && (
                                                    <div className="mt-2">
                                                        <p>Updates Needed:</p>
                                                        <p className="text-sm text-gray-300 break-all">
                                                            {preflightInfo.assetsToUpdate.existingNeedUpdate.join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex space-x-4 mt-4">
                                        <button
                                            onClick={() => handleConfirmPreflight(true)}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Proceed with Update
                                        </button>
                                        <button
                                            onClick={() => handleConfirmPreflight(false)}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-900 text-red-100 rounded-lg border border-red-700">
                                <p className="font-medium">Error:</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Results Display */}
                        {results && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-900 text-green-100 rounded-lg border border-green-700">
                                    <h2 className="font-bold mb-3">Update Results:</h2>
                                    <p>✅ New assets added: {results.newAssetsAdded}</p>
                                    <p>📊 New data points added: {results.newDataPointsAdded}</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}