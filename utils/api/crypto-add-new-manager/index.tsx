// /utils/api/crypto-add-new-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { checkExistingAssets } from './pre-checks';

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

interface HistoricalDataResponse {
    success: boolean;
    data: HistoricalDataPoint[];
    TimeTo: number;
    BeforeTimeTo: number;
    error?: string;
}

interface AddNewResults {
    newAssetsAdded: number;
    newDataPointsAdded: number;
    successfulAssets: string[];
    failedAssets: { symbol: string; reason: string }[];
    preflightInfo?: any;
}

interface AddNewOptions {
    signal: AbortSignal;
    onProgress: (current: number, total: number) => void;
    onStatusUpdate: (status: string) => void;
    symbolsList: string[];
    namesList: string[];
    onPreflightComplete?: (results: AddNewResults) => Promise<boolean>;
}


export async function addNewCryptoAssets(options: AddNewOptions): Promise<AddNewResults> {
    const {
        signal,
        onProgress,
        onStatusUpdate,
        symbolsList,
        namesList,
        onPreflightComplete
    } = options;

    const supabase = createClient();
    const results: AddNewResults = {
        newAssetsAdded: 0,
        newDataPointsAdded: 0,
        successfulAssets: [],
        failedAssets: []
    };

    try {
        // Step 1: Check existing assets
        onStatusUpdate('Checking for existing assets...');
        const preflightInfo = await checkExistingAssets(symbolsList);
        results.preflightInfo = preflightInfo;

        if (preflightInfo.existingAssets.length > 0) {
            onStatusUpdate(`Found ${preflightInfo.existingAssets.length} existing assets that will be skipped`);
        }

        // Step 2: Wait for user confirmation
        if (onPreflightComplete) {
            const shouldContinue = await onPreflightComplete(results);
            if (!shouldContinue) {
                onStatusUpdate('Operation cancelled by user');
                return results;
            }
        }

        // Step 3: Process new assets
        const newAssets = preflightInfo.newAssets;
        for (let i = 0; i < newAssets.length; i++) {
            if (signal.aborted) break;

            const symbol = newAssets[i];
            const name = namesList[symbolsList.indexOf(symbol)] || symbol;
            
            onProgress(i + 1, newAssets.length);
            onStatusUpdate(`Processing ${symbol} (${i + 1}/${newAssets.length})`);

            try {
                // Fetch historical data first
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);
                const data = await response.json();

                if (!data.success || !data.data || data.data.length === 0) {
                    results.failedAssets.push({
                        symbol,
                        reason: 'Failed to fetch historical data'
                    });
                    continue;
                }

                // Start transaction
                const { data: newAsset, error: createError } = await supabase
                    .from('crypto_assets')
                    .insert([{
                        symbol: symbol,
                        name: name,
                        decimals: 8,
                        time_to: data.TimeTo,
                        before_time_to: data.BeforeTimeTo
                    }])
                    .select('id')
                    .single();

                if (createError || !newAsset) {
                    results.failedAssets.push({
                        symbol,
                        reason: `Failed to create asset: ${createError?.message}`
                    });
                    continue;
                }

                // Insert historical data points
                const historicalData = data.data;
                for (const point of historicalData) {
                    const { error: insertError } = await supabase
                        .from('crypto_assets_historical_prices')
                        .insert({
                            crypto_id: newAsset.id,
                            timestamp: point.time,
                            open: point.open,
                            high: point.high,
                            low: point.low,
                            close: point.close,
                            volumefrom: point.volumefrom,
                            volumeto: point.volumeto,
                            conversiontype: point.conversionType || 'direct',
                            conversionsymbol: point.conversionSymbol || 'USD'
                        });

                    if (insertError) {
                        throw new Error(`Failed to insert historical data: ${insertError.message}`);
                    }
                    results.newDataPointsAdded++;
                }

                results.newAssetsAdded++;
                results.successfulAssets.push(symbol);

            } catch (error) {
                results.failedAssets.push({
                    symbol,
                    reason: error instanceof Error ? error.message : 'Unknown error'
                });
            }

            // Add delay between processing
            if (i < newAssets.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        return results;
    } catch (error) {
        if (signal.aborted) throw new Error('Operation was aborted');
        throw error;
    }
}