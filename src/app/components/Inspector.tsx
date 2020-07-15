import * as React from 'react';
import objectPath from 'object-path';
import {useTokenState} from '../store/TokenContext';

const Inspector = ({tokens, removeTokenValues}) => {
    const {state} = useTokenState();
    const getValue = (value) => {
        return objectPath.get(tokens, value);
    };
    return (
        <div className="space-y-2">
            <div className="space-y-1">
                {Object.entries(state.selectionValues).map(([key, value]) => (
                    <div key={key}>
                        <code className="flex space-x-2">
                            <div style={{fontWeight: 'bold'}}>{key}</div>:{' '}
                            <div className="p-1 bg-gray-700 rounded text-white text-xxs">
                                ${typeof value === 'string' && value.split('.').join('-')}
                            </div>
                            <div className="text-gray-500">{`/* ${getValue(value)} */`}</div>
                        </code>
                    </div>
                ))}
            </div>
            <button className="button" type="button" onClick={removeTokenValues}>
                Remove tokens from layer
            </button>
        </div>
    );
};

export default Inspector;
