import React from 'react';
import ReactModal, { Styles as ReactModalStyles } from 'react-modal';
import Heading from '../Heading';
import Stack from '../Stack';
import XIcon from '@/icons/x.svg';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import Box from '../Box';
import { styled } from '@/stitches.config';

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
  stickyFooter?: boolean;
  showClose?: boolean;
  close: () => void;
};

const StyledButton = styled('button', {
  padding: '$4',
  '&:hover': {
    backgroundColor: '$bgSubtle',
  },
  '&:focus': {
    outline: 'none',
  },
});

const StyledBody = styled('div', {
  position: 'relative',
  padding: '$6',
  variants: {
    full: {
      true: {
        padding: 0,
      },
    },
    compact: {
      true: {
        padding: '$4',
      },
    },
  },
});

export function Modal({
  id,
  title,
  full,
  large,
  isOpen,
  close,
  children,
  footer,
  stickyFooter = false,
  showClose = false,
  compact = false,
}: ModalProps) {
  React.useEffect(() => {
    if (typeof document !== 'undefined' && document.getElementById('app')) {
      ReactModal.setAppElement('#app');
    }
  }, []);

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
              <Box css={{ paddingLeft: '$4' }}>
                <Heading size="small">{title}</Heading>
              </Box>
            )}
            <StyledButton
              type="button"
              onClick={handleClose}
              data-cy="close-button"
              data-testid="close-button"
            >
              <XIcon />
            </StyledButton>
          </Stack>
        </ModalHeader>
      )}
      <StyledBody compact={compact} full={full} data-cy={id}>
        {children}
      </StyledBody>
      {(!!footer) && (
        <ModalFooter stickyFooter={stickyFooter}>
          {footer}
        </ModalFooter>
      )}
    </ReactModal>
  );
}
