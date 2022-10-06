import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import Heading from './Heading';
import Text from './Text';
import Button from './Button';
import Callout from './Callout';
import { Dispatch } from '../store';
import { storageTypeSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import { Tabs } from '@/constants/Tabs';
import { StorageProviderType } from '@/constants/StorageProviderType';

const StyledFigmaLetter = styled(FigmaLetter, {
  width: '90px',
  height: '55px',
});

const StyledFigmaMark = styled(FigmaMark, {
  width: '55px',
  height: '55px',
});

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();

  const storageType = useSelector(storageTypeSelector);

  const onSetDefaultTokens = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
    dispatch.tokenState.setEmptyTokens();
  }, [dispatch]);

  const onSetSyncClick = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState({
      ...storageType,
      provider: storageType.provider,
      new: true,
    });
  }, [dispatch, storageType]);

  return (
    <div className="h-auto p-4 my-auto content scroll-container">
      <Stack direction="column" gap={4} css={{ display: 'flex', padding: '2rem', background: '$startScreenBg' }}>
        {/* <a href="https://jansix.at/resources/figma-tokens?ref=figma-tokens-plugin" target="_blank" rel="noreferrer"> */}
        {/* eslint-disable-next-line */}
          {/* <img alt="Figma Tokens Splashscreen" src={require('../assets/tokens-intro.jpg')} className="rounded" /> */}
        {/* </a> */}
        <Stack direction="row" gap={2}>
          <StyledFigmaMark />
          <StyledFigmaLetter />
        </Stack>
        <Stack direction="column" gap={2}>
          {/* <Heading>Welcome to Figma Tokens.</Heading> */}
          <Text muted>
            Figma Tokens allows you to use design tokens in Figma and sync those to an external source of truth, for example GitHub.
          </Text>
        </Stack>
        <Stack direction="column" gap={2}>
          <Heading>Guides</Heading>
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
