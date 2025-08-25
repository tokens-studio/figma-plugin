import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Button, Stack, Text,
} from '@tokens-studio/ui';
import Modal from './Modal';
import { track } from '@/utils/analytics';

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
  // Track when upgrade to pro modal is opened
  useEffect(() => {
    if (isOpen) {
      track('Upgrade to Pro Modal Opened', {
        feature,
        source: 'upgrade-modal',
      });
    }
  }, [isOpen, feature]);

  const handleUpgrade = useCallback(() => {
    // Track when user clicks upgrade to pro button
    track('Upgrade to Pro Button Clicked', {
      feature,
      source: 'upgrade-modal',
    });

    const link = `https://tokens.studio/pro?ref=figma-plugin&utm_source=figma-plugin&utm_medium=upgrade-modal&utm_campaign=${encodeURIComponent(feature)}`;
    window.open(link, '_blank');
    onClose();
  }, [onClose, feature]);

  const modalTitle = title || 'Upgrade to Pro';

  return (
    <Modal title={modalTitle} isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
        {image && (
          <Box css={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '$1',
            borderRadius: '$small',
            overflow: 'hidden',
            border: '1px solid $borderSubtle',
          }}
          >
            <img src={image} alt="Upgrade to Pro" />
          </Box>
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
