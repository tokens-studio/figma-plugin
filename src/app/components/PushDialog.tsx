import React from 'react';
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

  const redirectHref = React.useMemo(() => {
    let redirectHref = '';
    if (localApiState && 'id' in localApiState && localApiState.id) {
      const [owner, repo] = localApiState.id.split('/');
      switch (localApiState.provider) {
        case StorageProviderType.GITHUB:
          redirectHref = getGithubCreatePullRequestUrl({
            base: localApiState.baseUrl, repo: localApiState.id, branch,
          });
          break;
        case StorageProviderType.GITLAB: {
          redirectHref = getGitlabCreatePullRequestUrl({ owner, repo });
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
    }
    return redirectHref;
  }, [branch, localApiState]);

  const handleCommitMessageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCommitMessage(event.target.value);
  }, [setCommitMessage]);

  const handleBranchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBranch(event.target.value);
  }, [setBranch]);

  const handleSubmit = React.useCallback(() => {
    onConfirm(commitMessage, branch);
  }, [branch, commitMessage, onConfirm]);

  React.useEffect(() => {
    if (showPushDialog === 'initial' && isGitProvider(localApiState)) {
      setCommitMessage('');
      setBranch(localApiState.branch ?? '');
    }
  }, [showPushDialog, localApiState]);

  switch (showPushDialog) {
    case 'initial': {
      return (
        <Modal large isOpen close={onCancel}>
          <form onSubmit={handleSubmit}>
            <Stack direction="column" gap={4}>
              <Stack direction="column" gap={2}>
                <Heading>Push changes</Heading>
                <p className="text-xs">Push your local changes to your repository.</p>
                <div className="p-2 font-mono text-gray-600 bg-gray-100 rounded text-xxs">
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
