import * as React from 'react';
import ReactPlayer from 'react-player';
import Heading from './Heading';
import Button from './Button';
import {useTokenDispatch} from '../store/TokenContext';

const StartScreen = ({setActive}) => {
    const {setEmptyTokens, setLoading} = useTokenDispatch();
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setEmptyTokens();
        setLoading(false);
    };
    return (
        <div className="my-auto h-auto space-y-4 p-4">
            <a href="https://jansix.at/resources/figma-tokens" target="_blank" rel="noreferrer">
                <ReactPlayer
                    className="w-full rounded overflow-hidden"
                    muted
                    width="100%"
                    height="auto"
                    loop
                    playing
                    url="https://jansix.at/videos/tokens/E7b7fKEjyi.mp4"
                />
            </a>
            <Heading size="small">Welcome to Figma Tokens.</Heading>
            <div className="text-xs">
                With Figma Tokens you&apos;re able to design with a single source of truth. Be it border radii, colors
                that are able to reference one another or spacing units — use dynamic values instead of manually
                updating your designs.
            </div>
            <div className="space-x-2 flex justify-between">
                <Button
                    href="https://jansix.at/resources/figma-tokens?ref=figma-tokens"
                    size="large"
                    variant="secondary"
                >
                    Learn more
                </Button>
                <Button dataCy="configure" size="large" variant="primary" onClick={onSetDefaultTokens}>
                    Configure Tokens
                </Button>
            </div>
        </div>
    );
};

export default StartScreen;
