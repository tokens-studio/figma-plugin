import React from 'react';
import { Button } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { ModalProps, Modal } from './Modal/Modal';

export type DeprecationDialogProps = Omit<ModalProps, 'children' | 'title'> & {
  message?: string;
};

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
});

const MessageBox = styled('div', {
  lineHeight: 1.6,
  padding: '$4',
  textAlign: 'center',
});

export default function DeprecationDialog({
  isOpen,
  close,
  message = 'Second Screen has been deprecated.',
  ...props
}: DeprecationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      close={close}
      title="Feature Deprecated"
      showClose
      footer={(
        <ModalFooterRight>
          <Button variant="primary" onClick={close}>OK</Button>
        </ModalFooterRight>
      )}
      {...props}
    >
      <MessageBox>
        <p style={{ fontSize: '14px', margin: 0 }}>
          {message}
        </p>
      </MessageBox>
    </Modal>
  );
}
