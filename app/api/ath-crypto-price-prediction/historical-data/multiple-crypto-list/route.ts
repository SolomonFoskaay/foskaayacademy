// /app/api/ATH-Crypto-Price-Prediction/historical-data/multiple-crypto-list/route.ts
import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';

export async function GET() {
  try {
    if (!CRYPTOCOMPARE_API_KEY) {
      throw new Error('API configuration error');
    }

    // Hardcoded list of symbols
    const symbols = ['BTC', 'ETH', 'XRP', 'USDT', 'SOL', 'BNB', 'DOGE', 'ADA', 'SUI', 'USDC'];
    const promises = symbols.map(async (symbol) => {
      const apiUrl = `${BASE_URL}/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&aggregate=1`;
      const response = await fetch(apiUrl, {
        headers: {
          'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}`);
      }

      const data = await response.json();
      const coinInfo = data.Data.Data[0];

      return {
        symbol,
        name: symbol, // Replace with actual name if available
        marketCap: coinInfo.volumeto,
        currentPrice: coinInfo.close
      };
    });

    const results = await Promise.all(promises);

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