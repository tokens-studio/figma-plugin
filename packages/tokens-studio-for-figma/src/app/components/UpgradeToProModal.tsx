import React, { useCallback } from 'react';
import {
  Button, Stack, Text,
} from '@tokens-studio/ui';
import Modal from './Modal';

type UpgradeToProModalProps = {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  title?: string;
  description?: string;
  image?: string;
};

export default function UpgradeToProModal({
  isOpen,
  onClose,
  feature,
  title,
  description,
  image,
}: UpgradeToProModalProps) {
  const handleUpgrade = useCallback(() => {
    const link = `https://tokens.studio/pro?ref=figma-plugin&utm_source=figma-plugin&utm_medium=upgrade-modal&utm_campaign=${encodeURIComponent(feature)}`;
    window.open(link, '_blank');
    onClose();
  }, [onClose, feature]);

  const modalTitle = title || 'Upgrade to Pro';

  return (
    <Modal title={modalTitle} isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
        {image && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
          >
            <img src={image} alt="Upgrade to Pro" />
          </div>
        )}
        <Text size="small">
          {description}
        </Text>
        <Stack direction="row" justify="end" gap={3}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpgrade}>
            Upgrade to Pro
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
