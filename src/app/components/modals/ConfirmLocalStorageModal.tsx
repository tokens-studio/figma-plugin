import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';

export default function ConfirmLocalStorageModal({ isOpen, onClose, onSuccess }) {
  return (
    <Modal isOpen={isOpen} close={() => onClose(false)}>
      <div className="flex justify-center flex-col text-center space-y-4">
        <div className="space-y-2">
          <Heading>Set to document storage?</Heading>
          <p className="text-xs">You can always go back to remote storage.</p>
        </div>
        <div className="space-x-4">
          <Button variant="secondary" size="large" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="large" onClick={onSuccess}>
            Yes, set to local.
          </Button>
        </div>
      </div>
    </Modal>
  );
}
