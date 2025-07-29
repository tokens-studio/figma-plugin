import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Button, Heading } from '@tokens-studio/ui';
import TokensStudioLogo from '@/icons/tokensstudio-full.svg';
import Text from './Text';
import Callout from './Callout';
import { Dispatch } from '../store';
import { apiProvidersSelector, storageTypeSelector, lastSyncErrorSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import { Tabs } from '@/constants/Tabs';
import { StorageProviderType } from '@/constants/StorageProviderType';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import { track } from '@/utils/analytics';
import Footer from './Footer';
import useRemoteTokens from '../store/remoteTokens';

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
  const { restoreStoredProvider } = useRemoteTokens();

  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const lastSyncError = useSelector(lastSyncErrorSelector);

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
    const credentialsToSet = matchingProvider
      ? { ...matchingProvider, provider: storageType.provider, new: true }
      : {
        ...storageType,
        new: true,
      };
    // Clear any previous error from both Redux state and sessionStorage
    dispatch.uiState.setLastSyncError(null);
    try {
      sessionStorage.removeItem('lastSyncError');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState(credentialsToSet);
  }, [apiProviders, dispatch.tokenState, dispatch.uiState, storageType]);

  const matchingProvider = React.useMemo(
    () => (storageType && 'internalId' in storageType
      ? apiProviders.find((i) => i.internalId === storageType.internalId)
      : undefined),
    [apiProviders, storageType],
  );

  const getErrorDescription = () => {
    if (lastSyncError) {
      return lastSyncError;
    }

    try {
      const storedError = sessionStorage.getItem('lastSyncError');
      if (storedError) {
        return storedError;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    if (matchingProvider) {
      return 'There was an error parsing or validating the token file. Check the browser console for detailed error information, or verify your JSON syntax.';
    }

    return t('unableToFetchRemoteNoCredentials');
  };

  const shouldShowError = storageType?.provider !== StorageProviderType.LOCAL;

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
              <HelpfulLink href="https://docs.tokens.studio/get-started/install-figma-plugin?ref=startscreen" target="_blank">
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
          {shouldShowError && (
            <Callout
              id="callout-action-setupsync"
              heading={t('couldNotLoadTokens', { provider: transformProviderName(storageType?.provider) })}
              description={getErrorDescription()}
              action={{
                onClick: onSetSyncClick,
                text: t('enterCredentials'),
              }}
              secondaryAction={matchingProvider ? {
                onClick: () => {
                  dispatch.uiState.setLastSyncError(null);
                  try {
                    sessionStorage.removeItem('lastSyncError');
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                  }
                  restoreStoredProvider(matchingProvider);
                },
                text: t('retry'),
              } : undefined}
            />
          )}
          {storageType?.provider === StorageProviderType.LOCAL && (
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
