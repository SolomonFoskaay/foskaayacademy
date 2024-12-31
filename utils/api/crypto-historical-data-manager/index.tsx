// /utils/api/crypto-historical-data-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { cryptoSymbols, cryptoNames } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';
import { getBTCLatestTimeTo, findAssetsToUpdate } from './pre-checks';

// DB Update/Insert: Process in batches
const BATCH_SIZE = 1000; // Number of records to insert in one batch
const DB_PARALLEL_OPS = 5;      // Number of parallel DB operations
// API Calls: Process in batches of 30 symbols
const SYMBOL_BATCH_SIZE = 25;
const API_DELAY = 500;   // Delay between API calls in milliseconds

interface UpdateResults {
    newAssetsAdded: number;
    newDataPointsAdded: number;
    updatedDataPoints: number;
    updatedBeforeTimePoints: number;
    errors: string[];
    processedPoints?: {
        updated: number[];
        inserted: number[];
    };
    preflightInfo?: any;
}

interface UpdateOptions {
    signal: AbortSignal;
    onProgress: (current: number, total: number) => void;
    onStatusUpdate: (status: string) => void;
    isPaused: () => boolean;
    count?: number;
    fromTop?: boolean;
    symbolsList?: string[];
    namesList?: string[];
    onPreflightComplete?: (results: UpdateResults) => Promise<boolean>;
}

