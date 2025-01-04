// /utils/api/crypto-add-new-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { checkExistingAssets } from './pre-checks';

// Configuration constants
const BATCH_SIZE = 1000; // Number of records to insert in one batch
const API_DELAY = 250;   // Delay between API calls in milliseconds

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
    selectedAssets?: string[]; // new optional property
}


async function batchInsertHistoricalData(
    supabase: any,
    cryptoId: number,
    historicalData: HistoricalDataPoint[]
): Promise<number> {
    let insertedCount = 0;

    // Split data into batches
    for (let i = 0; i < historicalData.length; i += BATCH_SIZE) {
        const batch = historicalData.slice(i, i + BATCH_SIZE).map(point => ({
            crypto_id: cryptoId,
            timestamp: point.time,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
            volumefrom: point.volumefrom,
            volumeto: point.volumeto,
            conversiontype: point.conversionType || 'direct',
            conversionsymbol: point.conversionSymbol || 'USD'
        }));

        const { error } = await supabase
            .from('crypto_assets_historical_prices')
            .insert(batch);

        if (error) {
            throw new Error(`Failed to insert batch: ${error.message}`);
        }

        insertedCount += batch.length;
    }

    return insertedCount;
}

// /utils/api/crypto-add-new-manager/index.tsx

export async function addNewCryptoAssets(options: AddNewOptions): Promise<AddNewResults> {
    const {
        signal,
        onProgress,
        onStatusUpdate,
        symbolsList,
        namesList,
        selectedAssets,
    } = options;

    const supabase = createClient();
    const results: AddNewResults = {
        newAssetsAdded: 0,
        newDataPointsAdded: 0,
        successfulAssets: [],
        failedAssets: [],
    };

    try {
        // Step 1: Process only selected assets
        const assetsToProcess = selectedAssets || [];
        if (assetsToProcess.length === 0) {
            throw new Error('No assets selected for processing');
        }

        const totalAssets = assetsToProcess.length;
        onStatusUpdate(`Starting to process ${totalAssets} selected assets...`);

        for (let i = 0; i < assetsToProcess.length; i++) {
            if (signal.aborted) break;

            const symbol = assetsToProcess[i];
            const name = namesList[symbolsList.indexOf(symbol)];

            onProgress(i + 1, totalAssets);
            onStatusUpdate(`Processing ${symbol} (${i + 1}/${totalAssets})`);

            try {
                // Fetch historical data
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`);
                const data = await response.json();

                if (!data.success || !data.data || data.data.length === 0) {
                    throw new Error('Failed to fetch historical data');
                }

                // Create asset
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
                    throw new Error(`Failed to create asset: ${createError?.message}`);
                }

                // Insert historical data
                const insertedCount = await batchInsertHistoricalData(
                    supabase,
                    newAsset.id,
                    data.data
                );

                results.newDataPointsAdded += insertedCount;
                results.newAssetsAdded++;
                results.successfulAssets.push(symbol);

            } catch (error) {
                results.failedAssets.push({
                    symbol,
                    reason: error instanceof Error ? error.message : 'Unknown error'
                });
            }

            // Add delay between processing
            if (i < assetsToProcess.length - 1) {
                await new Promise(resolve => setTimeout(resolve, API_DELAY));
            }
        }

        return results;
    } catch (error) {
        console.error('Error in addNewCryptoAssets:', error);
        throw error;
    }
}