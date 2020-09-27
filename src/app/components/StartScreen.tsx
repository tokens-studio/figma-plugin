import * as React from 'react';
import Heading from './Heading';
import Button from './Button';
import {useTokenState} from '../store/TokenContext';

const StartScreen = ({setActive}) => {
    const {setDefaultTokens, setLoading} = useTokenState();
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setDefaultTokens();
        setLoading(false);
    };
    return (
        <div className="my-auto h-auto space-y-4 p-4">
            <Heading size="small">Welcome to Figma Tokens.</Heading>
            <div className="text-xs">
                Making design tokens a single source of truth for designers and developers using Figma. Design tokens
                are an integral part of any design system - this plugin enhances Figma Styles by a variety of other
                features.
            </div>
            <div className="space-x-2 flex justify-between">
                <Button
                    href="https://blog.prototypr.io/making-design-tokens-a-single-source-of-truth-for-figma-tool-76618abdeb88"
                    size="large"
                    variant="secondary"
                >
                    Learn more
                </Button>
                <Button size="large" variant="primary" onClick={onSetDefaultTokens}>
                    Configure Tokens
                </Button>
            </div>
        </div>
    );
};

export default StartScreen;
