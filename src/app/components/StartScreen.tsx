import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import Heading from './Heading';
import Text from './Text';
import Button from './Button';
import Callout from './Callout';
import { Dispatch } from '../store';
import { apiProvidersSelector, storageTypeSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import { Tabs } from '@/constants/Tabs';
import { StorageProviderType } from '@/constants/StorageProviderType';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import { track } from '@/utils/analytics';

const StyledFigmaTokensLogo = styled(FigmaLetter, {
  width: '130px',
  height: '55px',
});

const StyledFigmaTokensLogoMark = styled(FigmaMark, {
  width: '55px',
  height: '55px',
});

const HelpfulLink = styled('a', {
  color: '$textMuted',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '0 $1',
  fontSize: '$xsmall',
  '&:hover, &:focus': {
    color: '$text',
  },
});

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();

  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);

  const onSetEmptyTokens = React.useCallback(() => {
    track('Start with empty set');
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
    dispatch.tokenState.setEmptyTokens();
  }, [dispatch]);

  const onSetDefaultTokens = React.useCallback(() => {
    track('Start with exmaple set');
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
    dispatch.tokenState.setDefaultTokens();
  }, [dispatch]);

  const onSetSyncClick = React.useCallback(() => {
    if (storageType.provider === StorageProviderType.LOCAL) {
      return;
    }
    const matchingProvider = apiProviders.find((i) => i.internalId === storageType?.internalId);
    const credentialsToSet = matchingProvider ? { ...matchingProvider, provider: storageType.provider, new: true } : {
      ...storageType,
      new: true,
    };
    dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState(credentialsToSet);
  }, [apiProviders, dispatch.tokenState, dispatch.uiState, storageType]);

  return (
    <Box className="content scroll-container" css={{ padding: '$5', height: '100%', display: 'flex' }}>
      <Stack
        direction="column"
        gap={6}
        align="start"
        css={{
          padding: '$7', backgroundColor: '$bgSubtle', margin: 'auto', maxWidth: '400px', borderRadius: '$card',
        }}
      >
        <Stack direction="row" gap={4}>
          <StyledFigmaTokensLogoMark />
          <StyledFigmaTokensLogo />
        </Stack>
        <Text muted>
          Tokens Studio for Figma allows you to use design tokens in Figma and sync those to an external source of truth, for example GitHub.
        </Text>
        <Stack direction="column" gap={4}>
          <Heading size="large">Guides</Heading>
          <Stack direction="column" gap={3}>
            <HelpfulLink href="https://docs.tokens.studio/getting-started?ref=startscreen" target="_blank">
              <BookmarkIcon />
              Getting started
            </HelpfulLink>
            <HelpfulLink href="https://docs.tokens.studio/?ref=startscreen" target="_blank">
              <ReaderIcon />
              Documentation
            </HelpfulLink>
            <HelpfulLink href="https://tokens.studio/slack" target="_blank">
              <ChatBubbleIcon />
              Join our Slack
            </HelpfulLink>
          </Stack>
        </Stack>
        {storageType?.provider !== StorageProviderType.LOCAL ? (
          <Callout
            id="callout-action-setupsync"
            heading={`Couldn't load tokens stored on ${transformProviderName(storageType?.provider)}`}
            description="Unable to fetch tokens from remote storage, if you haven't added credentials yet add them in the next step. Otherwise make sure the file exists and you have access to it."
            action={{
              onClick: onSetSyncClick,
              text: 'Enter credentials',
            }}
          />
        ) : (
          <Stack direction="row" gap={2}>
            <Button id="button-configure" size="small" variant="primary" onClick={onSetEmptyTokens}>
              New empty file
            </Button>
            <Button id="button-configure-preset" size="small" variant="ghost" onClick={onSetDefaultTokens}>
              Load example
            </Button>
          </Stack>
        )}
        <Stack direction="row" align="center" gap={3}>
          <GitHubLogoIcon />
          <a href="https://github.com/tokens-studio/figma-plugin" style={{ textDecoration: 'underline', color: '$textMuted', fontSize: '$xsmall' }} target="_blank" rel="noreferrer">
            Found an issue? We&#39;re on GitHub!
          </a>
        </Stack>
      </Stack>
    </Box>
  );
}

export default StartScreen;
