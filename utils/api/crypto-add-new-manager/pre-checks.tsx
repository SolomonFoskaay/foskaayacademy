// /utils/api/crypto-add-new-manager/pre-checks.tsx
import { createClient } from '@/utils/supabase/client';

interface PreflightInfo {
    existingAssets: string[];
    newAssets: string[];
}

export async function checkExistingAssets(symbolsList: string[]): Promise<PreflightInfo> {
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
        newAssets: []
    };

    // Categorize symbols
    symbolsList.forEach(symbol => {
        if (existingSymbols.has(symbol)) {
            result.existingAssets.push(symbol);
        } else {
            result.newAssets.push(symbol);
        }
    });

    return result;
}