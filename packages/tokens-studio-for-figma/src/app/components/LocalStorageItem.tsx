import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Text,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';

import { IconFile } from '@/icons';
import { StyledStorageItem } from './StyledStorageItem';
import { Dispatch } from '../store';
import useStorage from '../store/useStorage';
import { storageTypeSelector } from '@/selectors';
import useConfirm from '../hooks/useConfirm';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenFormatBadge } from './TokenFormatBadge';
import styles from './LocalStorageItem.module.css';

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
    }
    return null;
  }, [confirm, handleSubmitLocalStorage, storageType?.provider, t]);

  const isActive = storageType.provider === StorageProviderType.LOCAL;

  return (
    <StyledStorageItem active={isActive} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <div className={styles.mainContainer}>
        <div className={styles.iconContainer}>
          <IconFile />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.titleText}>{t('localDocument')}</div>
          <Text muted size="xsmall">Tokens will be stored on this Figma file</Text>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        {isActive ? (
          <TokenFormatBadge extended />
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
      </div>
    </StyledStorageItem>
  );
};

export default LocalStorageItem;
