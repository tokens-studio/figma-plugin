import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Heading from './Heading';
import Text from './Text';
import Button from './Button';
import Callout from './Callout';
import { StorageProviderType } from '../../types/api';
import { Dispatch } from '../store';
import { storageTypeSelector } from '@/selectors';
import Stack from './Stack';

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();

  const storageType = useSelector(storageTypeSelector);
  const onSetDefaultTokens = () => {
    dispatch.uiState.setActiveTab('tokens');
    dispatch.tokenState.setEmptyTokens();
  };
  const onSetSyncClick = () => {
    dispatch.uiState.setActiveTab('settings');
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState({
      ...storageType,
      secret: '',
      new: true,
    });
  };

  return (
    <div className="h-auto p-4 my-auto content scroll-container">
      <Stack direction="column" gap={4}>
        <a href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin" target="_blank" rel="noreferrer">
          <img alt="Figma Tokens Splashscreen" src={require('../assets/tokens-intro.jpg')} className="rounded" />
        </a>
        <Stack direction="column" gap={2}>
          <Heading>Welcome to Figma Tokens.</Heading>
          <Text muted>
            Design with tokens to apply design decisions to border radii, spacing or many others. Use smart references or math features to change values dynamically or use token sets to quickly create themes. Work across documents by utilizing the Sync feature and store your design tokens on a single source of truth such as GitHub.
          </Text>
        </Stack>
        <Stack direction="row" gap={2} justify="between">
          <Button
            href="https://docs.tokens.studio/?ref=pgs"
            size="large"
            variant="secondary"
          >
            Learn more
          </Button>
          <Button id="button-configure" size="large" variant="primary" onClick={onSetDefaultTokens}>
            Get started
          </Button>
        </Stack>
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
      </Stack>
    </div>
  );
}

export default StartScreen;
