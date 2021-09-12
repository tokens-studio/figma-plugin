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
    const {api} = useSelector((state: RootState) => state.uiState);
    const [commitMessage, setCommitMessage] = React.useState('');

    React.useEffect(() => {
        setCommitMessage('');
    }, [showPushDialog]);

    return showPushDialog ? (
        <Modal large isOpen close={onCancel}>
            <form onSubmit={() => onConfirm(commitMessage)} className="flex flex-col text-center space-y-4">
                <div className="space-y-2 text-left flex flex-col">
                    <Heading>Push changes</Heading>
                    <p className="text-xs">Push your local changes to your repository.</p>
                    <div className="text-xxs font-mono bg-gray-100 rounded p-2 text-gray-600">
                        {api.id} ({api.branch})
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
