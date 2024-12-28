// /utils/api/crypto-live-data-manager/pre-checks.tsx
import { createClient } from '@/utils/supabase/client';

interface LivePriceCheckResult {
    existingAssets: string[];
    newAssets: string[];
    lastUpdateTime: number | null;
}

export async function checkLivePriceStatus(symbolsList?: string[]): Promise<LivePriceCheckResult> {
    const supabase = createClient();

    // Get all assets with their live price data
    const { data: existingData, error } = await supabase
        .from('crypto_assets')
        .select(`
            id,
            symbol,
            crypto_assets_live_prices (
                last_updated
            )
        `);

    if (error) {
        throw new Error(`Failed to fetch assets: ${error.message}`);
    }

    const result: LivePriceCheckResult = {
        existingAssets: [],
        newAssets: [],
        lastUpdateTime: null
    };

    // Map existing assets and find which need updates
    const existingMap = new Map(existingData?.map(asset => [asset.symbol, asset]) || []);
    const symbolsToCheck = symbolsList || Array.from(existingMap.keys());

    symbolsToCheck.forEach(symbol => {
        const asset = existingMap.get(symbol);
        if (!asset) {
            result.newAssets.push(symbol);
        } else {
            result.existingAssets.push(symbol);
            // Track the most recent update time
            const updateTime = asset.crypto_assets_live_prices?.[0]?.last_updated;
            if (updateTime && (!result.lastUpdateTime || updateTime > result.lastUpdateTime)) {
                result.lastUpdateTime = updateTime;
            }
        }
    });

    return result;
}