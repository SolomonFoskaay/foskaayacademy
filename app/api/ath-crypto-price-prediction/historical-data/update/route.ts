// /app/api/ath-crypto-price-prediction/historical-data/update/route.ts
import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';
const CONCURRENT_REQUESTS = 25; // Maximum parallel API calls
const API_BATCH_DELAY = 500;   // Reduced delay between batches (ms)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbols = searchParams.get('symbols')?.split(',');

        if (!symbols || symbols.length === 0) {
            return NextResponse.json(
                { error: 'No symbols provided' },
                { status: 400 }
            );
        }

        const results: Record<string, any> = {};

        // Process symbols in parallel batches
        for (let i = 0; i < symbols.length; i += CONCURRENT_REQUESTS) {
            const batch = symbols.slice(i, i + CONCURRENT_REQUESTS);
            console.log(`Processing batch ${Math.floor(i/CONCURRENT_REQUESTS) + 1} of ${Math.ceil(symbols.length/CONCURRENT_REQUESTS)}`);

            const promises = batch.map(async (symbol) => {
                const apiUrl = `${BASE_URL}/v2/histoday?fsym=${symbol}&tsym=USD&limit=2000&aggregate=1`;
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`API error for ${symbol}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.Response === 'Error') {
                    throw new Error(`CryptoCompare error for ${symbol}: ${data.Message}`);
                }

                return {
                    symbol,
                    data: {
                        success: true,
                        symbol: symbol,
                        TimeTo: data.TimeTo || data.Data.Data[data.Data.Data.length - 1].time,
                        BeforeTimeTo: data.Data.Data[data.Data.Data.length - 2].time,
                        data: data.Data.Data.map((item: any) => ({
                            time: item.time,
                            open: item.open,
                            high: item.high,
                            low: item.low,
                            close: item.close,
                            volumefrom: item.volumefrom,
                            volumeto: item.volumeto,
                            conversionType: item.conversionType || 'direct',
                            conversionSymbol: item.conversionSymbol || 'USD'
                        }))
                    }
                };
            });

            // Wait for all promises in the batch to settle
            const batchResults = await Promise.allSettled(promises);

            // Process results
            batchResults.forEach((result, index) => {
                const symbol = batch[index];
                if (result.status === 'fulfilled') {
                    results[symbol] = result.value.data;
                } else {
                    results[symbol] = {
                        success: false,
                        error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
                    };
                }
            });

            // Add delay between batches if not the last batch
            if (i + CONCURRENT_REQUESTS < symbols.length) {
                await new Promise(resolve => setTimeout(resolve, API_BATCH_DELAY));
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error in batch-historical-data route:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch historic data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}