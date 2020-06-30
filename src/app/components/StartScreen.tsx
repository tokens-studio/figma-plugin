import * as React from 'react';
import JSON5 from 'json5';
import Heading from './Heading';
import Button from './Button';
import * as defaultJSON from '../presets/default.json';

const StartScreen = ({setActive, setStringTokens}) => {
    const setEmptyTokens = () => {
        setActive('json');
        setStringTokens(JSON5.stringify({}, null, 2));
    };
    const setDefaultTokens = () => {
        setActive('tokens');

        setStringTokens(JSON5.stringify(defaultJSON, null, 2));
    };
    return (
        <div className="my-auto h-auto space-y-4">
            <div>
                <Heading size="small">Welcome to</Heading>
                <Heading>Figma Tokens</Heading>
            </div>
            <div>
                A place to make Tokens A Single Source of Truth. Read more about it{' '}
                <a
                    href="https://blog.prototypr.io/making-design-tokens-a-single-source-of-truth-for-figma-tool-76618abdeb88"
                    target="_blank"
                    rel="noreferrer"
                >
                    here
                </a>
                .
            </div>
            <div className="space-y-2 p-4 bg-gray-300 rounded">
                <p>Seems like you don't have any tokens defined. Start by defining your tokens or use our preset.</p>
                <div className="space-x-2">
                    <Button size="large" variant="secondary" onClick={setEmptyTokens}>
                        Edit JSON
                    </Button>
                    <Button size="large" variant="primary" onClick={setDefaultTokens}>
                        Use Preset
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
