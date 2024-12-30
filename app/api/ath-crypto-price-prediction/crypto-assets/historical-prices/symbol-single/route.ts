// /app/api/ATH-Crypto-Price-Prediction/crypto-assets/historical-prices/symbol-single/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// interface for historical price data
interface HistoricalPrice {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volumefrom: number;
  volumeto: number;
  conversiontype?: string;
  conversionsymbol?: string;
}

// Helper function to fetch all historical prices with pagination
async function fetchAllHistoricalPrices(supabase: any, cryptoId: number) {
  let allPrices: HistoricalPrice[] = [];
  let lastTimestamp = 0;
  const batchSize = 1000; // Supabase free tier limit per request

  while (true) {
    const { data, error } = await supabase
      .from('crypto_assets_historical_prices')
      .select('*')
      .eq('crypto_id', cryptoId)
      .gt('timestamp', lastTimestamp) // Get records after the last timestamp
      .order('timestamp', { ascending: true })
      .limit(batchSize);

    if (error) {
      console.error('Error fetching historical prices batch:', error);
      throw error;
    }

    if (!data || data.length === 0) break;

    allPrices = [...allPrices, ...data];
    
    // If we got less than the batch size, we've reached the end
    if (data.length < batchSize) break;
    
    // Update the lastTimestamp for the next batch
    lastTimestamp = data[data.length - 1].timestamp;
  }

  console.log(`Retrieved ${allPrices.length} historical price records for crypto_id: ${cryptoId}`);
  return allPrices;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();

    console.log('Incoming request for symbol:', symbol);

    if (!symbol) {
      console.error('No symbol provided');
      return NextResponse.json(
        { error: 'Cryptocurrency symbol is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get the crypto asset details
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

    // Get market cycles data
    const { data: cyclesData, error: cyclesError } = await supabase
      .from('crypto_assets_market_cycles')
      .select('*')
      .eq('crypto_id', cryptoAsset.id);

    if (cyclesError) {
      console.error('Error fetching market cycles:', cyclesError.message);
      return NextResponse.json(
        { error: 'Failed to fetch market cycles data' },
        { status: 500 }
      );
    }

    // Get current price from live prices
    const { data: livePrice, error: livePriceError } = await supabase
      .from('crypto_assets_live_prices')
      .select('price')
      .eq('crypto_id', cryptoAsset.id)
      .single();

    if (livePriceError) {
      console.error('Error fetching live price:', livePriceError.message);
      return NextResponse.json(
        { error: 'Failed to fetch live price data' },
        { status: 500 }
      );
    }

    // Get all historical prices using the pagination helper
    const historicalPrices = await fetchAllHistoricalPrices(supabase, cryptoAsset.id);

    console.log(`Successfully fetched data from DB for: ${symbol}`);

    // Transform the data
    const transformedData = {
      success: true,
      symbol: symbol,
      TimeTo: cryptoAsset.time_to,
      cycles: cyclesData.reduce((acc, cycle) => ({
        ...acc,
        [cycle.cycle_name]: {
          ath: cycle.ath_price,
          ath_time: cycle.ath_time,
          atl: cycle.atl_price,
          atl_time: cycle.atl_time
        }
      }), {}),
      currentPrice: livePrice.price,
      // Keep historical data for charting
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

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in historical-data route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data to show this crypto ATH prediction. Kindly reload the page or revisit later',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}