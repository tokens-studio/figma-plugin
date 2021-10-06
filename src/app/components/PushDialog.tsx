import React from 'react';
import {useSelector} from 'react-redux';
import usePushDialog from '../hooks/usePushDialog';
import {RootState} from '../store';
import Button from './Button';
import Heading from './Heading';
import Input from './Input';
import Modal from './Modal';

const ConfirmDialog = () => {
    const {onConfirm, onCancel, showPushDialog} = usePushDialog();
    const {api, localApiState} = useSelector((state: RootState) => state.uiState);
    const [commitMessage, setCommitMessage] = React.useState('');
    const [branch, setBranch] = React.useState(localApiState.branch);

    React.useEffect(() => {
        setCommitMessage('');
        setBranch(localApiState.branch);
    }, [showPushDialog, localApiState.branch]);

    return showPushDialog ? (
        <Modal large isOpen close={onCancel}>
            <form onSubmit={() => onConfirm(commitMessage, branch)} className="flex flex-col text-center space-y-4">
                <div className="space-y-2 text-left flex flex-col">
                    <Heading>Push changes</Heading>
                    <p className="text-xs">Push your local changes to your repository.</p>
                    <div className="text-xxs font-mono bg-gray-100 rounded p-2 text-gray-600">{api.id}</div>
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
    ) : null;
};
export default ConfirmDialog;
