import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box, Badge } from '@tokens-studio/ui';
import { IconFile } from '@/icons';
import { StyledStorageItem } from './StyledStorageItem';

type Props = {
  onClick: () => void;
  isActive: boolean;
};

const LocalStorageItem = ({ onClick, isActive }: Props) => {
  const { t } = useTranslation(['storage']);
  return (
    <StyledStorageItem active={isActive}>
      <Box css={{
        alignItems: 'center', flexDirection: 'row', flexGrow: '1', display: 'flex', overflow: 'hidden', gap: '$3',
      }}
      >
        <Box>
          <IconFile />
        </Box>
        <Box css={{ fontSize: '$small', fontWeight: '$sansBold' }}>{t('localDocument')}</Box>
      </Box>
      <Box css={{
        marginRight: '$2', minHeight: '$controlSmall', display: 'flex', alignItems: 'center',
      }}
      >
        {isActive ? <Badge>Active</Badge> : (
          <Button data-testid="button-storage-item-apply" size="small" variant="secondary" onClick={onClick}>
            {t('apply')}
          </Button>
        )}
      </Box>
    </StyledStorageItem>
  );
};

export default LocalStorageItem;
