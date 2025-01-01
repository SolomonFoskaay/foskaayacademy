// /components/donor/ATH-Crypto-Price-Prediction/DonorATHCryptoListDisplay.tsx
'use client';
import { useState, useEffect } from 'react';
import { getCurrentList, isSymbolExists } from './DonorATHCryptoList';

interface NewCrypto {
    symbol: string;
    name: string;
}

interface DonorATHCryptoListDisplayProps {
    onNewCryptosChange?: (newCryptos: NewCrypto[]) => void;
    disabled?: boolean;
}

export default function DonorATHCryptoListDisplay({ onNewCryptosChange }: DonorATHCryptoListDisplayProps) {
    const [currentCryptos, setCurrentCryptos] = useState<{ symbols: string[], names: string[] }>({ symbols: [], names: [] });
    const [newCrypto, setNewCrypto] = useState<NewCrypto>({ symbol: '', name: '' });
    const [newCryptos, setNewCryptos] = useState<NewCrypto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCurrentCryptos = async () => {
            const list = await getCurrentList();
            setCurrentCryptos(list);
        };
        loadCurrentCryptos();
    }, []);

    useEffect(() => {
        onNewCryptosChange?.(newCryptos);
    }, [newCryptos, onNewCryptosChange]);

    const handleAddNewCrypto = async () => {
        setError(null);
        
        if (!newCrypto.symbol || !newCrypto.name) {
            setError('Both symbol and name are required');
            return;
        }
    
        // Convert to uppercase for case-insensitive comparison
        const upperSymbol = newCrypto.symbol.toUpperCase();
    
        // First check against current list
        if (currentCryptos.symbols.some(symbol => symbol.toUpperCase() === upperSymbol)) {
            setError(`Symbol ${upperSymbol} already exists in current list`);
            return;
        }
    
        // Then check against new cryptos being added
        if (newCryptos.some(crypto => crypto.symbol.toUpperCase() === upperSymbol)) {
            setError(`Symbol ${upperSymbol} already in new cryptos list`);
            return;
        }
    
        // Finally check against database
        const symbolExists = await isSymbolExists(upperSymbol);
        if (symbolExists) {
            setError(`Symbol ${upperSymbol} already exists in database`);
            return;
        }
    
        setNewCryptos([...newCryptos, { ...newCrypto, symbol: upperSymbol }]);
        setNewCrypto({ symbol: '', name: '' });
    };

    const handleRemoveNewCrypto = (index: number) => {
        const updatedCryptos = newCryptos.filter((_, i) => i !== index);
        setNewCryptos(updatedCryptos);
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">
                Current Cryptocurrencies ({currentCryptos.symbols.length})
            </h2>
            
            <div className="max-h-40 overflow-y-auto bg-gray-900 p-4 rounded-lg mb-6">
                {currentCryptos.symbols.map((symbol, i) => (
                    <span key={symbol} className="inline-block m-1 px-2 py-1 bg-gray-800 rounded">
                        {currentCryptos.names[i]} ({symbol})
                    </span>
                ))}
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-white">Add New Cryptocurrency</h3>
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Symbol (e.g., BTC)"
                        value={newCrypto.symbol}
                        onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value.toUpperCase() })}
                        className="flex-1 p-2 bg-gray-800 rounded text-white"
                    />
                    <input
                        type="text"
                        placeholder="Name (e.g., Bitcoin)"
                        value={newCrypto.name}
                        onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                        className="flex-1 p-2 bg-gray-800 rounded text-white"
                    />
                    <button
                        onClick={handleAddNewCrypto}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mb-4">
                        {error}
                    </div>
                )}

                {newCryptos.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-white">New Cryptocurrencies to Add:</h4>
                        <div className="flex flex-wrap gap-2">
                            {newCryptos.map((crypto, index) => (
                                <div key={index} className="group relative">
                                    <span className="px-2 py-1 bg-blue-900 rounded inline-block">
                                        {crypto.name} ({crypto.symbol})
                                    </span>
                                    <button
                                        onClick={() => handleRemoveNewCrypto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 
                                                 text-white text-xs flex items-center justify-center 
                                                 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}