// /utils/api/crypto-historical-data-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { cryptoSymbols, cryptoNames } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';
import { getBTCLatestTimeTo, findAssetsToUpdate } from './pre-checks';

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

// Update existing data points
async function updateDataPoint(supabase: any, assetId: number, timestamp: number, dataPoint: any): Promise<{ action: 'updated' | 'inserted', timestamp: number }> {
    // First check if the point exists
    const { data: existing, error: checkError } = await supabase
        .from('crypto_assets_historical_prices')
        .select('*')
        .eq('crypto_id', assetId)
        .eq('timestamp', timestamp)
        .single();

    console.log(`Checking point for asset ${assetId} at timestamp ${timestamp}:`, existing ? 'exists' : 'not found');

    if (existing) {
        console.log(`Updating existing point for asset ${assetId} at timestamp ${timestamp}`);
        console.log('Current values:', existing);
        console.log('New values:', dataPoint);

        // Update existing point
        const { error: updateError } = await supabase
            .from('crypto_assets_historical_prices')
            .update({
                open: dataPoint.open,
                high: dataPoint.high,
                low: dataPoint.low,
                close: dataPoint.close,
                volumefrom: dataPoint.volumefrom,
                volumeto: dataPoint.volumeto,
                conversiontype: dataPoint.conversionType || 'direct',
                conversionsymbol: dataPoint.conversionSymbol || 'USD'
            })
            .eq('crypto_id', assetId)
            .eq('timestamp', timestamp);

        if (updateError) {
            console.error(`Error updating point:`, updateError);
            throw updateError;
        }

        // Verify the update
        const { data: updated } = await supabase
            .from('crypto_assets_historical_prices')
            .select('*')
            .eq('crypto_id', assetId)
            .eq('timestamp', timestamp)
            .single();

        console.log(`Updated values:`, updated);
        return { action: 'updated', timestamp };
    } else {
        console.log(`Inserting new point for asset ${assetId} at timestamp ${timestamp}`);

        // Insert new point
        const { error: insertError } = await supabase
            .from('crypto_assets_historical_prices')
            .insert({
                crypto_id: assetId,
                timestamp: timestamp,
                open: dataPoint.open,
                high: dataPoint.high,
                low: dataPoint.low,
                close: dataPoint.close,
                volumefrom: dataPoint.volumefrom,
                volumeto: dataPoint.volumeto,
                conversiontype: dataPoint.conversionType || 'direct',
                conversionsymbol: dataPoint.conversionSymbol || 'USD'
            });

        if (insertError) {
            console.error(`Error inserting point:`, insertError);
            throw insertError;
        }

        return { action: 'inserted', timestamp };
    }
}

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
        // Step 1: Get BTC latest timestamp
        onStatusUpdate('Making preflight test call to API for BTC TimeTo...');
        const btcCheck = await getBTCLatestTimeTo();

        onStatusUpdate(`Comparing BTC timestamps:
            API Time: ${new Date(btcCheck.apiTime).toLocaleString()}
            API Before Time: ${new Date(btcCheck.apiBeforeTime * 1000).toLocaleString()}
            DB Time: ${new Date(btcCheck.dbTime).toLocaleString()}
            DB Before Time: ${new Date(btcCheck.dbBeforeTime * 1000).toLocaleString()}
            Using: ${btcCheck.source.toUpperCase()} timestamp as benchmark`);

        // Step 2: Find assets that need updating
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

        const totalToUpdate = assetsToUpdate.existingNeedUpdate.length + assetsToUpdate.newAssets.length;
        onStatusUpdate(`Found ${totalToUpdate} assets to process:
            - ${assetsToUpdate.newAssets.length} new assets to add
            - ${assetsToUpdate.existingNeedUpdate.length} existing assets to update
            
            New assets: ${assetsToUpdate.newAssets.join(', ')}
            Updates needed: ${assetsToUpdate.existingNeedUpdate.join(', ')}`);

        // Step 3: Wait for user confirmation
        if (onPreflightComplete) {
            const shouldContinue = await onPreflightComplete(results);
            if (!shouldContinue) {
                onStatusUpdate('Update cancelled by user');
                return results;
            }
        }

        // Step 4: Process selected assets
        // Process the assets
        const selectedSymbols = [...assetsToUpdate.newAssets, ...assetsToUpdate.existingNeedUpdate]
            .slice(0, count);

        for (let i = 0; i < selectedSymbols.length; i++) {
            if (signal.aborted) break;
            while (isPaused()) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (signal.aborted) break;
            }

            const symbol = selectedSymbols[i];
            onProgress(i + 1, selectedSymbols.length);
            onStatusUpdate(`Processing ${symbol} (${i + 1}/${selectedSymbols.length})`);

            try {
                // Get or create crypto asset
                const name = namesList?.[i] ??
                    cryptoNames[cryptoSymbols.indexOf(symbol)] ??
                    symbol;

                let assetId: number;

                if (assetsToUpdate.newAssets.includes(symbol)) {
                    // Create new asset
                    const { data: newAsset, error: createError } = await supabase
                        .from('crypto_assets')
                        .insert([{
                            symbol: symbol,
                            name: name,
                            decimals: 8,
                            time_to: btcCheck.latestTimeTo,
                            before_time_to: btcCheck.beforeTimeTo
                        }])
                        .select('id')
                        .single();

                    if (createError || !newAsset) {
                        results.errors.push(`Failed to create asset ${symbol}: ${createError?.message}`);
                        continue;
                    }

                    assetId = newAsset.id;
                    results.newAssetsAdded++;
                } else {
                    // Get existing asset
                    const { data: existingAsset, error: getError } = await supabase
                        .from('crypto_assets')
                        .select('id')
                        .eq('symbol', symbol)
                        .single();

                    if (getError || !existingAsset) {
                        results.errors.push(`Failed to get asset ${symbol}: ${getError?.message}`);
                        continue;
                    }

                    assetId = existingAsset.id;
                }

                // Fetch historical data from API
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);
                const data = await response.json();

                if (!data.success || !data.data) {
                    results.errors.push(`Invalid data returned for ${symbol}`);
                    continue;
                }

                // Process historical data
                const historicalData = data.data;
                if (historicalData.length > 0) {
                    onStatusUpdate(`Processing ${historicalData.length} data points for ${symbol}`);

                    // In the main processing logic
                    console.log('DB Times:', {
                        before: btcCheck.dbBeforeTime,  // DB before_time_to
                        latest: btcCheck.dbTime         // DB time_to
                    });

                    console.log('API Times:', {
                        before: btcCheck.apiBeforeTime,
                        latest: btcCheck.apiTime
                    });

                    // First, update the last two days' data if they exist
                    const dbTimestampsToUpdate = [btcCheck.dbBeforeTime, btcCheck.dbTime]; // Always use DB timestamps for updates // Order matters
                    const updatedTimestamps: number[] = [];
                    const insertedTimestamps: number[] = [];

                    console.log('Processing last two timestamps:', dbTimestampsToUpdate);

                    // First, update existing DB timestamps
                    for (const timestamp of dbTimestampsToUpdate) {
                        const dataPoint = historicalData.find(point => point.time === timestamp);
                        if (dataPoint) {
                            try {
                                console.log(`Processing DB timestamp ${timestamp} for ${symbol}`);
                                const result = await updateDataPoint(supabase, assetId, timestamp, dataPoint);

                                if (result.action === 'updated') {
                                    results.updatedDataPoints++;
                                    updatedTimestamps.push(result.timestamp);
                                    console.log(`Successfully updated data point at ${timestamp}`);
                                }
                            } catch (error) {
                                console.error(`Error processing timestamp ${timestamp}:`, error);
                                results.errors.push(`Failed to process data point for ${symbol} at ${timestamp}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                        } else {
                            console.log(`No data point found for timestamp ${timestamp}`);
                        }
                    }

                    // Then find new timestamps after DB time_to for insertion
                    const newDataPoints = historicalData.filter(point => {
                        const isAfterDbLatest = point.time > btcCheck.dbTime;  // Must be after DB time_to
                        const isNotDbTimestamp = !dbTimestampsToUpdate.includes(point.time);  // Must not be a DB timestamp
                        return isAfterDbLatest && isNotDbTimestamp;
                    });

                    console.log(`Found ${newDataPoints.length} new timestamps after DB time_to ${btcCheck.dbTime} to insert`);

                    // Process new timestamps for insertion
                    if (newDataPoints.length > 0) {
                        for (const point of newDataPoints) {
                            try {
                                console.log(`Inserting new timestamp ${point.time} for ${symbol}`);
                                const result = await updateDataPoint(supabase, assetId, point.time, point);
                                
                                if (result.action === 'inserted') {
                                    results.newDataPointsAdded++;
                                    insertedTimestamps.push(result.timestamp);
                                    console.log(`Successfully inserted new data point at ${point.time}`);
                                }
                            } catch (error) {
                                console.error(`Error inserting point at ${point.time}:`, error);
                                results.errors.push(`Failed to insert data point for ${symbol} at ${point.time}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                        }
                    }

                    // Add processed timestamps to results for verification
                    results.processedPoints = {
                        updated: updatedTimestamps,
                        inserted: insertedTimestamps
                    };

                    console.log('Final results:', {
                        updatedPoints: updatedTimestamps.length,
                        insertedPoints: insertedTimestamps.length,
                        updatedTimestamps,
                        insertedTimestamps
                    });
                    
                    // Update asset timestamps - only update last historical update time
                    const { error: updateError } = await supabase
                        .from('crypto_assets')
                        .update({
                            last_historical_update: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', assetId);

                    if (updateError) {
                        results.errors.push(`Failed to update timestamps for ${symbol}: ${updateError.message}`);
                    }
                }

                // Add delay between symbols
                if (i < selectedSymbols.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 250));
                }

            } catch (error) {
                results.errors.push(`Error processing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return results;
    } catch (error) {
        if (signal.aborted) throw new Error('Operation was aborted');
        results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return results;
    }
}