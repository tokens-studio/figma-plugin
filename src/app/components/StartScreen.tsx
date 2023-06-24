import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('');

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
          {t('startScreen.intro')}
        </Text>
        <Stack direction="column" gap={4}>
          <Heading size="large">
            {' '}
            {t('startScreen.guides')}
          </Heading>
          <Stack direction="column" gap={3}>
            <HelpfulLink href="https://docs.tokens.studio/getting-started?ref=startscreen" target="_blank">
              <BookmarkIcon />
              {t('startScreen.gettingStarted')}

            </HelpfulLink>
            <HelpfulLink href="https://docs.tokens.studio/?ref=startscreen" target="_blank">
              <ReaderIcon />
              {t('startScreen.documentation')}
            </HelpfulLink>
            <HelpfulLink href="https://tokens.studio/slack" target="_blank">
              <ChatBubbleIcon />
              {t('startScreen.joinSlack')}
            </HelpfulLink>
          </Stack>
        </Stack>
        {storageType?.provider !== StorageProviderType.LOCAL ? (
          <Callout
            id="callout-action-setupsync"
            heading={t('startScreen.couldNotLoadTokens', { provider: transformProviderName(storageType?.provider) })}
            description={t('startScreen.unableToFetchRemote')}
            action={{
              onClick: onSetSyncClick,
              text: t('startScreen.enterCredentials'),
            }}
          />
        ) : (
          <Stack direction="row" gap={2}>
            <Button id="button-configure" size="small" variant="primary" onClick={onSetEmptyTokens}>
              {t('startScreen.newEmptyFile')}
            </Button>
            <Button id="button-configure-preset" size="small" variant="ghost" onClick={onSetDefaultTokens}>
              {t('startScreen.loadExample')}
            </Button>
          </Stack>
        )}
        <Stack direction="row" align="center" gap={3}>
          <GitHubLogoIcon />
          <a href="https://github.com/tokens-studio/figma-plugin" style={{ textDecoration: 'underline', color: '$textMuted', fontSize: '$xsmall' }} target="_blank" rel="noreferrer">
            {t('startScreen.foundIssue')}
          </a>
        </Stack>
      </Stack>
    </Box>
  );
}

export default StartScreen;
