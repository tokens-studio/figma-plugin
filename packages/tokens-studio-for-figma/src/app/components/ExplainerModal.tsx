import { HelpCircle } from 'iconoir-react';
import { IconButton, Stack } from '@tokens-studio/ui';
import React from 'react';
import Modal from './Modal';

export function ExplainerModal({ title, children, ...props }: { title: string, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const handleClose = React.useCallback(() => setOpen(false), []);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  return (
    <>
      <Modal title={title} isOpen={open} close={handleClose} {...props} showClose>
        <Stack direction="column" align="start" gap={4} css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
          {children}
        </Stack>
      </Modal>
      <IconButton icon={<HelpCircle />} variant="invisible" size="small" onClick={handleOpen} />
    </>
  );
}
