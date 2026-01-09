import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['secondScreen']);

  return (
    <Modal
      isOpen={isOpen}
      close={close}
      title={t('deprecationTitle')}
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
              <span>{t('learnMoreButton')}</span>
            </Button>
          </a>
        </ModalFooterRight>
      )}
      {...props}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          {t('description1')}
        </p>
        <p>
          {t('description2')}
        </p>
      </div>
    </Modal>
  );
}
