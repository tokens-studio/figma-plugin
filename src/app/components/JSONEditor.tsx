import * as React from 'react';
import JSON5 from 'json5';
import JSONToken from './JSONToken';
import Textarea from './Textarea';
import Tooltip from './Tooltip';
import Heading from './Heading';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';

const supportedProperties = [
    'sizing',
    'spacing',
    'colors',
    'borderRadius',
    'borderWidth',
    'opacity',
    'fontFamilies',
    'fontWeights',
    'fontSizes',
    'lineHeights',
    'typography',
];

const JSONEditor = () => {
    const {tokenData} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [activeToken] = React.useState('options');
    const [openToken, setOpenToken] = React.useState('all');

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };

    return (
        <div className="">
            <div className="border-b border-gray-200">
                <div className="flex flex-col justify-between items-center">
                    <button
                        className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                            openToken === 'all' ? 'opacity-50' : null
                        }`}
                        type="button"
                        onClick={() => {
                            if (openToken === 'all') {
                                setOpenToken('');
                            } else {
                                setOpenToken('all');
                            }
                        }}
                    >
                        <Tooltip label="Alt + Click to collapse all">
                            <div className="p-2 -m-2">
                                {openToken !== 'all' ? (
                                    <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 3L1 0v6l4-3z" fill="currentColor" />
                                    </svg>
                                ) : (
                                    <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 5l3-4H0l3 4z" fill="currentColor" />
                                    </svg>
                                )}
                            </div>
                        </Tooltip>
                        <Heading size="small">All</Heading>
                    </button>
                    {openToken === 'all' && (
                        <div className="flex flex-col p-4 w-full items-center">
                            <Textarea
                                placeholder="Enter JSON"
                                rows={20}
                                hasErrored={tokenData.tokens[activeToken].hasErrored}
                                onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                                value={tokenData.tokens[activeToken].values}
                            />
                            <div className="mt-2 flex justify-between">
                                <div className="space-x-2 flex">
                                    <Button variant="secondary" size="large" onClick={setDefaultTokens}>
                                        Reset to Default
                                    </Button>
                                    <Button variant="secondary" size="large" onClick={setEmptyTokens}>
                                        Clear
                                    </Button>
                                </div>
                                <Button variant="primary" size="large" onClick={handleUpdate}>
                                    Save & update
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {supportedProperties.map((token) => {
                let handleClick = () => {
                    if (openToken === token) {
                        setOpenToken('');
                    } else {
                        setOpenToken(token);
                    }
                };

                return (
                    <div className="border-b border-gray-200" key={token}>
                        <div className="flex flex-col justify-between items-center">
                            <button
                                className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                                    openToken === token ? 'opacity-50' : null
                                }`}
                                type="button"
                                onClick={handleClick}
                            >
                                <Tooltip label="Alt + Click to collapse all">
                                    <div className="p-2 -m-2">
                                        {openToken !== token ? (
                                            <svg
                                                width="6"
                                                height="6"
                                                viewBox="0 0 6 6"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M5 3L1 0v6l4-3z" fill="currentColor" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="6"
                                                height="6"
                                                viewBox="0 0 6 6"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M3 5l3-4H0l3 4z" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
                                </Tooltip>
                                <Heading size="small">{token}</Heading>
                            </button>
                            {openToken === token && <JSONToken token={token} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default JSONEditor;
