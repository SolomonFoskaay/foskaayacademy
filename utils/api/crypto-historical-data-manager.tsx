// /utils/api/crypto-historical-data-manager.tsx
import { createClient } from '@/utils/supabase/client';
import { cryptoSymbols, cryptoNames } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';

// Interface to match API response
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
}

export async function updateCryptoDatabase(options: UpdateOptions): Promise<UpdateResults> {
    const {
        signal,
        onProgress,
        onStatusUpdate,
        isPaused,
        count = cryptoSymbols.length,
        fromTop = true
    } = options;

    const supabase = createClient();
    const results: UpdateResults = {
        newAssetsAdded: 0,
        newDataPointsAdded: 0,
        errors: [],
        currentOperation: ''
    };

    try {
        // Select symbols based on count and direction
        let selectedSymbols = [...cryptoSymbols];
        let selectedNames = [...cryptoNames];

        if (count < cryptoSymbols.length) {
            if (fromTop) {
                selectedSymbols = selectedSymbols.slice(0, count);
                selectedNames = selectedNames.slice(0, count);
            } else {
                selectedSymbols = selectedSymbols.slice(-count);
                selectedNames = selectedNames.slice(-count);
            }
        }

        onProgress(0, selectedSymbols.length);

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
                const { data: existingAsset, error: assetError } = await supabase
                    .from('crypto_assets')
                    .select('id, symbol')
                    .eq('symbol', symbol)
                    .single();

                if (assetError && assetError.code !== 'PGRST116') {
                    results.errors.push(`Error checking asset ${symbol}: ${assetError.message}`);
                    continue;
                }

                // Create asset if it doesn't exist
                let assetId: string;
                if (!existingAsset) {
                    onStatusUpdate(`Creating new asset: ${symbol}`);
                    const { data: newAsset, error: createError } = await supabase
                        .from('crypto_assets')
                        .insert([
                            {
                                symbol,
                                name,
                                decimals: 8,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                last_historical_update: new Date().toISOString()
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

                // Fetch historical data using our API route
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