import React from 'react';
import { useSelector } from 'react-redux';
import { localApiStateSelector } from '@/selectors';
import { StorageProviderType } from '@/types/api';
import usePushDialog from '../hooks/usePushDialog';
import { getGithubCreatePullRequestUrl } from '../store/providers/github';
import { getGitlabCreatePullRequestUrl } from '../store/providers/gitlab';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import Stack from './Stack';

function ConfirmDialog() {
  const { onConfirm, onCancel, showPushDialog } = usePushDialog();
  const localApiState = useSelector(localApiStateSelector);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [branch, setBranch] = React.useState(localApiState.branch);

  React.useEffect(() => {
    if (showPushDialog === 'initial') {
      setCommitMessage('');
      setBranch(localApiState.branch);
    }
  }, [showPushDialog, localApiState.branch]);

  let redirectHref = '';
  switch (localApiState.provider) {
    case StorageProviderType.GITHUB:
      redirectHref = getGithubCreatePullRequestUrl(localApiState.id, branch);
      break;
    case StorageProviderType.GITLAB:
      const [owner, repo] = localApiState.id.split('/');
      redirectHref = getGitlabCreatePullRequestUrl(owner, repo);
      break;
    default:
      redirectHref = '';
      break;
  }

  switch (showPushDialog) {
    case 'initial': {
      return (
        <Modal large isOpen close={onCancel}>
          <form
            onSubmit={() => onConfirm(commitMessage, branch)}
          >
            <Stack direction="column" gap={4}>
              <Stack direction="column" gap={2}>
                <Heading>Push changes</Heading>
                <p className="text-xs">Push your local changes to your repository.</p>
                <div className="text-xxs font-mono bg-gray-100 rounded p-2 text-gray-600">
                  {localApiState.id}
                </div>
                <Input
                  full
                  label="Commit message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  type="text"
                  name="commitMessage"
                  required
                />
                <Input
                  full
                  label="Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
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
            <div className="rotate">
              <Icon name="loading" />
            </div>
            <Heading size="large">
              Pushing to
              {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
              {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
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
              <Heading size="large">All done!</Heading>
              <div className="text-xs">
                Changes pushed to
                {localApiState.provider === StorageProviderType.GITHUB && ' GitHub'}
                {localApiState.provider === StorageProviderType.GITLAB && ' GitLab'}
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
