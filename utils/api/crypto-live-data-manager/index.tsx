// /utils/api/crypto-live-data-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { checkLivePriceStatus } from './pre-checks';

const BATCH_SIZE = 50; // Increased from 50 to 100 to 200 max
const MAX_CONCURRENT_BATCHES = 10; // Number of parallel batch operations

// Add interface for the price data structure
interface CryptoLivePrice {
    crypto_id: number;
    price: number;
    market_cap: number;
    total_volume_24h: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    last_updated: number;
    image_url: string;
    market: string;
    median_price: number;
    top_tier_volume_24h: number;
    open_24h: number;
    volume_hour: number;
    volume_day: number;
}

interface UpdateLivePricesOptions {
    signal: AbortSignal;
    onProgress: (current: number, total: number, currentSymbol?: string) => void;
    onStatusUpdate: (status: string) => void;
    isPaused: () => boolean;
    symbolsList?: string[];
}

interface UpdateResults {
    newPricesAdded: number;
    pricesUpdated: number;
    errors: string[];
    lastUpdateTime: number;
}

// Add logging function
const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Live Price Update: ${message}`);
    if (data) {
        console.log('Data:', data);
    }
};

// Server-side logging
const serverLog = async (message: string, data?: any) => {
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, data, timestamp: new Date().toISOString() })
        });
    } catch (error) {
        console.error('Failed to log to server:', error);
    }
};

export async function updateLivePrices(options: UpdateLivePricesOptions): Promise<UpdateResults> {
    const { signal, onProgress, onStatusUpdate, isPaused, symbolsList } = options;
    const supabase = createClient();
    const results: UpdateResults = {
        newPricesAdded: 0,
        pricesUpdated: 0,
        errors: [],
        lastUpdateTime: 0
    };

    try {
        // Step 1: Get symbols from database
        log('Starting update process');
        await serverLog('Starting update process');
        onStatusUpdate('📊 Retrieving crypto list from database...');
        const status = await checkLivePriceStatus(symbolsList);
        const symbols = [...status.existingAssets, ...status.newAssets];

        log(`Retrieved ${symbols.length} symbols from database`, {
            existing: status.existingAssets.length,
            new: status.newAssets.length
        });

        if (symbols.length === 0) {
            throw new Error('No cryptocurrencies found to update');
        }

        // Step 2: Make API call through route
        log('Making API call to fetch prices');
        onStatusUpdate(`🌐 Fetching live prices for ${symbols.length} cryptocurrencies...`);
        
        await serverLog('API Request initiated');
        const startTime = Date.now();
        
        const response = await fetch('/api/ath-crypto-price-prediction/live-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symbols })
        });

        const endTime = Date.now();
        log(`API call completed in ${endTime - startTime}ms`);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const { data, timeMs } = await response.json();
        await serverLog('API Response received', { timeMs, status: response.status });

        if (!data.RAW) {
            throw new Error('Invalid API response format');
        }

        log('Successfully received data from API', {
            symbolsReceived: Object.keys(data.RAW).length
        });

        onStatusUpdate('💫 Processing and updating database in parallel batches...');

        // Helper function to process a single batch
        const processBatch = async (batchSymbols: string[]): Promise<number> => {
            const batchUpdates: CryptoLivePrice[] = [];

            for (const symbol of batchSymbols) {
                try {
                    const priceData = data.RAW?.[symbol]?.USD;
                    if (!priceData) {
                        results.errors.push(`No price data available for ${symbol}`);
                        continue;
                    }

                    const { data: asset } = await supabase
                        .from('crypto_assets')
                        .select('id')
                        .eq('symbol', symbol)
                        .single();

                    if (!asset) {
                        results.errors.push(`No database entry found for ${symbol}`);
                        continue;
                    }

                    batchUpdates.push({
                        crypto_id: asset.id,
                        price: priceData.PRICE,
                        market_cap: priceData.CIRCULATINGSUPPLYMKTCAP,
                        total_volume_24h: priceData.VOLUME24HOURTO,
                        high_24h: priceData.HIGH24HOUR,
                        low_24h: priceData.LOW24HOUR,
                        price_change_24h: priceData.CHANGE24HOUR,
                        price_change_percentage_24h: priceData.CHANGEPCT24HOUR,
                        circulating_supply: priceData.CIRCULATINGSUPPLY,
                        total_supply: priceData.SUPPLY,
                        last_updated: priceData.LASTUPDATE,
                        image_url: `https://cryptocompare.com${priceData.IMAGEURL}`,
                        market: priceData.MARKET,
                        median_price: priceData.MEDIAN,
                        top_tier_volume_24h: priceData.TOPTIERVOLUME24HOURTO,
                        open_24h: priceData.OPEN24HOUR,
                        volume_hour: priceData.VOLUMEHOURTO,
                        volume_day: priceData.VOLUMEDAYTO
                    });

                    if (status.existingAssets.includes(symbol)) {
                        results.pricesUpdated++;
                    } else {
                        results.newPricesAdded++;
                    }

                    results.lastUpdateTime = priceData.LASTUPDATE;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    results.errors.push(`Error processing ${symbol}: ${errorMessage}`);
                }
            }

            if (batchUpdates.length > 0) {
                const { error } = await supabase
                    .from('crypto_assets_live_prices')
                    .upsert(batchUpdates, {
                        onConflict: 'crypto_id'
                    });

                if (error) throw error;
                log(`Processed batch of ${batchUpdates.length} records`);
            }

            return batchUpdates.length;
        };

        // Process all batches with parallel execution
        for (let i = 0; i < symbols.length; i += (BATCH_SIZE * MAX_CONCURRENT_BATCHES)) {
            if (signal.aborted) {
                log('Update process aborted');
                break;
            }

            while (isPaused()) {
                onStatusUpdate(`⏸️ Update paused at batch group ${Math.floor(i / (BATCH_SIZE * MAX_CONCURRENT_BATCHES)) + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 100));
                if (signal.aborted) break;
            }

            const batchPromises: Promise<number>[] = [];

            // Create multiple batch promises
            for (let j = 0; j < MAX_CONCURRENT_BATCHES; j++) {
                const startIdx = i + (j * BATCH_SIZE);
                const batchSymbols = symbols.slice(startIdx, startIdx + BATCH_SIZE);

                if (batchSymbols.length > 0) {
                    batchPromises.push(processBatch(batchSymbols));
                }
            }

            // Process batch group in parallel
            try {
                const processedCounts = await Promise.all(batchPromises);
                const totalProcessed = processedCounts.reduce((a, b) => a + b, 0);

                onProgress(
                    Math.min(i + (BATCH_SIZE * MAX_CONCURRENT_BATCHES), symbols.length),
                    symbols.length,
                    `Processed ${totalProcessed} records in parallel`
                );

                onStatusUpdate(`✅ Completed batch group ${Math.floor(i / (BATCH_SIZE * MAX_CONCURRENT_BATCHES)) + 1}`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                log(`Error in batch group: ${errorMessage}`);
                results.errors.push(`Batch error: ${errorMessage}`);
            }
        }

        log('Update process completed', {
            newPrices: results.newPricesAdded,
            updatedPrices: results.pricesUpdated,
            errors: results.errors.length
        });

        onStatusUpdate('✅ Update complete!');
        return results;

    } catch (error) {
        if (signal.aborted) {
            log('Operation cancelled by user');
            onStatusUpdate('🛑 Operation cancelled');
            throw new Error('Operation was aborted');
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log('Update process failed', { error: errorMessage });
        results.errors.push(`General error: ${errorMessage}`);
        onStatusUpdate(`❌ Update failed: ${errorMessage}`);
        return results;
    }
}