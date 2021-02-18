import React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';

export default function ThemeSelector() {
    const {tokenData, activeTokenSet} = useTokenState();
    const {setActiveTokenSet} = useTokenDispatch();

    const totalTokenSets = Object.keys(tokenData.tokens);

    if (totalTokenSets.length < 2) return null;

    return (
        <div className="flex flex-row gap-2 px-4 pt-2 pb-0">
            {totalTokenSets.map((tokenSet) => (
                <button
                    className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                        activeTokenSet === tokenSet && 'border-blue-500 bg-blue-100'
                    }`}
                    type="button"
                    onClick={() => setActiveTokenSet(tokenSet)}
                >
                    {tokenSet}
                </button>
            ))}
        </div>
    );
}
