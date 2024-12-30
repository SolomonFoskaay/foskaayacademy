// /app/api/ATH-Crypto-Price-Prediction/cyrpto-assets/live-data/symbol-all/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const { searchParams } = new URL(request.url);
        const symbolsParam = searchParams.get('symbols');
        const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.toUpperCase()) : [];

        if (symbols.length === 0) {
            throw new Error('No symbols provided');
        }

        const supabase = createClient();

        // Step 1: Get all crypto assets in a single query
        const { data: cryptoAssets, error: assetsError } = await supabase
            .from('crypto_assets')
            .select('id, symbol')
            .in('symbol', symbols);

        if (assetsError) throw assetsError;
        if (!cryptoAssets || cryptoAssets.length === 0) {
            throw new Error('No matching crypto assets found');
        }

        // Create a map for quick lookup
        const assetMap = new Map(cryptoAssets.map(asset => [asset.symbol, asset.id]));

        // Step 2: Get all live prices in a single query
        const { data: livePrices, error: pricesError } = await supabase
            .from('crypto_assets_live_prices')
            .select('*')
            .in('crypto_id', cryptoAssets.map(asset => asset.id));

        if (pricesError) throw pricesError;
        if (!livePrices) throw new Error('No live prices found');

        // Create a map for quick lookup
        const priceMap = new Map(livePrices.map(price => [price.crypto_id, price]));

        // Format response to match existing API format
        const results = symbols.map(symbol => {
            const assetId = assetMap.get(symbol);
            const priceData = assetId ? priceMap.get(assetId) : null;

            if (!priceData) {
                return {
                    symbol,
                    name: symbol,
                    currentPrice: 'Unknown',
                    marketCap: 'Unknown',
                    totalVolume24h: 'Unknown',
                    tokenImageURL: ''
                };
            }

            return {
                symbol,
                name: symbol,
                currentPrice: priceData.price,
                marketCap: priceData.market_cap > 0 ? priceData.market_cap : 'Unknown',
                totalVolume24h: priceData.total_volume_24h > 0 ? priceData.total_volume_24h : 'Unknown',
                tokenImageURL: priceData.image_url
            };
        });

        return NextResponse.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error in symbol-all route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data. Please try again later.' },
            { status: 500 }
        );
    }
}