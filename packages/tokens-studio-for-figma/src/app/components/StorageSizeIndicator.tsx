import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@/stitches.config';
import Box from './Box';
import Tooltip from './Tooltip';
import useTokenDataSize from '@/app/hooks/useTokenDataSize';
import useStorageLocation, { StorageLocation } from '@/app/hooks/useStorageLocation';

const StorageSizeText = styled('span', {
  fontSize: '$xsmall',
  color: '$fgMuted',
  variants: {
    warning: {
      true: {
        color: '$dangerFg',
      },
    },
  },
});

export default function StorageSizeIndicator() {
  const { t } = useTranslation(['storage']);
  const dataSize = useTokenDataSize();
  const { storageLocation } = useStorageLocation();

  if (dataSize === null) {
    return null;
  }

  const isNearLimit = dataSize > 80; // Show warning when approaching 80KB (80% of the 100KB limit)

  // Get storage location label
  const getStorageLabel = (location: StorageLocation) => {
    if (location === 'client') return t('storageLocation.client');
    if (location === 'shared') return t('storageLocation.shared');
    return '';
  };

  const storageLabel = getStorageLabel(storageLocation);

  // Create a more informative tooltip based on storage location
  const getTooltipText = () => {
    if (storageLocation === 'shared') {
      return t('storageSizeTooltipShared', { size: dataSize, limit: 100 });
    }
    if (storageLocation === 'client') {
      return t('storageSizeTooltipClient', { size: dataSize, limit: 5120 });
    }
    return t('storageSizeTooltip', { size: dataSize, limit: 100 });
  };

  return (
    <Tooltip label={getTooltipText()}>
      <Box css={{ display: 'flex', alignItems: 'center' }}>
        <StorageSizeText warning={isNearLimit}>
          {dataSize} KB {storageLabel ? `(${storageLabel})` : ''}
        </StorageSizeText>
      </Box>
    </Tooltip>
  );
}
