// /utils/api/crypto-historical-data-manager/pre-checks.tsx
import { cryptoSymbols } from '@/components/Donor/ATH-Crypto-Price-Prediction/DonorATHCryptoList';
import { createClient } from '@/utils/supabase/client';

interface TimeCheckResult {
    latestTimeTo: number;
    beforeTimeTo: number;
    source: 'api' | 'db';
    apiTime: number;
    apiBeforeTime: number;
    dbTime: number;
    dbBeforeTime: number;
}

interface AssetsToUpdate {
    existingNeedUpdate: string[];
    newAssets: string[];
}

export async function getBTCLatestTimeTo(): Promise<TimeCheckResult> {
    const supabase = createClient();

    // 1. Get BTC API times by calling our API route
    const response = await fetch('/api/ath-crypto-price-prediction/historical-data?symbol=BTC');
    if (!response.ok) {
        throw new Error(`Failed to fetch BTC data: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !data.data) {
        throw new Error('Invalid or empty data returned from API');
    }

    // Get the last two timestamps from API data
    // Get raw timestamps directly from API response
    const apiTime = data.TimeTo;      // Latest (2000th)
    const apiBeforeTime = data.BeforeTimeTo; // Previous (1999th)

    // 2. Get BTC DB times
    const { data: dbAsset } = await supabase
        .from('crypto_assets')
        .select('time_to, before_time_to')
        .eq('symbol', 'BTC')
        .single();

    const dbTime = dbAsset?.time_to || 0;
    const dbBeforeTime = dbAsset?.before_time_to || 0;

    // Compare timestamps
    const latestTimeTo = apiTime > dbTime ? apiTime : dbTime;
    // const beforeTimeTo = apiBeforeTime > dbBeforeTime ? apiBeforeTime : dbBeforeTime;
    const beforeTimeTo = dbBeforeTime;
    const source = apiTime > dbTime ? 'api' : 'db';

    // Logging raw timestamps
    console.log('API Times:', {
        latest: apiTime,
        before: apiBeforeTime
    });

    console.log('DB Times:', {
        latest: dbTime,
        before: dbBeforeTime
    });

    return {
        latestTimeTo,
        beforeTimeTo,
        source,
        apiTime,
        apiBeforeTime,
        dbTime,
        dbBeforeTime
    };
}

export async function findAssetsToUpdate(
    latestTimeTo: number,
    beforeTimeTo: number,
    symbolsList?: string[]
): Promise<AssetsToUpdate> {
    const supabase = createClient();

    // Get all existing assets
    const { data: existingAssets, error } = await supabase
        .from('crypto_assets')
        .select('symbol, time_to, before_time_to');

    if (error) {
        throw new Error(`Failed to fetch assets: ${error.message}`);
    }

    const existingMap = new Map(existingAssets?.map(asset => [asset.symbol, asset]) || []);
    const result: AssetsToUpdate = {
        existingNeedUpdate: [],
        newAssets: []
    };

    const symbolsToCheck = symbolsList || cryptoSymbols;

    symbolsToCheck.forEach(symbol => {
        const existing = existingMap.get(symbol);
        if (!existing) {
            result.newAssets.push(symbol);
        } else {
            // Check if asset needs update based on either latest or previous time
            const needsLatestUpdate = existing.time_to <= latestTimeTo;
            const needsPreviousUpdate = existing.before_time_to <= beforeTimeTo;

            if (needsLatestUpdate || needsPreviousUpdate) {
                result.existingNeedUpdate.push(symbol);
            }
        }
    });

    return result;
}