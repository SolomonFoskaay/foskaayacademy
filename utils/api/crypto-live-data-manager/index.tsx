// /utils/api/crypto-live-data-manager/index.tsx
import { createClient } from '@/utils/supabase/client';
import { checkLivePriceStatus } from './pre-checks';

const CRYPTOCOMPARE_API_KEY = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';
const BATCH_SIZE = 50;

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

        // Step 2: Make single API call for all symbols
        log('Making API call to CryptoCompare');
        onStatusUpdate(`🌐 Fetching live prices for ${symbols.length} cryptocurrencies...`);
        const apiUrl = `${BASE_URL}/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USD`;

        await serverLog('API Request', { url: apiUrl });
        const startTime = Date.now();
        const response = await fetch(apiUrl, {
            headers: {
                'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
            }
        });
        const endTime = Date.now();

        log(`API call completed in ${endTime - startTime}ms`);
        await serverLog('API Response received', { 
            timeMs: endTime - startTime,
            status: response.status 
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data.RAW) {
            throw new Error('Invalid API response format');
        }

        log('Successfully received data from API', {
            symbolsReceived: Object.keys(data.RAW).length
        });

        onStatusUpdate('💫 Processing and updating database in batches...');

        // Step 3: Process symbols in batches
        for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
            if (signal.aborted) {
                log('Update process aborted');
                break;
            }

            while (isPaused()) {
                onStatusUpdate(`⏸️ Update paused at batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 100));
                if (signal.aborted) break;
            }

            const batchSymbols = symbols.slice(i, i + BATCH_SIZE);
            const batchUpdates: CryptoLivePrice[] = [];

            // Prepare batch updates
            for (const symbol of batchSymbols) {
                try {
                    const priceData = data.RAW?.[symbol]?.USD;
                    if (!priceData) {
                        results.errors.push(`No price data available for ${symbol}`);
                        continue;
                    }

                    // Get crypto_id from database
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

            // Perform batch update
            if (batchUpdates.length > 0) {
                const { error } = await supabase
                    .from('crypto_assets_live_prices')
                    .upsert(batchUpdates, {
                        onConflict: 'crypto_id'
                    });

                if (error) {
                    throw error;
                }

                log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`, {
                    processed: batchUpdates.length
                });
            }

            onProgress(i + batchUpdates.length, symbols.length, `Batch ${Math.floor(i / BATCH_SIZE) + 1}`);
            onStatusUpdate(`✅ Processed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(symbols.length / BATCH_SIZE)}`);
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