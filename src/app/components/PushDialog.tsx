import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { localApiStateSelector } from '@/selectors';
import usePushDialog from '../hooks/usePushDialog';
import { getGithubCreatePullRequestUrl } from '../store/providers/github';
import { getGitlabCreatePullRequestUrl } from '../store/providers/gitlab';
import { getADOCreatePullRequestUrl } from '../store/providers/ado';
import Button from './Button';
import Heading from './Heading';
import Input from './Input';
import Modal from './Modal';
import Stack from './Stack';
import Spinner from './Spinner';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { isGitProvider } from '@/utils/is';

function ConfirmDialog() {
  const { onConfirm, onCancel, showPushDialog } = usePushDialog();
  const localApiState = useSelector(localApiStateSelector);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [branch, setBranch] = React.useState((isGitProvider(localApiState) ? localApiState.branch : '') || '');
  const [owner, repo] = localApiState.id.split('/');

  React.useEffect(() => {
    if (showPushDialog === 'initial' && isGitProvider(localApiState)) {
      setCommitMessage('');
      setBranch(localApiState.branch ?? '');
    }
  }, [showPushDialog, localApiState]);

  // @TODO ANTI-PATTERN - FIX THIS
  let redirectHref = '';
  if (localApiState && 'id' in localApiState && localApiState.id) {
    switch (localApiState.provider) {
      case StorageProviderType.GITHUB:
        redirectHref = getGithubCreatePullRequestUrl({
          base: localApiState.baseUrl, repo: localApiState.id, branch,
        });
        break;
      case StorageProviderType.GITLAB:

        redirectHref = getGitlabCreatePullRequestUrl({ owner, repo });
        break;
      case StorageProviderType.ADO:
        redirectHref = getADOCreatePullRequestUrl({
          branch,
          projectId: localApiState.name,
          orgUrl: localApiState.baseUrl,
          repositoryId: localApiState.id,
        });
        break;
      default:
        redirectHref = '';
        break;
    }
  }

  const handleFormSubmit = useCallback(() => onConfirm(commitMessage, branch), [commitMessage, branch, onConfirm]);
  const handleBranchChange = useCallback((e) => setBranch(e.target.value), [setBranch]);
  const handleCommitMessageChange = useCallback((e) => setCommitMessage(e.target.value), [setCommitMessage]);

  switch (showPushDialog) {
    case 'initial': {
      return (
        <Modal large isOpen close={onCancel}>
          <form onSubmit={handleFormSubmit}>
            <Stack direction="column" gap={4}>
              <Stack direction="column" gap={2}>
                <Heading>Push changes</Heading>
                <p className="text-xs">Push your local changes to your repository.</p>
                <div className="text-xxs font-mono bg-gray-100 rounded p-2 text-gray-600">
                  {'id' in localApiState ? localApiState.id : null}
                </div>
                <Input
                  full
                  label="Commit message"
                  value={commitMessage}
                  onChange={handleCommitMessageChange}
                  type="text"
                  name="commitMessage"
                  required
                />
                <Input
                  full
                  label="Branch"
                  value={branch}
                  onChange={handleBranchChange}
                  type="text"
                  name="branch"
                  required
                />
              </Stack>
              <Stack direction="row" gap={4} justify="between">
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!commitMessage} variant="primary">
                  Push
                </Button>
              </Stack>
            </Stack>
          </form>
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
              {localApiState.provider === StorageProviderType.ADO && ' ADO'}
            </Heading>
          </Stack>
        </Modal>
      );
    }
    case 'success': {
      return (
        <Modal large isOpen close={onCancel}>
          <div className="text-center">
            <div className="mb-8 space-y-4">
              <Heading size="medium">All done!</Heading>
              <div className="text-xs">
                Changes pushed to
                {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
                {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
                {localApiState.provider === StorageProviderType.ADO && ' ADO'}
                .
              </div>
            </div>
            <Button variant="primary" href={redirectHref}>
              Create Pull Request
            </Button>
          </div>
        </Modal>
      );
    }
    default: {
      return null;
    }
  }
}
export default ConfirmDialog;
