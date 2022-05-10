import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DownloadIcon, UploadIcon } from '@primer/octicons-react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { Dispatch } from '../store';
import * as pjs from '../../../package.json';
import Box from './Box';
import Text from './Text';
import Stack from './Stack';
import BranchSelector from './BranchSelector';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import {
  localApiStateSelector,
  editProhibitedSelector,
  lastSyncedStateSelector,
  storageTypeSelector,
  tokensSelector,
  usedTokenSetSelector,
  themesListSelector,
} from '@/selectors';
import DocsIcon from '@/icons/docs.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import IconButton from './IconButton';

export default function Footer() {
  const storageType = useSelector(storageTypeSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();

  const { gitBranchSelector } = useFlags();
  const { pullTokens, pushTokens } = useRemoteTokens();

  const checkForChanges = React.useCallback(() => {
    const hasChanged = (lastSyncedState !== JSON.stringify([tokens, themes], null, 2));
    dispatch.tokenState.updateCheckForChanges(String(hasChanged));
    return hasChanged;
  }, [lastSyncedState, tokens, themes]);

  const hasChanges = React.useMemo(() => checkForChanges(), [checkForChanges]);

  const transformProviderName = React.useCallback((provider: StorageProviderType) => {
    switch (provider) {
      case StorageProviderType.JSONBIN:
        return 'JSONBin.io';
      case StorageProviderType.GITHUB:
        return 'GitHub';
      case StorageProviderType.URL:
        return 'URL';
      default:
        return provider;
    }
  }, []);

  const onPushButtonClicked = React.useCallback(() => pushTokens(), [pushTokens]);
  const onPullButtonClicked = React.useCallback(() => pullTokens({ usedTokenSet }), [pullTokens, usedTokenSet]);

  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        padding: '$4',
      }}
    >
      <Stack direction="row">
        {localApiState.branch && (
        <>
          {gitBranchSelector && <BranchSelector currentBranch={localApiState.branch} />}
          <IconButton icon={<DownloadIcon />} onClick={onPullButtonClicked} tooltipSide="top" tooltip={`Pull from ${transformProviderName(storageType.provider)}`} />
          <IconButton badge={hasChanges} icon={<UploadIcon />} onClick={onPushButtonClicked} tooltipSide="top" disabled={editProhibited} tooltip={`Push to ${transformProviderName(storageType.provider)}`} />
        </>
        )}
      </Stack>
      <Stack direction="row" gap={4}>
        <Box css={{ color: '$textMuted', fontSize: '$xsmall' }}>
          Version
          {' '}
          {pjs.plugin_version}
        </Box>

        <Text size="xsmall">
          <a href="https://docs.tokens.studio/?ref=pf" target="_blank" rel="noreferrer">
            <Stack direction="row" gap={1}>
              <Box as="span" css={{ color: '$textMuted' }}>
                Docs
              </Box>
              <DocsIcon />
            </Stack>
          </a>
        </Text>
        <Text size="xsmall">
          <a href="https://github.com/six7/figma-tokens" target="_blank" rel="noreferrer">
            <Stack direction="row" gap={1}>
              <Box as="span" css={{ color: '$textMuted' }}>
                Feedback
              </Box>
              <FeedbackIcon />
            </Stack>
          </a>
        </Text>
      </Stack>
    </Box>
  );
}
