// /app/api/ATH-Crypto-Price-Prediction/historical-data/route.ts
import { NextResponse } from 'next/server';

const COINLAYER_API_KEY = process.env.COINLAYER_API_KEY;

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

    if (!COINLAYER_API_KEY) {
      console.error('COINLAYER_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Get dates
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = '2024-12-05';

    // Construct the API URL
    // Multiple date timeframe api call url
    const apiUrl = `http://api.coinlayer.com/timeframe` +
      `?access_key=${COINLAYER_API_KEY}` +
      `&start_date=${startDate}` +
      `&end_date=${endDate}` +
      `&symbols=${symbol}`;
      
      // Single date api call url
      // const apiUrl = `http://api.coinlayer.com/` +
      // `${endDate}` +
      // `?access_key=${COINLAYER_API_KEY}` +
      // `&symbols=${symbol}`; 

    console.log('Fetching from Coinlayer:', apiUrl.replace(COINLAYER_API_KEY, 'HIDDEN_KEY'));
console.log('Date:', endDate)

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coinlayer API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Coinlayer API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Coinlayer API returned error:', data.error);
      return NextResponse.json(
        { error: data.error?.info || 'Failed to fetch data' },
        { status: 400 }
      );
    }

    console.log('Successfully fetched data for:', symbol);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in historical-data route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Coinlayer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}