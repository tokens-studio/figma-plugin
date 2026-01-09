import React from 'react';
import { Button } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { ModalProps, Modal } from './Modal/Modal';

export type SecondScreenDeprecationDialogProps = Omit<ModalProps, 'children' | 'title' | 'footer'>;

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
});

export default function SecondScreenDeprecationDialog({
  isOpen,
  close,
  ...props
}: SecondScreenDeprecationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      close={close}
      title="Second screen is being deprecated"
      showClose
      footer={(
        <ModalFooterRight>
          <a
            href="https://tokens.studio/studio-platform"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
            }}
          >
            <Button
              as="span"
              variant="primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span role="img" aria-label="point right" style={{ marginRight: 6 }}>👉</span>
              <span>Learn more about the Studio platform</span>
            </Button>
          </a>
        </ModalFooterRight>
      )}
      {...props}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          We&apos;ve moved this functionality into the Studio platform, where it now has a native home and can evolve faster alongside other Studio capabilities. This allows us to offer a more integrated, powerful, and future-proof experience.
        </p>
        <p>
          If you’re currently using Second screen, we recommend switching to Studio to continue using this functionality.
        </p>
      </div>
    </Modal>
  );
}
