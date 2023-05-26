import React from 'react';
import { useSelector } from 'react-redux';
import {
  localApiStateSelector, remoteDataSelector, storageTypeSelector, themesListSelector, tokensSelector,
} from '@/selectors';
import usePushDialog from '../hooks/usePushDialog';
import { getBitbucketCreatePullRequestUrl } from '../store/providers/bitbucket';
import { getGithubCreatePullRequestUrl } from '../store/providers/github';
import { getGitlabCreatePullRequestUrl } from '../store/providers/gitlab';
import { getADOCreatePullRequestUrl } from '../store/providers/ado';
import Button from './Button';
import Heading from './Heading';
import Text from './Text';
import Modal from './Modal';
import Stack from './Stack';
import Spinner from './Spinner';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { isGitProvider } from '@/utils/is';
import { useShortcut } from '@/hooks/useShortcut';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';
import { TabButton } from './TabButton';
import PushJSON from './PushJSON';
import { findDifferentState } from '@/utils/findDifferentState';
import PushSettingForm from './PushSettingForm';
import { getSupernovaOpenCloud } from '../store/providers/supernova/getSupernovaOpenCloud';

function PushDialog() {
  const {
    onConfirm, onCancel, showPushDialog,
  } = usePushDialog();
  const localApiState = useSelector(localApiStateSelector);
  const storageType = useSelector(storageTypeSelector);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [branch, setBranch] = React.useState((isGitProvider(localApiState) ? localApiState.branch : '') || '');
  const [activeTab, setActiveTab] = React.useState('commit');
  const remoteData = useSelector(remoteDataSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const changedState = React.useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(remoteData, {
      tokens,
      themes,
      metadata: storageType.provider !== StorageProviderType.LOCAL ? { tokenSetOrder } : {},
    });
  }, [remoteData, tokens, themes, storageType]);

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
    if (showPushDialog === 'initial' && isGitProvider(localApiState)) {
      setCommitMessage('');
      setBranch(localApiState.branch ?? '');
    }
  }, [showPushDialog, localApiState]);

  const handlePushChanges = React.useCallback(() => {
    if (localApiState.provider === StorageProviderType.SUPERNOVA || (commitMessage && branch)) {
      onConfirm(commitMessage, branch);
    }
  }, [branch, commitMessage, onConfirm, localApiState]);

  const handleSaveShortcut = React.useCallback((event: KeyboardEvent) => {
    if (showPushDialog === 'initial' && (event.metaKey || event.ctrlKey)) {
      handlePushChanges();
    }
  }, [handlePushChanges, showPushDialog]);

  useShortcut(['Enter'], handleSaveShortcut);

  const handleSwitch = React.useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  switch (showPushDialog) {
    case 'initial': {
      return (
        <Modal
          full
          title={`Push to ${transformProviderName(storageType.provider)}`}
          showClose
          large
          isOpen
          close={onCancel}
        >
          <Stack direction="column" gap={4}>
            <div>
              <TabButton<string> name="commit" activeTab={activeTab} label="Commit" onSwitch={handleSwitch} />
              <TabButton<string> name="diff" activeTab={activeTab} label="Diff" onSwitch={handleSwitch} />
              <TabButton<string> name="json" activeTab={activeTab} label="JSON" onSwitch={handleSwitch} />
            </div>
            {
              activeTab !== 'commit' && localApiState.provider === StorageProviderType.SUPERNOVA && (
                <Stack direction="row" gap={2} align="center" css={{ display: 'inline', padding: '0 $4' }}>
                  This will push your local changes to the
                  {' '}
                  <Text
                    bold
                    css={{
                      display: 'inline', whiteSpace: 'nowrap', background: '$bgSubtle', padding: '$2',
                    }}
                  >
                    {' '}
                    {branch}
                  </Text>
                  {' '}
                  branch
                </Stack>
              )
            }
            {
              activeTab === 'commit' && <PushSettingForm commitMessage={commitMessage} branch={branch} handleBranchChange={handleBranchChange} handleCommitMessageChange={handleCommitMessageChange} />
            }
            {
              activeTab === 'diff' && <ChangedStateList changedState={changedState} />
            }
            {
              activeTab === 'json' && <PushJSON />
            }
            <Box css={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '$4',
              borderTop: '1px solid',
              borderColor: '$borderMuted',
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '$bgDefault',
            }}
            >
              <Button variant="secondary" id="push-dialog-button-close" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" id="push-dialog-button-push-changes" disabled={localApiState.provider !== StorageProviderType.SUPERNOVA && (!commitMessage || !branch)} onClick={handlePushChanges}>
                Push changes
              </Button>
            </Box>
          </Stack>
        </Modal>
      );
    }
    case 'loading': {
      return (
        <Modal large isOpen close={onCancel}>
          <Stack direction="column" gap={4} justify="center" align="center">
            <Spinner />
            <Heading size="medium">
              Pushing to
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
        <Modal large isOpen close={onCancel}>
          <Stack direction="column" gap={6} css={{ textAlign: 'center' }}>
            <Stack direction="column" gap={4}>
              <Heading id="push-dialog-success-heading" size="medium">All done!</Heading>
              <Text size="small">
                Changes pushed to
                {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
                {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
                {localApiState.provider === StorageProviderType.BITBUCKET && ' Bitbucket'}
                {localApiState.provider === StorageProviderType.ADO && ' ADO'}
                {localApiState.provider === StorageProviderType.SUPERNOVA && ' Supernova.io'}
              </Text>
            </Stack>
            <Button variant="primary" href={redirectHref}>
              {localApiState.provider === StorageProviderType.SUPERNOVA
                ? <>Open Supernova Workspace</>
                : <>Create Pull Request</>}
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
