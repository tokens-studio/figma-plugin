import * as React from 'react';
import ReactPlayer from 'react-player';
import Heading from './Heading';
import Button from './Button';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../../types/api';

const StartScreen = ({setActive}) => {
    const {storageType} = useTokenState();
    const {setEmptyTokens, setLoading} = useTokenDispatch();
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setEmptyTokens();
        setLoading(false);
    };
    const onSetSyncClick = () => {
        setActive('settings');
    };

    return (
        <div className="my-auto h-auto space-y-4 p-4">
            <a href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin" target="_blank" rel="noreferrer">
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
                    href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin"
                    size="large"
                    variant="secondary"
                >
                    Learn more
                </Button>
                <Button size="large" variant="primary" onClick={onSetDefaultTokens}>
                    Configure Tokens
                </Button>
            </div>
            {storageType?.provider !== StorageProviderType.LOCAL && (
                <div className="space-y-2 border border-gray-300 p-4 rounded">
                    <Heading size="small" keepCase>
                        This document is setup with a remote token source, ask your team for the credentials needed.
                    </Heading>
                    <div className="text-left flex flex-row justify-between">
                        <div className="flex flex-col flex-grow">
                            <div className="text-xxs">
                                <span className="font-bold">Name </span>
                                {storageType.name}
                            </div>
                            <div className="text-xxs text-gray-600">
                                <span className="font-bold">Provider </span>
                                {storageType.provider}
                            </div>
                            <div className="text-xxs text-gray-600">
                                <span className="font-bold">ID </span>
                                {storageType.id}
                            </div>
                        </div>
                        <Button variant="secondary" onClick={onSetSyncClick}>
                            Setup sync
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartScreen;
