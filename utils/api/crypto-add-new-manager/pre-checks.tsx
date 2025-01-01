// /utils/api/crypto-add-new-manager/pre-checks.tsx
import { createClient } from '@/utils/supabase/client';

interface PreflightInfo {
    existingAssets: string[];
    newAssets: string[];
    priceInfo: {
        [key: string]: {
            name: string;
            price: number;
        }
    };
}

export async function checkExistingAssets(symbolsList: string[], namesList: string[]): Promise<PreflightInfo> {
    const supabase = createClient();

    // Get all existing assets
    const { data: existingAssets, error } = await supabase
        .from('crypto_assets')
        .select('symbol');

    if (error) {
        throw new Error(`Failed to fetch existing assets: ${error.message}`);
    }

    const existingSymbols = new Set(existingAssets?.map(asset => asset.symbol) || []);
    
    const result: PreflightInfo = {
        existingAssets: [],
        newAssets: [],
        priceInfo: {}
    };

    // Fetch prices for new assets
    for (let i = 0; i < symbolsList.length; i++) {
        const symbol = symbolsList[i];
        const name = namesList[i];

        if (existingSymbols.has(symbol)) {
            result.existingAssets.push(symbol);
        } else {
            result.newAssets.push(symbol);
            
            try {
                // Fetch latest price data with error handling
                const response = await fetch(`/api/ath-crypto-price-prediction/historical-data?symbol=${symbol}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    const latestPrice = data.data[data.data.length - 1].close;
                    result.priceInfo[symbol] = {
                        name: name,
                        price: latestPrice
                    };
                } else {
                    throw new Error('No price data available');
                }
            } catch (error) {
                console.error(`Failed to fetch price for ${symbol}:`, error);
                // Still add the crypto but with price 0
                result.priceInfo[symbol] = {
                    name: name,
                    price: 0
                };
            }
        }
    }

    return result;
}