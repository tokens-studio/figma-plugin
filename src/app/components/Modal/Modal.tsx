import React from 'react';
import ReactModal, { Styles as ReactModalStyles } from 'react-modal';
import Heading from '../Heading';
import Stack from '../Stack';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement('#app');

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

type ModalProps = {
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
  const paddingClass = () => {
    if (compact) {
      return 'p-4';
    }
    if (full) {
      return 'p-0';
    }
    return 'p-8';
  };

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
              onClick={() => close()}
              className="p-4 hover:bg-gray-100 rounded focus:outline-none"
            >
              <svg
                className="svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 5.293l4.789-4.79.707.708-4.79 4.79 4.79 4.789-.707.707-4.79-4.79-4.789 4.79-.707-.707L5.293 6 .502 1.211 1.21.504 6 5.294z"
                  fillRule="nonzero"
                  fillOpacity="1"
                  fill="#000"
                  stroke="none"
                />
              </svg>
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
