import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { DownloadIcon, UploadIcon } from '@primer/octicons-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@tokens-studio/ui';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import * as pjs from '../../../package.json';
import Box from './Box';
import Stack from './Stack';
import BranchSelector from './BranchSelector';
import useRemoteTokens from '../store/remoteTokens';
import {
  localApiStateSelector,
  editProhibitedSelector,
  storageTypeSelector,
  usedTokenSetSelector,
  projectURLSelector,
  activeThemeSelector,
  uiStateSelector,
} from '@/selectors';
import DocsIcon from '@/icons/docs.svg';
import RefreshIcon from '@/icons/refresh.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import Tooltip from './Tooltip';
import { isGitProvider } from '@/utils/is';
import IconLibrary from '@/icons/library.svg';
import ProBadge from './ProBadge';
import { transformProviderName } from '@/utils/transformProviderName';
import { DirtyStateBadgeWrapper } from './DirtyStateBadgeWrapper';
import { useChangedState } from '@/hooks/useChangedState';
import { docUrls } from '@/constants/docUrls';
import { TokenFormatBadge } from './TokenFormatBadge';
import { isEqual } from '@/utils/isEqual';

export default function Footer() {
  const storageType = useSelector(storageTypeSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const projectURL = useSelector(projectURLSelector);
  const uiState = useSelector(uiStateSelector, isEqual);
  const { pullTokens, pushTokens, checkRemoteChange } = useRemoteTokens();
  const { t } = useTranslation(['footer', 'licence']);
  const activeTheme = useSelector(activeThemeSelector);
  const { hasChanges: hasLocalChange } = useChangedState();
  const { hasRemoteChange } = uiState;

  React.useEffect(() => {
    const interval = setInterval(() => {
      checkRemoteChange();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkRemoteChange]);

  const onPushButtonClicked = React.useCallback(() => pushTokens(), [pushTokens]);
  const onPullButtonClicked = React.useCallback(() => pullTokens({ usedTokenSet, activeTheme }), [pullTokens, usedTokenSet, activeTheme]);
  const handlePullTokens = useCallback(() => {
    pullTokens({ usedTokenSet, activeTheme, updateLocalTokens: true });
  }, [pullTokens, usedTokenSet, activeTheme]);

  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        padding: '$3',
        borderTop: '1px solid $borderMuted',
      }}
    >

      <Stack direction="row" align="center" gap={2}>
        {((isGitProvider(localApiState) && localApiState.branch) || storageType.provider === AVAILABLE_PROVIDERS.SUPERNOVA) && (
          <>
            <BranchSelector />
            <TokenFormatBadge />
            <DirtyStateBadgeWrapper badge={hasRemoteChange}>
              <IconButton
                data-testid="footer-pull-button"
                icon={<DownloadIcon />}
                onClick={onPullButtonClicked}
                variant="invisible"
                size="small"
                tooltipSide="top"
                tooltip={
                  t('pullFrom', {
                    provider: transformProviderName(storageType.provider),
                  }) as string
                }
              />
            </DirtyStateBadgeWrapper>
            <DirtyStateBadgeWrapper badge={hasLocalChange}>
              <IconButton
                data-testid="footer-push-button"
                icon={<UploadIcon />}
                onClick={onPushButtonClicked}
                variant="invisible"
                size="small"
                tooltipSide="top"
                disabled={editProhibited || !hasLocalChange}
                tooltip={
                  t('pushTo', {
                    provider: transformProviderName(storageType.provider),
                  }) as string
                }
              />
            </DirtyStateBadgeWrapper>
          </>
        )}
        {storageType.provider !== AVAILABLE_PROVIDERS.LOCAL
          && storageType.provider !== AVAILABLE_PROVIDERS.GITHUB
          && storageType.provider !== AVAILABLE_PROVIDERS.GITLAB
          && storageType.provider !== AVAILABLE_PROVIDERS.ADO
          && storageType.provider !== AVAILABLE_PROVIDERS.BITBUCKET
          && storageType.provider !== AVAILABLE_PROVIDERS.SUPERNOVA
          ? (
            <Stack align="center" direction="row" gap={2}>
              {storageType.provider === AVAILABLE_PROVIDERS.JSONBIN && (
                <Tooltip label={t('goTo', {
                  provider: transformProviderName(storageType.provider),
                }) as string}
                >
                  <IconButton icon={<IconLibrary />} href={projectURL} />
                </Tooltip>
              )}
              <IconButton
                tooltip={t('pullFrom', {
                  provider: transformProviderName(storageType.provider),
                }) as string}
                onClick={handlePullTokens}
                variant="invisible"
                size="small"
                icon={<RefreshIcon />}
              />
            </Stack>
          ) : null}
      </Stack>
      <Stack direction="row" gap={4} align="center">
        <Box css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
          <a href="https://tokens.studio/changelog" target="_blank" rel="noreferrer">{`V ${pjs.version}`}</a>
        </Box>
        <Stack direction="row" gap={1}>
          <ProBadge />
          <IconButton
            as="a"
            href={docUrls.root}
            icon={<DocsIcon />}
            variant="invisible"
            size="small"
            tooltip={t('docs') as string}
            target="_blank"
          />
          <IconButton
            as="a"
            href="https://tokensstudio.featurebase.app/?b=65971b8c143e3c7207d29602"
            icon={<FeedbackIcon />}
            variant="invisible"
            size="small"
            tooltip={t('feedback') as string}
            target="_blank"
          />
        </Stack>
      </Stack>
    </Box>
  );
}
