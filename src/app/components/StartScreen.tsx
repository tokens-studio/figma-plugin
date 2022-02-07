import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Heading from './Heading';
import Text from './Text';
import Button from './Button';
import Callout from './Callout';
import { StorageProviderType } from '../../types/api';
import { Dispatch, RootState } from '../store';
import Box from './Box';

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();

  const { storageType } = useSelector((state: RootState) => state.uiState);
  const onSetDefaultTokens = () => {
    dispatch.uiState.setActiveTab('tokens');
    dispatch.tokenState.setEmptyTokens();
  };
  const onSetSyncClick = () => {
    dispatch.uiState.setActiveTab('syncsettings');
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState({
      ...storageType,
      secret: '',
      new: true,
    });
  };

  return (
    <div className="my-auto h-auto space-y-4 p-4">
      <a href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin" target="_blank" rel="noreferrer">
        <img alt="Figma Tokens Splashscreen" src={require('../assets/tokens-intro.jpg')} className="rounded" />
      </a>
      <Box css={{
        display: 'flex', flexDirection: 'column', gap: '$2',
      }}
      >
        <Heading>Welcome to Figma Tokens.</Heading>
        <Text muted>
          With Figma Tokens you&apos;re able to design with a single source of truth. Be it border radii, colors
          that are able to reference one another or spacing units — use dynamic values instead of manually
          updating your designs.
        </Text>
      </Box>
      <div className="space-x-2 flex justify-between">
        <Button
          href="https://docs.tokens.studio?ref=plugin"
          size="large"
          variant="secondary"
        >
          Learn more
        </Button>
        <Button id="button-configure" size="large" variant="primary" onClick={onSetDefaultTokens}>
          Get started
        </Button>
      </div>
      {storageType?.provider !== StorageProviderType.LOCAL && (
        <Callout
          id="callout-action-setupsync"
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
}

export default StartScreen;
