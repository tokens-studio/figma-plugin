import React from 'react';
import {useSelector} from 'react-redux';
import usePushDialog from '../hooks/usePushDialog';
import {RootState} from '../store';
import {getCreatePullRequestUrl} from '../store/providers/github';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';

const ConfirmDialog = () => {
    const {onConfirm, onCancel, showPushDialog} = usePushDialog();
    const {api, localApiState} = useSelector((state: RootState) => state.uiState);
    const [commitMessage, setCommitMessage] = React.useState('');
    const [branch, setBranch] = React.useState(localApiState.branch);

    React.useEffect(() => {
        if (showPushDialog === 'initial') {
            setCommitMessage('');
            setBranch(localApiState.branch);
        }
    }, [showPushDialog, localApiState.branch]);

    switch (showPushDialog) {
        case 'initial': {
            return (
                <Modal large isOpen close={onCancel}>
                    <form
                        onSubmit={() => onConfirm(commitMessage, branch)}
                        className="flex flex-col text-center space-y-4"
                    >
                        <div className="space-y-2 text-left flex flex-col">
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
                        </div>
                        <div className="space-x-4 flex flex-row justify-between">
                            <Button variant="secondary" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!commitMessage} variant="primary">
                                Push
                            </Button>
                        </div>
                    </form>
                </Modal>
            );
        }
        case 'loading': {
            return (
                <Modal large isOpen close={onCancel}>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rotate">
                            <Icon name="loading" />
                        </div>
                        <Heading size="large">Pushing to GitHub</Heading>
                    </div>
                </Modal>
            );
        }
        case 'success': {
            return (
                <Modal large isOpen close={onCancel}>
                    <div className="text-center">
                        <div className="mb-8 space-y-4">
                            <Heading size="large">All done!</Heading>
                            <div className="text-xs">Changes pushed to GitHub.</div>
                        </div>
                        <Button variant="primary" href={getCreatePullRequestUrl(localApiState.id, branch)}>
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
};
export default ConfirmDialog;
