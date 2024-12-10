// /app/api/ATH-Crypto-Price-Prediction/historical-data/multiple-crypto-list/route.ts
import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';
const IMAGE_BASE_URL = 'https://cryptocompare.com'; // Add this line

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.toUpperCase()) : [];

    if (!CRYPTOCOMPARE_API_KEY || symbols.length === 0) {
      throw new Error('API configuration error or no symbols provided');
    }

    const apiUrl = `${BASE_URL}/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USD`;

    const response = await fetch(apiUrl, {
      headers: {
        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    const results = symbols.map(symbol => {
      const coinInfo = data.RAW[symbol].USD;
      return {
        symbol,
        name: symbol,
        currentPrice: coinInfo.PRICE,
        marketCap: coinInfo.MKTCAP,
        totalVolume24h: coinInfo.TOTALVOLUME24HTO,
        tokenImageURL: `${IMAGE_BASE_URL}${coinInfo.IMAGEURL}`
      };
    });

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in multiple-crypto-list route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data. Please try again later.' },
      { status: 500 }
    );
  }
}