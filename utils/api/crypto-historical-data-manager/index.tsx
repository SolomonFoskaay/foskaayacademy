// /utils/api/crypto-historical-data-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { cryptoSymbols, cryptoNames } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';
import { getBTCLatestTimeTo, findAssetsToUpdate } from './pre-checks';

interface UpdateResults {
    newAssetsAdded: number;
    newDataPointsAdded: number;
    errors: string[];
    preflightInfo?: {
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
    };
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
        errors: []
    };

    try {
        // Step 1: Get BTC latest timestamp
        onStatusUpdate('Making preflight test call to API for BTC TimeTo...');
        const btcCheck = await getBTCLatestTimeTo();
        
        onStatusUpdate(`Comparing BTC timestamps:
            API Time: ${new Date(btcCheck.apiTime).toLocaleString()}
            DB Time: ${new Date(btcCheck.dbTime).toLocaleString()}
            Using: ${btcCheck.source.toUpperCase()} timestamp as benchmark`);

        // Step 2: Find assets that need updating
        onStatusUpdate('Scanning database for assets that need updating...');
        const assetsToUpdate = await findAssetsToUpdate(btcCheck.latestTimeTo, symbolsList);

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
        let selectedSymbols = [...assetsToUpdate.newAssets, ...assetsToUpdate.existingNeedUpdate];
        if (count < selectedSymbols.length) {
            selectedSymbols = fromTop 
                ? selectedSymbols.slice(0, count)
                : selectedSymbols.slice(-count);
        }

        onProgress(0, selectedSymbols.length);
        onStatusUpdate('Starting update process...');

        // Process each symbol
        for (let i = 0; i < selectedSymbols.length; i++) {
            if (signal.aborted) throw new Error('Operation was aborted');
            while (isPaused()) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (signal.aborted) throw new Error('Operation was aborted');
            }

            const symbol = selectedSymbols[i];
            onProgress(i + 1, selectedSymbols.length);
            onStatusUpdate(`Processing ${symbol} (${i + 1}/${selectedSymbols.length})`);

            try {
                // Get or create asset
                const { data: existingAsset } = await supabase
                    .from('crypto_assets')
                    .select('id')
                    .eq('symbol', symbol)
                    .single();

                let assetId: number;
                if (!existingAsset) {
                    const symbolIndex = symbolsList 
                        ? symbolsList.indexOf(symbol)
                        : cryptoSymbols.indexOf(symbol);
                    
                    const name = symbolsList && namesList 
                        ? namesList[symbolIndex]
                        : cryptoNames[symbolIndex];
        
                    const { data: newAsset, error: createError } = await supabase
                        .from('crypto_assets')
                        .insert([{
                            symbol: symbol,
                            name: name,
                            decimals: 8
                        }])
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

                // Insert historical data in batches
                const historicalData = data.data;
                if (historicalData.length > 0) {
                    onStatusUpdate(`Saving ${historicalData.length} data points for ${symbol}`);

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

                    // Only update last_historical_update
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