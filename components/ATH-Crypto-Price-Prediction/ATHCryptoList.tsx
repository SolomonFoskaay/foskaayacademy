// /components/ATH-Crypto-Price-Prediction/ATHCryptoList.tsx
'use client';
import { createClient } from '@/utils/supabase/client';

// Set limit for non-donor version
const NON_DONOR_LIMIT = 100;

// Initialize with empty arrays
let cryptoSymbols: string[] = [];
let cryptoNames: string[] = [];

// Create a singleton instance to manage the data
const CryptoListManager = {
    isInitialized: false,
    async initialize() {
        if (this.isInitialized) return;

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('crypto_assets')
                .select('symbol, name')
                .order('id')
                .limit(NON_DONOR_LIMIT);

            if (error) {
                console.error('Error fetching crypto assets:', error);
                return;
            }

            // Update the arrays in place to maintain references
            cryptoSymbols.splice(0, cryptoSymbols.length, ...data.map(asset => asset.symbol));
            cryptoNames.splice(0, cryptoNames.length, ...data.map(asset => asset.name));
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to fetch crypto assets:', error);
        }
    }
};

// Immediately initialize when this module is imported
if (typeof window !== 'undefined') {
    CryptoListManager.initialize();
}

// Helper function to check if a symbol exists
export async function isSymbolExists(symbol: string): Promise<boolean> {
    await CryptoListManager.initialize(); // Ensure data is loaded
    return cryptoSymbols.includes(symbol.toUpperCase());
}

// Helper function to get current list
export async function getCurrentList(): Promise<{ symbols: string[], names: string[] }> {
    await CryptoListManager.initialize(); // Ensure data is loaded
    return { symbols: cryptoSymbols, names: cryptoNames };
}

// Export the arrays that will be populated
export { cryptoSymbols, cryptoNames };