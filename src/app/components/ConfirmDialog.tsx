import React from 'react';
import useConfirm from '../hooks/useConfirm';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';

const ConfirmDialog = () => {
    const {onConfirm, onCancel, confirmState} = useConfirm();

    return confirmState.show ? (
        <Modal isOpen close={onCancel}>
            <div className="flex justify-center flex-col text-center space-y-4">
                <div className="space-y-2">
                    <Heading>{confirmState?.text && confirmState.text}</Heading>
                    {confirmState?.description && <p className="text-xs"> {confirmState.description}</p>}
                </div>
                <div className="space-x-4">
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={onConfirm}>
                        Yes
                    </Button>
                </div>
            </div>
        </Modal>
    ) : null;
};
export default ConfirmDialog;