// Optimized batch database operations
async function batchUpsertDataPoints(
    supabase: any,
    assetId: number,
    dataPoints: any[],
    isUpdate: boolean
): Promise<number[]> {
    const processed: number[] = [];
    
    for (let i = 0; i < dataPoints.length; i += BATCH_SIZE) {
        const batch = dataPoints.slice(i, i + BATCH_SIZE);
        
        if (isUpdate) {
            // Batch update
            const { error } = await supabase
                .from('crypto_assets_historical_prices')
                .upsert(
                    batch.map(point => ({
                        crypto_id: assetId,
                        timestamp: point.time,
                        open: point.open,
                        high: point.high,
                        low: point.low,
                        close: point.close,
                        volumefrom: point.volumefrom,
                        volumeto: point.volumeto,
                        conversiontype: point.conversionType || 'direct',
                        conversionsymbol: point.conversionSymbol || 'USD'
                    })),
                    { onConflict: ['crypto_id', 'timestamp'] }
                );

            if (!error) {
                processed.push(...batch.map(p => p.time));
            }
        } else {
            // Batch insert
            const { error } = await supabase
                .from('crypto_assets_historical_prices')
                .insert(
                    batch.map(point => ({
                        crypto_id: assetId,
                        timestamp: point.time,
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

            if (!error) {
                processed.push(...batch.map(p => p.time));
            }
        }
    }

    return processed;
}

// Main update function
export async function updateCryptoDatabase(options: UpdateOptions): Promise<UpdateResults> {
    const {
        signal,
        onProgress,
        onStatusUpdate,
        isPaused,
        count = cryptoSymbols.length,
        fromTop = true,
        symbolsList,
        namesList,
        onPreflightComplete
    } = options;

    const supabase = createClient();
    const results: UpdateResults = {
        newAssetsAdded: 0,
        newDataPointsAdded: 0,
        updatedDataPoints: 0,
        updatedBeforeTimePoints: 0,
        errors: []
    };

    try {
        // Step 1: Get BTC latest timestamp (keep existing preflight check)
        onStatusUpdate('Making preflight test call to API for BTC TimeTo...');
        const btcCheck = await getBTCLatestTimeTo();

        onStatusUpdate(`Comparing BTC timestamps:
            API Time: ${new Date(btcCheck.apiTime * 1000).toLocaleString()}
            API Before Time: ${new Date(btcCheck.apiBeforeTime * 1000).toLocaleString()}
            DB Time: ${new Date(btcCheck.dbTime * 1000).toLocaleString()}
            DB Before Time: ${new Date(btcCheck.dbBeforeTime * 1000).toLocaleString()}
            Using: ${btcCheck.source.toUpperCase()} timestamp as benchmark`);

        // Step 2: Find assets to update (keep existing check)
        onStatusUpdate('Scanning database for assets that need updating...');
        const assetsToUpdate = await findAssetsToUpdate(
            btcCheck.latestTimeTo,
            btcCheck.beforeTimeTo,
            symbolsList
        );

        results.preflightInfo = {
            btcCheck,
            assetsToUpdate
        };

        // Step 3: Process selected assets in optimized batches
        const selectedSymbols = [...assetsToUpdate.newAssets, ...assetsToUpdate.existingNeedUpdate]
            .slice(0, count);

        for (let i = 0; i < selectedSymbols.length; i += SYMBOL_BATCH_SIZE) {
            if (signal.aborted) break;

            while (isPaused()) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (signal.aborted) break;
            }

            const batchSymbols = selectedSymbols.slice(i, i + SYMBOL_BATCH_SIZE);
            onProgress(i + batchSymbols.length, selectedSymbols.length);
            onStatusUpdate(`Processing batch ${Math.floor(i/SYMBOL_BATCH_SIZE) + 1} (${batchSymbols.join(', ')})`);

            try {
                // Fetch batch historical data using new batch API
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data/update?symbols=${batchSymbols.join(',')}`);
                const batchData = await response.json();

                if (!batchData.success) {
                    results.errors.push(`Failed to fetch batch data: ${batchData.error}`);
                    continue;
                }

                // Process symbols in parallel
                await Promise.all(
                    batchSymbols.map(async (symbol) => {
                        const data = batchData.results[symbol];
                        if (!data?.success) {
                            results.errors.push(`Error for ${symbol}: ${data?.error || 'Unknown error'}`);
                            return;
                        }

                        try {
                            // Get or create asset
                            const { data: asset, error: assetError } = await supabase
                                .from('crypto_assets')
                                .select('id, time_to, before_time_to')
                                .eq('symbol', symbol)
                                .single();

                            if (assetError && assetError.code !== 'PGRST116') {
                                throw assetError;
                            }

                            let assetId: number;
                            if (!asset) {
                                // Create new asset
                                const { data: newAsset, error: createError } = await supabase
                                    .from('crypto_assets')
                                    .insert([{
                                        symbol: symbol,
                                        name: namesList?.[symbolsList?.indexOf(symbol) ?? -1] || symbol,
                                        time_to: data.TimeTo,
                                        before_time_to: data.BeforeTimeTo
                                    }])
                                    .select('id')
                                    .single();

                                if (createError || !newAsset) {
                                    throw new Error(`Failed to create asset: ${createError?.message}`);
                                }

                                assetId = newAsset.id;
                                results.newAssetsAdded++;
                            } else {
                                assetId = asset.id;
                            }

                            // Process historical data
                            const historicalData = data.data;
                            
                            // Update existing points
                            const updatedPoints = await batchUpsertDataPoints(
                                supabase,
                                assetId,
                                historicalData.filter(point => 
                                    point.time <= btcCheck.dbTime && 
                                    point.time >= btcCheck.dbBeforeTime
                                ),
                                true
                            );
                            results.updatedDataPoints += updatedPoints.length;

                            // Insert new points
                            const newPoints = await batchUpsertDataPoints(
                                supabase,
                                assetId,
                                historicalData.filter(point => 
                                    point.time > btcCheck.dbTime
                                ),
                                false
                            );
                            results.newDataPointsAdded += newPoints.length;

                            // Update asset timestamps
                            await supabase
                                .from('crypto_assets')
                                .update({
                                    time_to: data.TimeTo,
                                    before_time_to: data.BeforeTimeTo,
                                    last_historical_update: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', assetId);

                        } catch (error) {
                            results.errors.push(`Error processing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    })
                );

            } catch (error) {
                results.errors.push(`Error processing batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // Add delay between batches
            if (i + SYMBOL_BATCH_SIZE < selectedSymbols.length) {
                await new Promise(resolve => setTimeout(resolve, API_DELAY));
            }
        }

        return results;

    } catch (error) {
        if (signal.aborted) throw new Error('Operation was aborted');
        results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return results;
    }
}