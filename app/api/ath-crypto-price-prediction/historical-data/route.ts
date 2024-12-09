// /app/api/ATH-Crypto-Price-Prediction/historical-data/route.ts
import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();

    // Log the incoming request details
    console.log('Incoming request for symbol:', symbol);

    //Check API key
    if (!CRYPTOCOMPARE_API_KEY) {
      console.error('CRYPTOCOMPARE_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    if (!symbol) {
      console.error('No symbol provided');
      return NextResponse.json(
        { error: 'Cryptocurrency symbol is required' },
        { status: 400 }
      );
    }


    // Construct the API URL for daily historical data
    // Using histoday endpoint for daily OHLCV data
    const apiUrl = `${BASE_URL}/v2/histoday?` + 
      `fsym=${symbol}` +  // From Symbol (e.g., BTC)
      `&tsym=USD` +       // To Symbol (USD for price in dollars)
      `&limit=2000` +     // Get maximum available daily data points
      `&aggregate=1`;     // 1 day aggregation

    console.log('Fetching from CryptoCompare:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CryptoCompare API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`CryptoCompare API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Response === 'Error') {
      console.error('CryptoCompare API returned error:', data.Message);
      return NextResponse.json(
        { error: data.Message },
        { status: 400 }
      );
    }

    // Transform the data to include proper timestamps
    const transformedData = {
      success: true,
      symbol: symbol,
      data: data.Data.Data.map((item: any) => ({
        time: new Date(item.time * 1000).toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volumefrom,
        marketCap: item.volumeto
      }))
    };

    console.log('Successfully fetched data for:', symbol);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in historical-data route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch historic data to show this crypto ATh prediction. Kindly reload the page or revisit later',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}