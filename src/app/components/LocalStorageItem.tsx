import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Box from './Box';
import { IconFile } from '@/icons';
import { StyledStorageItem } from './StyledStorageItem';
import Badge from './Badge';

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
        <Box css={{ fontSize: '$small', fontWeight: '$bold' }}>{t('localDocument')}</Box>
      </Box>
      <Box css={{ marginRight: '$2' }}>
        {isActive ? <Badge text="Active" /> : (
          <Button id="button-storage-item-apply" variant="secondary" onClick={onClick}>
            {t('apply')}
          </Button>
        )}
      </Box>
    </StyledStorageItem>
  );
};

export default LocalStorageItem;
