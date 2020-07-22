import * as React from 'react';
import Heading from './Heading';
import Button from './Button';
import {useTokenState} from '../store/TokenContext';

const StartScreen = ({setActive}) => {
    const {setEmptyTokens, setDefaultTokens, setLoading} = useTokenState();
    const onSetEmptyTokens = () => {
        setActive('json');
        setEmptyTokens();
        setLoading(false);
    };
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setDefaultTokens();
        setLoading(false);
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
                    <Button size="large" variant="secondary" onClick={onSetEmptyTokens}>
                        Edit JSON
                    </Button>
                    <Button size="large" variant="primary" onClick={onSetDefaultTokens}>
                        Use Preset
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
