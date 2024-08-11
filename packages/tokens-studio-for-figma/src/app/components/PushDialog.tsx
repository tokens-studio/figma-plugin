import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Spinner, Stack, Text, ToggleGroup,
} from '@tokens-studio/ui';
import { localApiStateSelector, storageTypeSelector } from '@/selectors';
import usePushDialog from '../hooks/usePushDialog';
import { getBitbucketCreatePullRequestUrl } from '../store/providers/bitbucket';
import { getGithubCreatePullRequestUrl } from '../store/providers/github';
import { getGitlabCreatePullRequestUrl } from '../store/providers/gitlab';
import { getADOCreatePullRequestUrl } from '../store/providers/ado';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { isGitProvider } from '@/utils/is';
import { useShortcut } from '@/hooks/useShortcut';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';
import PushJSON from './PushJSON';
import PushSettingForm from './PushSettingForm';
import { getSupernovaOpenCloud } from '../store/providers/supernova/getSupernovaOpenCloud';
import Modal from './Modal';

function PushDialog() {
  const { onConfirm, onCancel, showPushDialog } = usePushDialog();
  const { t } = useTranslation(['sync']);
  const localApiState = useSelector(localApiStateSelector);
  const storageType = useSelector(storageTypeSelector);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [branch, setBranch] = React.useState((isGitProvider(localApiState) ? localApiState.branch : '') || '');
  const [activeTab, setActiveTab] = React.useState('commit');

  const redirectHref = React.useMemo(() => {
    let redirectHref = '';
    if (localApiState && 'id' in localApiState && localApiState.id) {
      switch (localApiState.provider) {
        case StorageProviderType.GITHUB:
          redirectHref = getGithubCreatePullRequestUrl({
            base: localApiState.baseUrl,
            repo: localApiState.id,
            branch,
          });
          break;
        case StorageProviderType.BITBUCKET:
          redirectHref = getBitbucketCreatePullRequestUrl({
            base: localApiState.baseUrl,
            repo: localApiState.id,
            branch,
          });
          break;
        case StorageProviderType.GITLAB: {
          redirectHref = getGitlabCreatePullRequestUrl(localApiState.id, localApiState.baseUrl);
          break;
        }
        case StorageProviderType.ADO:
          redirectHref = getADOCreatePullRequestUrl({
            branch,
            projectId: localApiState.name,
            orgUrl: localApiState.baseUrl,
            repositoryId: localApiState.id,
          });
          break;
        default:
          break;
      }
    } else if (localApiState.provider === StorageProviderType.SUPERNOVA) {
      redirectHref = getSupernovaOpenCloud(localApiState.designSystemUrl);
    }
    return redirectHref;
  }, [branch, localApiState]);

  const handleCommitMessageChange = React.useCallback(
    (val: string) => {
      setCommitMessage(val);
    },
    [setCommitMessage],
  );

  const handleBranchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBranch(event.target.value);
    },
    [setBranch],
  );

  React.useEffect(() => {
    if (showPushDialog?.state === 'initial' && isGitProvider(localApiState)) {
      setCommitMessage(showPushDialog?.overrides?.commitMessage ?? '');
      setBranch(showPushDialog?.overrides?.branch ?? localApiState.branch ?? '');
    }
  }, [showPushDialog, localApiState]);

  const handlePushChanges = React.useCallback(() => {
    if (localApiState.provider === StorageProviderType.SUPERNOVA || (commitMessage && branch)) {
      onConfirm(commitMessage, branch);
    }
  }, [branch, commitMessage, onConfirm, localApiState]);

  const handleSaveShortcut = React.useCallback(
    (event: KeyboardEvent) => {
      if (showPushDialog?.state === 'initial' && (event.metaKey || event.ctrlKey)) {
        handlePushChanges();
      }
    },
    [handlePushChanges, showPushDialog],
  );

  React.useEffect(() => {
    if (showPushDialog?.state === 'initial') {
      useShortcut(['Enter'], handleSaveShortcut);
    }
  }, [showPushDialog, handleSaveShortcut]);

  switch (showPushDialog?.state) {
    case 'dtcgconversion':
    case 'initial': {
      return (
        <Modal
          full
          title={t('pushTo', { provider: transformProviderName(storageType.provider) })}
          showClose
          isOpen
          close={onCancel}
          stickyFooter
          footer={(
            <Stack direction="row" justify="end" gap={4}>
              <Button variant="secondary" data-testid="push-dialog-button-close" onClick={onCancel}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                data-testid="push-dialog-button-push-changes"
                disabled={localApiState.provider !== StorageProviderType.SUPERNOVA && (!commitMessage || !branch)}
                onClick={handlePushChanges}
              >
                {t('pushChanges')}
              </Button>
            </Stack>
          )}
        >
          <Stack direction="column" align="start">
            <ToggleGroup type="single" value={activeTab} onValueChange={setActiveTab} css={{ marginLeft: '$3', marginTop: '$3' }}>
              <ToggleGroup.Item iconOnly={false} value="commit">
                {t('commit')}
              </ToggleGroup.Item>
              <ToggleGroup.Item iconOnly={false} value="diff">
                {t('diff')}
              </ToggleGroup.Item>
              <ToggleGroup.Item iconOnly={false} value="json">
                JSON
              </ToggleGroup.Item>
            </ToggleGroup>
            {activeTab !== 'commit' && localApiState.provider === StorageProviderType.SUPERNOVA && (
              <Stack direction="row" gap={2} align="center" css={{ display: 'inline', padding: '$4' }}>
                {t('thisWillPushYourLocalChangesToTheBranch')}
                {' '}
                <Text
                  bold
                  css={{
                    display: 'inline',
                    whiteSpace: 'nowrap',
                    background: '$bgSubtle',
                    padding: '$2',
                  }}
                >
                  {branch}
                </Text>
              </Stack>
            )}
            {activeTab === 'commit' && (
              <PushSettingForm
                commitMessage={commitMessage}
                branch={branch}
                handleBranchChange={handleBranchChange}
                handleCommitMessageChange={handleCommitMessageChange}
              />
            )}
            {activeTab === 'diff' && <ChangedStateList />}
            {activeTab === 'json' && <PushJSON />}
          </Stack>
        </Modal>
      );
    }
    case 'loading': {
      return (
        <Modal isOpen close={onCancel}>
          <Stack direction="column" gap={4} justify="center" align="center" css={{ padding: '$4 0' }}>
            <Spinner />
            <Heading size="medium">
              {t('pushingTo')}
              {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
              {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
              {localApiState.provider === StorageProviderType.BITBUCKET && ' Bitbucket'}
              {localApiState.provider === StorageProviderType.ADO && ' ADO'}
              {localApiState.provider === StorageProviderType.SUPERNOVA && ' Supernova.io'}
            </Heading>
          </Stack>
        </Modal>
      );
    }
    case 'success': {
      return (
        <Modal isOpen close={onCancel}>
          <Stack direction="column" align="center" gap={6} css={{ textAlign: 'center', padding: '$4 0' }}>
            <Stack direction="column" gap={4}>
              <Heading data-testid="push-dialog-success-heading" size="medium">
                All done!
              </Heading>
              <Text size="small">
                {t('changesPushedTo')}
                {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
                {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
                {localApiState.provider === StorageProviderType.BITBUCKET && ' Bitbucket'}
                {localApiState.provider === StorageProviderType.ADO && ' ADO'}
                {localApiState.provider === StorageProviderType.SUPERNOVA && ' Supernova.io'}
              </Text>
            </Stack>
            {/* @ts-ignore Exception for Button to accept target */}
            <Button as="a" target="_blank" variant="primary" href={redirectHref}>
              {localApiState.provider === StorageProviderType.SUPERNOVA ? (
                <>{t('openSupernovaWorkspace')}</>
              ) : (
                <>{t('createPullRequest')}</>
              )}
            </Button>
          </Stack>
        </Modal>
      );
    }
    default: {
      return null;
    }
  }
}
export default PushDialog;
