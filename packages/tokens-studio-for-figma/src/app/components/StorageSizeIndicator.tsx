import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Tooltip } from '@tokens-studio/ui';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import useConfirm from '../hooks/useConfirm';

type StorageSizeIndicatorProps = {
  size: number;
};

// Figma's limit for shared plugin data is 100KB
const SIZE_LIMIT = 100;

export default function StorageSizeIndicator({ size }: StorageSizeIndicatorProps) {
  const { t } = useTranslation(['storage']);
  const { confirm } = useConfirm();
  const isOverLimit = size > SIZE_LIMIT;

  const handleClick = React.useCallback(async () => {
    await confirm({
      text: t('sizeLimitDescription', { currentkb: size }) as string,
      description: t('sizeLimitRecommendation') as string,
      confirmAction: t('ok') as string,
    });
  }, [confirm, size, t]);

  return (
    <Tooltip label={t('storageSizeTooltip') as string}>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '$1',
          cursor: 'pointer',
          color: isOverLimit ? '$dangerFg' : '$fgMuted',
        }}
        onClick={handleClick}
        data-testid="storage-size-indicator"
      >
        {isOverLimit && <ExclamationTriangleIcon />}
        <Text size="xsmall">{`${size}kb`}</Text>
      </Box>
    </Tooltip>
  );
}
