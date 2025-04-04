// /app/api/ATH-Crypto-Price-Prediction/live-data/route.ts
const CRYPTOCOMPARE_API_KEY = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';
const SYMBOL_BATCH_SIZE = 100; // Adjust this based on average symbol length

export async function POST(request: Request) {
    try {
        const { symbols } = await request.json();

        if (!symbols || !Array.isArray(symbols)) {
            return new Response(JSON.stringify({ error: 'Invalid symbols array' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Process symbols in batches
        const results = { RAW: {} };
        const startTime = Date.now();

        // Split symbols into batches
        for (let i = 0; i < symbols.length; i += SYMBOL_BATCH_SIZE) {
            const batchSymbols = symbols.slice(i, i + SYMBOL_BATCH_SIZE);
            const apiUrl = `${BASE_URL}/pricemultifull?fsyms=${batchSymbols.join(',')}&tsyms=USD`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const batchData = await response.json();
            
            // Merge batch results
            if (batchData.RAW) {
                results.RAW = { ...results.RAW, ...batchData.RAW };
            }
        }

        const endTime = Date.now();
        
        return new Response(JSON.stringify({
            data: results,
            timeMs: endTime - startTime,
            status: 200
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}