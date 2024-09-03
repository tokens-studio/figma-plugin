import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Button, Heading } from '@tokens-studio/ui';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import TokensStudioLogo from '@/icons/tokensstudio-full.svg';
import Text from './Text';
import Callout from './Callout';
import { Dispatch } from '../store';
import { apiProvidersSelector, storageTypeSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import { Tabs } from '@/constants/Tabs';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import { track } from '@/utils/analytics';
import Footer from './Footer';
import {
  URLStorageType, JSONBinStorageType, GitHubStorageType, GitLabStorageType,
} from '@/types/StorageType';

const StyledTokensStudioIcon = styled(TokensStudioLogo, {
  width: '200px',
  height: '23px',
});

const HelpfulLink = styled('a', {
  color: '$fgMuted',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '0 $1',
  fontSize: '$xsmall',
  '&:hover, &:focus': {
    color: '$fgDefault',
  },
});

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['startScreen']);

  type StorageWithInternalId = URLStorageType | JSONBinStorageType | GitHubStorageType | GitLabStorageType;
  const storageType = useSelector(storageTypeSelector) as StorageWithInternalId;
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
    if (storageType.provider === AVAILABLE_PROVIDERS.LOCAL) {
      return;
    }
    const matchingProvider = apiProviders.find((i) => i.internalId === storageType?.internalId);
    const credentialsToSet = matchingProvider
      ? { ...matchingProvider, provider: storageType.provider, new: true }
      : {
        ...storageType,
        new: true,
      };
    dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState(credentialsToSet);
  }, [apiProviders, dispatch.tokenState, dispatch.uiState, storageType]);

  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box className="content scroll-container" css={{ padding: '$5', height: '100%', display: 'flex' }}>
        <Stack
          direction="column"
          gap={6}
          align="start"
          css={{
            padding: '$7',
            margin: 'auto',
            maxWidth: '400px',
            borderRadius: '$medium',
          }}
        >
          <Stack direction="row" gap={4}>
            <StyledTokensStudioIcon />
          </Stack>
          <Text muted>{t('intro')}</Text>
          <Stack direction="column" gap={4}>
            <Heading size="large">
              {' '}
              {t('guides')}
            </Heading>
            <Stack direction="column" gap={3}>
              <HelpfulLink href="https://docs.tokens.studio/getting-started?ref=startscreen" target="_blank">
                <BookmarkIcon />
                {t('gettingStarted')}
              </HelpfulLink>
              <HelpfulLink href="https://docs.tokens.studio/?ref=startscreen" target="_blank">
                <ReaderIcon />
                {t('documentation')}
              </HelpfulLink>
              <HelpfulLink href="https://tokens.studio/slack" target="_blank">
                <ChatBubbleIcon />
                {t('joinSlack')}
              </HelpfulLink>
            </Stack>
          </Stack>
          {storageType?.provider !== AVAILABLE_PROVIDERS.LOCAL ? (
            <Callout
              id="callout-action-setupsync"
              heading={t('couldNotLoadTokens', { provider: transformProviderName(storageType?.provider) })}
              description={t('unableToFetchRemote')}
              action={{
                onClick: onSetSyncClick,
                text: t('enterCredentials'),
              }}
            />
          ) : (
            <Stack direction="row" gap={2}>
              <Button data-testid="button-configure" size="small" variant="primary" onClick={onSetEmptyTokens}>
                {t('newEmptyFile')}
              </Button>
              <Button data-testid="button-configure-preset" size="small" variant="invisible" onClick={onSetDefaultTokens}>
                {t('loadExample')}
              </Button>
            </Stack>
          )}
          <Stack direction="row" align="center" gap={3}>
            <GitHubLogoIcon />
            <a
              href="https://github.com/tokens-studio/figma-plugin"
              style={{ textDecoration: 'underline', color: '$fgMuted', fontSize: '$xsmall' }}
              target="_blank"
              rel="noreferrer"
            >
              {t('foundIssue')}
            </a>
          </Stack>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
}

export default StartScreen;
