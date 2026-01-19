import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Select, Label, Spinner,
} from '@tokens-studio/ui';
import TokensStudioLogo from '@/icons/tokensstudio-full.svg';
import Text from './Text';
import Callout from './Callout';
import { Dispatch } from '../store';
import {
  apiProvidersSelector, storageTypeSelector, lastErrorSelector, themeOptionsSelector, activeThemeSelector,
} from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import { Tabs } from '@/constants/Tabs';
import { StorageProviderType } from '@/constants/StorageProviderType';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import { track } from '@/utils/analytics';
import Footer from './Footer';
import { autoSelectFirstThemesPerGroup } from '@/utils/autoSelectThemes';
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
  const { restoreStoredProvider, restoreProviderWithAutoPull } = useRemoteTokens();

  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const lastError = useSelector(lastErrorSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const activeTheme = useSelector(activeThemeSelector);

  // Local loading state for provider selection
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);

  const onSetEmptyTokens = React.useCallback(() => {
    track('Start with empty set');
    dispatch.uiState.setLastError(null);
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
    dispatch.tokenState.setEmptyTokens();
  }, [dispatch]);

  const onSetDefaultTokens = React.useCallback(() => {
    track('Start with exmaple set');
    dispatch.uiState.setLastError(null);
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
    dispatch.uiState.setLastError(null);
    dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    dispatch.tokenState.setEmptyTokens();
    dispatch.uiState.setLocalApiState(credentialsToSet);
  }, [apiProviders, dispatch.tokenState, dispatch.uiState, storageType]);

  const onProviderSelect = React.useCallback(async (providerId: string) => {
    const selectedProvider = apiProviders.find((provider) => provider.internalId === providerId);
    if (selectedProvider) {
      track('Start with sync provider', { provider: selectedProvider.provider });

      // Clear any existing errors and set loading state
      dispatch.uiState.setLastError(null);
      setIsLoadingProvider(true);

      try {
        await restoreProviderWithAutoPull(selectedProvider);

        // Auto-select first themes if no themes are currently selected
        if (availableThemes.length > 0) {
          const newActiveTheme = autoSelectFirstThemesPerGroup(availableThemes, activeTheme);
          if (Object.keys(newActiveTheme).length > 0 && Object.keys(activeTheme).length === 0) {
            dispatch.tokenState.setActiveTheme({
              newActiveTheme,
              shouldUpdateNodes: true,
            });
            track('Auto-selected themes', { themes: newActiveTheme });
          }
        }
        // Loading will be cleared when we navigate away to TOKENS tab
      } catch (error) {
        console.error('Error loading provider:', error);
        setIsLoadingProvider(false);
        dispatch.uiState.setLastError({
          type: 'connectivity',
          header: 'Failed to load provider',
          message: 'Unable to connect to the selected sync provider. Please check your credentials and try again.',
        });
      }
    }
  }, [apiProviders, availableThemes, activeTheme, dispatch, restoreProviderWithAutoPull]);

  const matchingProvider = React.useMemo(
    () => (storageType && 'internalId' in storageType
      ? apiProviders.find((i) => i.internalId === storageType.internalId)
      : undefined),
    [apiProviders, storageType],
  );

  const getCalloutContent = React.useMemo(() => {
    if (!lastError) {
      return {
        heading: t('couldNotLoadTokens', { provider: transformProviderName(storageType?.provider) }),
        description: matchingProvider ? t('unableToFetchRemoteWithCredentials') : t('unableToFetchRemoteNoCredentials'),
      };
    }

    // Use the centralized header and message from the error - no fallback needed
    return {
      heading: lastError.header,
      description: lastError.message,
    };
  }, [lastError, storageType?.provider, matchingProvider, t]);

  // Create provider options for the select dropdown
  const providerOptions = React.useMemo(
    () => apiProviders.map((provider) => ({
      value: provider.internalId,
      label: `${provider.name} (${transformProviderName(provider.provider)})`,
    })),
    [apiProviders],
  );

  // Determine if we should show the provider selector
  const shouldShowProviderSelector = apiProviders.length > 0 && storageType?.provider === StorageProviderType.LOCAL;

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
          {isLoadingProvider && (
            <Stack direction="row" gap={3} align="center">
              <Spinner />
              <Text>{t('loadingTokens', { defaultValue: 'Loading tokens from sync provider...' })}</Text>
            </Stack>
          )}
          {!isLoadingProvider && storageType?.provider !== StorageProviderType.LOCAL && (
            <Callout
              id="callout-action-setupsync"
              heading={getCalloutContent.heading}
              description={getCalloutContent.description}
              action={{
                onClick: onSetSyncClick,
                text: t('enterCredentials'),
              }}
              secondaryAction={matchingProvider ? {
                onClick: () => {
                  dispatch.uiState.setLastError(null);
                  restoreStoredProvider(matchingProvider);
                },
                text: t('retry'),
              } : undefined}
            />
          )}
          {!isLoadingProvider && storageType?.provider === StorageProviderType.LOCAL && (
            <Stack direction="column" gap={4}>
              {shouldShowProviderSelector && (
                <Stack direction="column" gap={3}>
                  <Heading size="medium">{t('loadFromProvider', { defaultValue: 'Load from sync provider' })}</Heading>
                  <Stack direction="row" justify="between" align="center" gap={4} css={{ width: '100%' }}>
                    <Label>{t('selectProvider', { defaultValue: 'Select a provider' })}</Label>
                    <Select onValueChange={onProviderSelect} disabled={isLoadingProvider}>
                      <Select.Trigger
                        value={t('chooseProvider', { defaultValue: 'Choose a provider...' })}
                        data-testid="provider-selector"
                      />
                      <Select.Content>
                        {providerOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Stack>
                </Stack>
              )}
              <Stack direction="row" gap={2}>
                <Button data-testid="button-configure" size="small" variant="primary" onClick={onSetEmptyTokens} disabled={isLoadingProvider}>
                  {t('newEmptyFile')}
                </Button>
                <Button data-testid="button-configure-preset" size="small" variant="invisible" onClick={onSetDefaultTokens} disabled={isLoadingProvider}>
                  {t('loadExample')}
                </Button>
              </Stack>
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
