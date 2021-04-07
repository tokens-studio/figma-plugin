import * as React from 'react';
import {useTokenState, useTokenDispatch, getMergedTokens} from '../store/TokenContext';
import Button from './Button';
import Icon from './Icon';
import Tooltip from './Tooltip';

const Inspector = () => {
    const {selectionValues, tokens, usedTokenSet} = useTokenState();
    const {removeNodeData} = useTokenDispatch();
    const getValue = (value) => {
        return getMergedTokens(tokens, usedTokenSet).find((n) => n.name === value);
    };
    return (
        <div className="space-y-2 p-4">
            <div className="space-y-1">
                {Object.entries(selectionValues)
                    .filter(([, value]) => value !== 'delete')
                    .map(([key, value]) => (
                        <div key={key} className="flex flex-row justify-between items-start">
                            <code className="flex space-x-2 flex-wrap">
                                <div className="font-bold">{key}</div>:{' '}
                                <div className="p-1 bg-gray-700 rounded text-white text-xxs">
                                    ${typeof value === 'string' && value.split('.').join('-')}
                                </div>
                                <div className="text-gray-500 break-all">
                                    {`/* ${JSON.stringify(getValue(value))} */`}
                                </div>
                            </code>
                            <Tooltip label="Remove token from layer" variant="right">
                                <button
                                    className="button button-ghost"
                                    type="button"
                                    onClick={() => removeNodeData(key)}
                                >
                                    <Icon name="trash" />
                                </button>
                            </Tooltip>
                        </div>
                    ))}
            </div>
            {Object.entries(selectionValues).length > 0 ? (
                <Button variant="secondary" onClick={() => removeNodeData()}>
                    Remove all tokens from layer
                </Button>
            ) : (
                <div className="text-sm">No tokens stored on layer</div>
            )}
        </div>
    );
};

export default Inspector;
