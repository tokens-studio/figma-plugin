import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Box, Badge, Stack, DropdownMenu, IconButton,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import { DotsVerticalIcon } from '@radix-ui/react-icons';

import { IconFile } from '@/icons';
import { StyledStorageItem } from './StyledStorageItem';
import { Dispatch } from '../store';
import useStorage from '../store/useStorage';
import { storageTypeSelector } from '@/selectors';
import useConfirm from '../hooks/useConfirm';
import { StorageProviderType } from '@/constants/StorageProviderType';
import {
  TokenFormatOptions,
} from '@/plugin/TokenFormatStoreClass';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';

function FormatSelector() {
  const tokenFormat = useSelector(tokenFormatSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleValueChange = React.useCallback(() => {
    dispatch.tokenState.setTokenFormat(TokenFormatOptions.DTCG);
  }, [dispatch.tokenState]);

  return tokenFormat === TokenFormatOptions.DTCG ? null : (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild data-testid="storage-item-tools-dropdown">
        <IconButton icon={<DotsVerticalIcon />} variant="invisible" size="small" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={handleValueChange}>Convert to DTCG</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}

const LocalStorageItem = () => {
  const { t } = useTranslation(['storage']);
  const dispatch = useDispatch<Dispatch>();
  const storageType = useSelector(storageTypeSelector);
  const { confirm } = useConfirm();
  const { setStorageType } = useStorage();

  const handleSubmitLocalStorage = React.useCallback(() => {
    dispatch.uiState.setLocalApiState({ provider: StorageProviderType.LOCAL });
    // setStorageProvider(StorageProviderType.LOCAL);
    setStorageType({
      provider: { provider: StorageProviderType.LOCAL },
      shouldSetInDocument: true,
    });
    dispatch.tokenState.setEditProhibited(false);
  }, [dispatch.tokenState, dispatch.uiState, setStorageType]);

  const handleSetLocalStorage = React.useCallback(async () => {
    if (storageType?.provider !== StorageProviderType.LOCAL) {
      const confirmResult = await confirm({
        text: t('setToDocumentStorage') as string,
        description: t('youCanAlwaysGoBack') as string,
      });
      if (confirmResult) {
        handleSubmitLocalStorage();
      }
      return null;
    }
  }, [confirm, handleSubmitLocalStorage, storageType?.provider, t]);

  const isActive = storageType.provider === StorageProviderType.LOCAL;

  return (
    <StyledStorageItem active={isActive}>
      <Box
        css={{
          alignItems: 'center',
          flexDirection: 'row',
          flexGrow: '1',
          display: 'flex',
          overflow: 'hidden',
          gap: '$3',
        }}
      >
        <Box>
          <IconFile />
        </Box>
        <Box css={{ fontSize: '$small', fontWeight: '$sansBold' }}>{t('localDocument')}</Box>
      </Box>
      <Box
        css={{
          marginRight: '$2',
          minHeight: '$controlSmall',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isActive ? (
          <Stack direction="row" align="center" gap={2}>
            <Badge>Active</Badge>
            <FormatSelector />
          </Stack>
        ) : (
          <Button
            data-testid="button-storage-item-apply"
            size="small"
            variant="secondary"
            onClick={handleSetLocalStorage}
          >
            {t('apply')}
          </Button>
        )}
      </Box>
    </StyledStorageItem>
  );
};

export default LocalStorageItem;