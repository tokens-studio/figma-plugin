import * as React from 'react';
import Heading from './Heading';
import Button from './Button';
import Callout from './Callout';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../../types/api';

const StartScreen = ({setActive}) => {
    const {storageType} = useTokenState();
    const {setEmptyTokens, setLoading, setLocalApiState} = useTokenDispatch();
    const onSetDefaultTokens = () => {
        setActive('tokens');
        setEmptyTokens();
        setLoading(false);
    };
    const onSetSyncClick = () => {
        setActive('syncsettings');
        setLocalApiState({
            id: storageType.id,
            name: storageType.name,
            provider: storageType.provider,
        });
    };

    return (
        <div className="my-auto h-auto space-y-4 p-4">
            <a href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin" target="_blank" rel="noreferrer">
                <img alt="Figma Tokens Splashscreen" src={require('../assets/tokens-intro.jpg')} />
            </a>
            <Heading>Welcome to Figma Tokens.</Heading>
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
                    Get started
                </Button>
            </div>
            {storageType?.provider !== StorageProviderType.LOCAL && (
                <Callout
                    heading="Remote storage detected"
                    description={`This document is setup with a remote token source on ${storageType.provider}. Ask your team for the credentials, then enter them in the Sync dialog.`}
                    action={{
                        onClick: onSetSyncClick,
                        text: 'Set up sync',
                    }}
                />
            )}
        </div>
    );
};

export default StartScreen;
