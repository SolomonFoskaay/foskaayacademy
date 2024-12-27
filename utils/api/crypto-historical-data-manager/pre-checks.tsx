// /utils/api/crypto-historical-data-manager/pre-checks.tsx
import { cryptoSymbols } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';
import { createClient } from '@/utils/supabase/client';

interface TimeCheckResult {
    latestTimeTo: number;
    source: 'api' | 'db';
    apiTime: number;
    dbTime: number;
}

interface AssetsToUpdate {
    existingNeedUpdate: string[];
    newAssets: string[];
}

export async function getBTCLatestTimeTo(): Promise<TimeCheckResult> {
    const supabase = createClient();
    
    // 1. Get BTC API time by calling our API route
    const response = await fetch('/api/ath-crypto-price-prediction/historical-data?symbol=BTC');
    if (!response.ok) {
        throw new Error(`Failed to fetch BTC data: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !data.TimeTo === undefined) {
        throw new Error('Invalid or empty data returned from API');
    }

    // Use the TimeTo from our API response
    const apiTime = data.TimeTo;

    // 2. Get raw BTC DB time_to
    const { data: dbAsset } = await supabase
        .from('crypto_assets')
        .select('time_to')
        .eq('symbol', 'BTC')
        .single();

    const dbTime = dbAsset?.time_to || 0;

    // Compare raw timestamps
    const latestTimeTo = apiTime > dbTime ? apiTime : dbTime;
    const source = apiTime > dbTime ? 'api' : 'db';

    return {
        latestTimeTo,
        source,
        apiTime,
        dbTime
    };
}

export async function findAssetsToUpdate(
    latestTimeTo: number,
    symbolsList?: string[]  
): Promise<AssetsToUpdate> {
    const supabase = createClient();
    
    // Get all existing assets
    const { data: existingAssets, error } = await supabase
        .from('crypto_assets')
        .select('symbol, time_to');

    if (error) {
        throw new Error(`Failed to fetch assets: ${error.message}`);
    }

    const existingMap = new Map(existingAssets?.map(asset => [asset.symbol, asset]) || []);
    const result: AssetsToUpdate = {
        existingNeedUpdate: [],
        newAssets: []
    };

    // Use symbolsList if provided, otherwise use cryptoSymbols
    const symbolsToCheck = symbolsList || cryptoSymbols;

    // Simple check: either not in DB or has older timestamp
    symbolsToCheck.forEach(symbol => {
        const existing = existingMap.get(symbol);
        if (!existing) {
            result.newAssets.push(symbol);
        } else if (existing.time_to < latestTimeTo) {
            result.existingNeedUpdate.push(symbol);
        }
    });

    return result;
}