// /app/api/ATH-Crypto-Price-Prediction/crypto-assets/historical-prices/symbol-all/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

// Optimized function to fetch historical prices for multiple crypto assets
async function fetchBulkHistoricalPrices(supabase: any, cryptoIds: number[]) {
  let allPricesMap: Record<number, HistoricalPrice[]> = {};
  let lastTimestamp = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('crypto_assets_historical_prices')
      .select('*')
      .in('crypto_id', cryptoIds)
      .gt('timestamp', lastTimestamp)
      .order('timestamp', { ascending: true })
      .limit(batchSize * cryptoIds.length); // Adjust batch size for multiple symbols

    if (error) {
      console.error('Error fetching historical prices batch:', error);
      throw error;
    }

    if (!data || data.length === 0) break;

    // Group prices by crypto_id
    data.forEach(price => {
      if (!allPricesMap[price.crypto_id]) {
        allPricesMap[price.crypto_id] = [];
      }
      allPricesMap[price.crypto_id].push(price);
    });

    if (data.length < batchSize * cryptoIds.length) break;
    
    lastTimestamp = Math.max(...data.map(item => item.timestamp));
  }

  return allPricesMap;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.toUpperCase().split(',');

    if (!symbols || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Cryptocurrency symbols are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get all crypto assets details in one query
    const { data: cryptoAssets, error: assetsError } = await supabase
      .from('crypto_assets')
      .select('id, symbol, time_to')
      .in('symbol', symbols);

    if (assetsError || !cryptoAssets) {
      return NextResponse.json(
        { error: 'Failed to fetch crypto assets' },
        { status: 500 }
      );
    }

    // Get all market cycles in one query
    const cryptoIds = cryptoAssets.map(asset => asset.id);
    const { data: allCyclesData, error: cyclesError } = await supabase
      .from('crypto_assets_market_cycles')
      .select('*')
      .in('crypto_id', cryptoIds);

    if (cyclesError) {
      return NextResponse.json(
        { error: 'Failed to fetch market cycles data' },
        { status: 500 }
      );
    }

    // Get all live prices in one query
    const { data: allLivePrices, error: pricesError } = await supabase
      .from('crypto_assets_live_prices')
      .select('*')
      .in('crypto_id', cryptoIds);

    if (pricesError) {
      return NextResponse.json(
        { error: 'Failed to fetch live prices' },
        { status: 500 }
      );
    }

    // Fetch all historical prices in bulk
    const historicalPricesMap = await fetchBulkHistoricalPrices(supabase, cryptoIds);

    // Transform the data for each symbol
    const transformedData = cryptoAssets.reduce((acc, asset) => {
      const cycles = allCyclesData
        .filter(cycle => cycle.crypto_id === asset.id)
        .reduce((cycleAcc, cycle) => ({
          ...cycleAcc,
          [cycle.cycle_name]: {
            ath: cycle.ath_price,
            ath_time: cycle.ath_time,
            atl: cycle.atl_price,
            atl_time: cycle.atl_time
          }
        }), {});

      const livePrice = allLivePrices.find(price => price.crypto_id === asset.id);
      const historicalPrices = historicalPricesMap[asset.id] || [];

      acc[asset.symbol] = {
        success: true,
        symbol: asset.symbol,
        TimeTo: asset.time_to,
        cycles,
        currentPrice: livePrice?.price || 0,
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

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error in bulk historical-data route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bulk data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}