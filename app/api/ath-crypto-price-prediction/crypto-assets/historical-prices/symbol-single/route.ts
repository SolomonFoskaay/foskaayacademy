// /app/api/ATH-Crypto-Price-Prediction/crypto-assets/historical-prices/symbol-single/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();

    // Log the incoming request details
    console.log('Incoming request for symbol:', symbol);

    if (!symbol) {
      console.error('No symbol provided');
      return NextResponse.json(
        { error: 'Cryptocurrency symbol is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // First, get the crypto asset details
    const { data: cryptoAsset, error: assetError } = await supabase
      .from('crypto_assets')
      .select('id, time_to')
      .eq('symbol', symbol)
      .single();

    if (assetError || !cryptoAsset) {
      console.error('Error fetching crypto asset:', assetError?.message);
      return NextResponse.json(
        { error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }

    // Then, get all historical prices for this asset
    const { data: historicalPrices, error: pricesError } = await supabase
      .from('crypto_assets_historical_prices')
      .select('*')
      .eq('crypto_id', cryptoAsset.id)
      .order('timestamp', { ascending: true });

    if (pricesError) {
      console.error('Error fetching historical prices:', pricesError.message);
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: 500 }
      );
    }

    // Transform the data to match the API response format
    const transformedData = {
      success: true,
      symbol: symbol,
      TimeTo: cryptoAsset.time_to, // Use the time_to from crypto_assets table
      data: historicalPrices.map(item => ({
        time: new Date(item.timestamp * 1000).toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volumefrom: item.volumefrom,
        volumeto: item.volumeto,
        conversionType: item.conversiontype || 'direct',
        conversionSymbol: item.conversionsymbol || 'USD'
      }))
    };

    console.log('Successfully fetched data from DB for:', symbol);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in historical-data route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historic data to show this crypto ATH prediction. Kindly reload the page or revisit later',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}