import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { DownloadIcon, UploadIcon } from '@primer/octicons-react';
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
  activeTabSelector,
  projectURLSelector,
} from '@/selectors';
import DocsIcon from '@/icons/docs.svg';
import RefreshIcon from '@/icons/refresh.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import IconButton from './IconButton';
import { useFlags } from './LaunchDarkly';
import Tooltip from './Tooltip';
import IconLibrary from '@/icons/library.svg';

export default function Footer() {
  const storageType = useSelector(storageTypeSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTab = useSelector(activeTabSelector);
  const projectURL = useSelector(projectURLSelector);
  const { gitBranchSelector } = useFlags();
  const { pullTokens, pushTokens } = useRemoteTokens();

  const checkForChanges = React.useCallback(() => {
    if (lastSyncedState !== JSON.stringify([tokens, themes], null, 2)) {
      return true;
    }
    return false;
  }, [lastSyncedState, tokens, themes]);

  const hasChanges = React.useMemo(() => checkForChanges(), [checkForChanges]);

  const transformProviderName = React.useCallback((provider: StorageProviderType) => {
    switch (provider) {
      case StorageProviderType.JSONBIN:
        return 'JSONBin.io';
      case StorageProviderType.GITHUB:
        return 'GitHub';
      case StorageProviderType.GITLAB:
        return 'GitLab';
      case StorageProviderType.ADO:
        return 'ADO';
      case StorageProviderType.URL:
        return 'URL';
      default:
        return provider;
    }
  }, []);

  const onPushButtonClicked = React.useCallback(() => pushTokens(), [pushTokens]);
  const onPullButtonClicked = React.useCallback(() => pullTokens({ usedTokenSet }), [pullTokens, usedTokenSet]);

  const handlePullTokens = useCallback(() => {
    pullTokens({ usedTokenSet });
  }, [pullTokens, usedTokenSet]);

  return activeTab !== 'loading' && activeTab !== 'start' ? (
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
        {storageType.provider !== StorageProviderType.LOCAL
          && storageType.provider !== StorageProviderType.GITHUB
          && storageType.provider !== StorageProviderType.GITLAB
          && storageType.provider !== StorageProviderType.ADO
          && (
            <Stack align="center" direction="row" gap={2}>
              <Text muted>Sync</Text>
              {storageType.provider === StorageProviderType.JSONBIN && (
                <Tooltip label={`Go to ${transformProviderName(storageType.provider)}`}>
                  <a href={projectURL} target="_blank" rel="noreferrer" className="block button button-ghost">
                    <IconLibrary />
                  </a>
                </Tooltip>
              )}
              <IconButton tooltip={`Pull from ${transformProviderName(storageType.provider)}`} onClick={handlePullTokens} icon={<RefreshIcon />} />
            </Stack>
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
  ) : null;
}
