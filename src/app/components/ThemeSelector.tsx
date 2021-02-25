import React from 'react';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';

export default function ThemeSelector() {
    const {tokenData, activeTokenSet, usedTokenSet} = useTokenState();
    const {setActiveTokenSet, toggleUsedTokenSet} = useTokenDispatch();

    const totalTokenSets = Object.keys(tokenData.tokens);

    const isUsedTokenSet = (set) => {
        return usedTokenSet.includes(set);
    };

    if (totalTokenSets.length < 2) return null;

    return (
        <div className="flex flex-row gap-2 px-4 pt-2 pb-0">
            {totalTokenSets.map((tokenSet) => (
                <button
                    key={tokenSet}
                    className={`font-bold items-center gap-2 focus:outline-none text-xs flex p-2 rounded border ${
                        activeTokenSet === tokenSet && 'border-blue-500 bg-blue-100'
                    }`}
                    type="button"
                    onClick={() => setActiveTokenSet(tokenSet)}
                >
                    <input
                        type="checkbox"
                        id={`toggle-${tokenSet}`}
                        checked={isUsedTokenSet(tokenSet)}
                        onChange={() => toggleUsedTokenSet(tokenSet)}
                    />
                    {tokenSet}
                </button>
            ))}
        </div>
    );
}
