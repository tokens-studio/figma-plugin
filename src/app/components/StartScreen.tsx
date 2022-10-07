import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon, ReaderIcon, ChatBubbleIcon, GitHubLogoIcon,
} from '@radix-ui/react-icons';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import Heading from './Heading';
import Text from './Text';
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

const HelpfulLinks = styled('a', {
  color: '$textMuted',
  fontSize: '$xsmall',
  '&:hover, &:focus': {
    color: '$onInteraction',
  },
  rel: 'noreferrer',
});

function StartScreen() {
  const dispatch = useDispatch<Dispatch>();

  const storageType = useSelector(storageTypeSelector);

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
        <Stack direction="row" gap={2}>
          <StyledFigmaMark />
          <StyledFigmaLetter />
        </Stack>
        {/* <Stack direction="column" gap={2}> */}
        <Text muted>
          Figma Tokens allows you to use design tokens in Figma and sync those to an external source of truth, for example GitHub.
        </Text>
        {/* </Stack> */}
        <Stack direction="column" gap={4}>
          <Heading>Guides</Heading>
          <Stack direction="row" gap={2}>
            <BookmarkIcon />
            <HelpfulLinks href="https://docs.figmatokens.com/getting-started" target="_blank">
              Getting started
            </HelpfulLinks>
          </Stack>
          <Stack direction="row" gap={2}>
            <ReaderIcon />
            <HelpfulLinks href="https://docs.figmatokens.com/" target="_blank">
              Documentation
            </HelpfulLinks>
          </Stack>
          <Stack direction="row" gap={2}>
            <ChatBubbleIcon />
            <HelpfulLinks href="https://figmatokens.com/slack" target="_blank">
              Join our Slack
            </HelpfulLinks>
          </Stack>
        </Stack>
        {storageType?.provider !== StorageProviderType.LOCAL && (
          <Callout
            id="callout-action-setupsync"
            heading="Remote storage detected"
            description="This document was setup with a remote storage. Ask your team for the credentials, then enter them in the Sync dialog."
            action={{
              onClick: onSetSyncClick,
              text: 'Enter credential',
            }}
          />
        )}
        <Stack direction="row" gap={2}>
          <GitHubLogoIcon />
          <a href="https://github.com/six7/figma-tokens" style={{ color: '$textMuted', fontSize: '$xsmall' }} target="_blank" rel="noreferrer" className="underline">
            Found an issue We&#39;re on GitHub!
          </a>
        </Stack>
      </Stack>
    </div>
  );
}

export default StartScreen;
