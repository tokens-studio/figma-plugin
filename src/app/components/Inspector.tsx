import * as React from 'react';
import objectPath from 'object-path';
import {useTokenState} from '../store/TokenContext';
import Button from './Button';

const Inspector = () => {
    const {state, removeNodeData} = useTokenState();
    const getValue = (value) => {
        return objectPath.get(state.tokenData.getMergedTokens(), value);
    };
    return (
        <div className="space-y-2 p-4">
            <div className="space-y-1">
                {Object.entries(state.selectionValues)
                    .filter(([, value]) => value !== 'delete')
                    .map(([key, value]) => (
                        <div key={key}>
                            <code className="flex space-x-2 flex-wrap">
                                <div style={{fontWeight: 'bold'}}>{key}</div>:{' '}
                                <div className="p-1 bg-gray-700 rounded text-white text-xxs">
                                    ${typeof value === 'string' && value.split('.').join('-')}
                                </div>
                                <div className="text-gray-500 break-all">{`/* ${JSON.stringify(
                                    getValue(value)
                                )} */`}</div>
                            </code>
                        </div>
                    ))}
            </div>
            <Button variant="secondary" onClick={removeNodeData}>
                Remove tokens from layer
            </Button>
        </div>
    );
};

export default Inspector;
