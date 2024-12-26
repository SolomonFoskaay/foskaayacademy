// /utils/api/crypto-historical-data-manager.tsx
// /utils/api/crypto-historical-data-manager.tsx
import { createClient } from '@/utils/supabase/client';
import { cryptoSymbols, cryptoNames } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';

interface HistoricalDataPoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volumefrom: number;
    volumeto: number;
    conversionType?: string;
    conversionSymbol?: string;
}

interface UpdateResults {
    newAssetsAdded: number;
    newDataPointsAdded: number;
    errors: string[];
    currentOperation: string;
}

interface UpdateOptions {
    signal: AbortSignal;
    onProgress: (current: number, total: number) => void;
    onStatusUpdate: (status: string) => void;
    isPaused: () => boolean;
    count?: number;
    fromTop?: boolean;
    dataPointThreshold: number;
}

interface ExistingCryptoAsset {
    id: number;
    symbol: string;
    name: string;
    data_points_count: number;
}

export async function updateCryptoDatabase(options: UpdateOptions): Promise<UpdateResults> {
    const {
        signal,
        onProgress,
        onStatusUpdate,
        isPaused,
        count = cryptoSymbols.length,
        fromTop = true,
        dataPointThreshold
    } = options;

    const supabase = createClient();
    const results: UpdateResults = {
        newAssetsAdded: 0,
        newDataPointsAdded: 0,
        errors: [],
        currentOperation: ''
    };

    try {
        // First, get all existing crypto assets with their data point counts
        onStatusUpdate('Fetching existing crypto assets...');
        const { data: existingAssets, error: existingAssetsError } = await supabase
            .from('crypto_assets')
            .select('id, symbol, name, data_points_count')
            .order('id');

        if (existingAssetsError) {
            throw new Error(`Failed to fetch existing assets: ${existingAssetsError.message}`);
        }

        // Create a map for quick lookup
        const existingAssetsMap = new Map<string, ExistingCryptoAsset>();
        existingAssets?.forEach(asset => {
            existingAssetsMap.set(asset.symbol, asset);
        });

        // Filter symbols that need updating
        let selectedSymbols = [...cryptoSymbols];
        let selectedNames = [...cryptoNames];

        // Filter out symbols that are up to date
        const symbolsToUpdate = selectedSymbols.filter((symbol, index) => {
            const existingAsset = existingAssetsMap.get(symbol);
            return !existingAsset || existingAsset.data_points_count < dataPointThreshold;
        });

        const namesToUpdate = symbolsToUpdate.map(symbol => {
            const index = cryptoSymbols.indexOf(symbol);
            return cryptoNames[index];
        });

        // Apply count and direction filters
        if (count < symbolsToUpdate.length) {
            if (fromTop) {
                selectedSymbols = symbolsToUpdate.slice(0, count);
                selectedNames = namesToUpdate.slice(0, count);
            } else {
                selectedSymbols = symbolsToUpdate.slice(-count);
                selectedNames = namesToUpdate.slice(-count);
            }
        } else {
            selectedSymbols = symbolsToUpdate;
            selectedNames = namesToUpdate;
        }

        onProgress(0, selectedSymbols.length);
        onStatusUpdate(`Found ${selectedSymbols.length} cryptocurrencies to update`);

        for (let i = 0; i < selectedSymbols.length; i++) {
            if (signal.aborted) throw new Error('Operation was aborted');

            while (isPaused()) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (signal.aborted) throw new Error('Operation was aborted');
            }

            const symbol = selectedSymbols[i];
            const name = selectedNames[i];

            onProgress(i + 1, selectedSymbols.length);
            onStatusUpdate(`Processing ${symbol} (${name})`);

            try {
                // Check if asset exists
                const existingAsset = existingAssetsMap.get(symbol);
                let assetId: number;

                if (!existingAsset) {
                    // Create new asset
                    const { data: newAsset, error: createError } = await supabase
                        .from('crypto_assets')
                        .insert([
                            {
                                symbol: symbol,
                                name: name,
                                decimals: 8
                            }
                        ])
                        .select('id')
                        .single();

                    if (createError) {
                        results.errors.push(`Failed to create asset ${symbol}: ${createError.message}`);
                        continue;
                    }

                    assetId = newAsset.id;
                    results.newAssetsAdded++;
                } else {
                    assetId = existingAsset.id;
                }

                // Fetch historical data
                onStatusUpdate(`Fetching historical data for ${symbol}`);
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);

                if (!response.ok) {
                    results.errors.push(`Failed to fetch data for ${symbol}: ${response.statusText}`);
                    continue;
                }

                const data = await response.json();
                if (!data.success || !data.data) {
                    results.errors.push(`Invalid data returned for ${symbol}`);
                    continue;
                }

                const historicalData = data.data;

                // Data insertion
                if (historicalData.length > 0) {
                    onStatusUpdate(`Saving ${historicalData.length} data points for ${symbol}`);

                    // Insert in batches of 500
                    const batchSize = 500;
                    for (let j = 0; j < historicalData.length; j += batchSize) {
                        const batch = historicalData.slice(j, j + batchSize);
                        const { error: insertError } = await supabase
                            .from('crypto_assets_historical_prices')
                            .insert(
                                batch.map(point => ({
                                    crypto_id: assetId,
                                    timestamp: Math.floor(new Date(point.time).getTime() / 1000),
                                    open: point.open,
                                    high: point.high,
                                    low: point.low,
                                    close: point.close,
                                    volumefrom: point.volumefrom,
                                    volumeto: point.volumeto,
                                    conversiontype: point.conversionType || 'direct',
                                    conversionsymbol: point.conversionSymbol || 'USD'
                                }))
                            );

                        if (insertError) {
                            results.errors.push(`Failed to insert batch for ${symbol}: ${insertError.message}`);
                        } else {
                            results.newDataPointsAdded += batch.length;
                        }
                    }

                    // Update last update timestamp
                    const { error: updateError } = await supabase
                        .from('crypto_assets')
                        .update({ 
                            last_historical_update: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', assetId);

                    if (updateError) {
                        results.errors.push(`Failed to update timestamp for ${symbol}: ${updateError.message}`);
                    }
                }

                // Add delay between requests
                if (i < selectedSymbols.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 250));
                }

            } catch (error) {
                results.errors.push(`Error processing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return results;
    } catch (error) {
        if (signal.aborted) {
            throw new Error('Operation was aborted');
        }
        results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return results;
    }
}