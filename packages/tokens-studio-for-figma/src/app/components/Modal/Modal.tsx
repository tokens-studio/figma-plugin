import React from 'react';
import {
  Stack, Dialog, IconButton, Box, Heading,
} from '@tokens-studio/ui';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from '@primer/octicons-react';
import { ModalFooter } from './ModalFooter';
import { styled } from '@/stitches.config';

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

const StyledBody = styled('div', {
  position: 'relative',
  padding: '$4',
  overflow: 'auto',
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
  // TODO: Check if this is needed
  // React.useEffect(() => {
  //   if (typeof document !== 'undefined' && document.getElementById('app')) {
  //     ReactModal.setAppElement('#app');
  //   }
  // }, []);

  const handleClose = React.useCallback(() => {
    close();
  }, [close]);

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={close}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content css={{ padding: 0 }}>
          <Box css={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          >
            {(showClose || title) && (
            <Stack
              direction="row"
              justify="between"
              align="center"
              css={{
                borderBottomColor: '$borderMuted',
                borderBottomWidth: '1px',
                padding: '$4',
                position: 'sticky',
                backgroundColor: '$bgDefault',
                top: 0,
                zIndex: 10,
              }}
            >
              {title && (
                <Dialog.Title>
                  <Heading size="small">{title}</Heading>
                </Dialog.Title>
              )}
              <IconButton
                onClick={handleClose}
                data-testid="close-button"
                icon={<XIcon />}
                size="small"
                variant="invisible"
              />
            </Stack>
            )}
            <StyledBody compact={compact} full={full} data-testid={id}>
              {children}
            </StyledBody>
            {(!!footer) && (
            <ModalFooter stickyFooter={stickyFooter}>
                {footer}
            </ModalFooter>
            )}
          </Box>
        </Dialog.Content>
      </Dialog.Portal>
    </DialogPrimitive.Root>
  );
}
