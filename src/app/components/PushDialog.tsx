import React from 'react';
import usePushDialog from '../hooks/usePushDialog';
import Button from './Button';
import Heading from './Heading';
import Input from './Input';
import Modal from './Modal';

const ConfirmDialog = () => {
    const {onConfirm, onCancel, showPushDialog} = usePushDialog();
    const [commitMessage, setCommitMessage] = React.useState('');

    return showPushDialog ? (
        <Modal isOpen close={onCancel}>
            <form
                onSubmit={() => onConfirm(commitMessage)}
                className="flex justify-center flex-col text-center space-y-4"
            >
                <div className="space-y-2">
                    <Heading>Push changes</Heading>
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
                <div className="space-x-4">
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
