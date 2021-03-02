import * as React from 'react';

export default function StorageItem({text, onClick, isActive, isStored}) {
    return (
        <button
            className={`font-bold focus:outline-none text-xs flex p-2 rounded border ${
                isActive ? 'border-blue-500 bg-blue-100' : isStored && 'border-blue-300 bg-blue-100 bg-opacity-50'
            }`}
            type="button"
            onClick={onClick}
        >
            {text}
        </button>
    );
}
