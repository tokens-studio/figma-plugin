import React from 'react';
import ReactModal, { Styles as ReactModalStyles } from 'react-modal';
import Heading from '../Heading';
import Stack from '../Stack';
import XIcon from '@/icons/x.svg';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';

const customStyles = (large = false): ReactModalStyles => ({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1,
  },
  content: {
    padding: '0',
    position: 'relative',
    top: 'unset',
    right: 'unset',
    bottom: 'unset',
    left: 'unset',
    overflow: 'auto',
    maxHeight: '100%',
    border: 'none',
    width: large ? '100%' : 'auto',
  },
});

export type ModalProps = {
  id?: string;
  title?: string;
  full?: boolean;
  large?: boolean;
  compact?: boolean;
  isOpen: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode
  showClose?: boolean;
  close: () => void;
};

export function Modal({
  id,
  title,
  full,
  large,
  isOpen,
  close,
  children,
  footer,
  showClose = false,
  compact = false,
}: ModalProps) {
  React.useEffect(() => {
    if (typeof document !== 'undefined' && document.getElementById('app')) {
      ReactModal.setAppElement('#app');
    }
  }, []);

  const paddingClass = () => {
    if (compact) {
      return 'p-4';
    }
    if (full) {
      return 'p-0';
    }
    return 'p-8';
  };

  const handleClose = React.useCallback(() => {
    close();
  }, [close]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={close}
      style={customStyles(large)}
      contentLabel={title || ''}
    >
      {(showClose || title) && (
        <ModalHeader>
          <Stack direction="row" justify="between" align="center">
            {title && (
              <div className="pl-4">
                <Heading size="small">{title}</Heading>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-4 hover:bg-gray-100 rounded focus:outline-none"
              data-cy="close-button"
              data-testid="close-button"
            >
              <XIcon />
            </button>
          </Stack>
        </ModalHeader>
      )}
      <div data-cy={id} className={`relative ${paddingClass()}`}>
        {children}
      </div>
      {(!!footer) && (
        <ModalFooter>
          {footer}
        </ModalFooter>
      )}
    </ReactModal>
  );
}
