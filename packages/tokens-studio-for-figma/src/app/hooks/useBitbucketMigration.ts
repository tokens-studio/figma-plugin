import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@/app/store';
import {
  apiProvidersSelector,
  showBitbucketMigrationDialogSelector,
} from '@/selectors';
import {
  hasAppPasswordCredentials,
  findAppPasswordCredentials,
  BitbucketCredentials,
} from '@/utils/bitbucketMigration';
import { Tabs } from '@/constants/Tabs';

export function useBitbucketMigration() {
  const dispatch = useDispatch<Dispatch>();
  const apiProviders = useSelector(apiProvidersSelector);
  const showDialog = useSelector(showBitbucketMigrationDialogSelector);

  const appPasswordCredentials = findAppPasswordCredentials(apiProviders);
  const hasAppPasswords = hasAppPasswordCredentials(apiProviders);

  const showMigrationDialog = useCallback(() => {
    dispatch.uiState.setShowBitbucketMigrationDialog(true);
  }, [dispatch]);

  const hideMigrationDialog = useCallback(() => {
    dispatch.uiState.setShowBitbucketMigrationDialog(false);
  }, [dispatch]);

  const checkAndShowMigrationDialog = useCallback(() => {
    if (hasAppPasswords) {
      showMigrationDialog();
    }
  }, [hasAppPasswords, showMigrationDialog]);

  const handleMigrate = useCallback((credential: BitbucketCredentials) => {
    hideMigrationDialog();
    // Navigate to settings and trigger migration edit for the specific credential
    dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    dispatch.uiState.setTriggerMigrationEdit({ ...credential, migrating: true });
  }, [hideMigrationDialog, dispatch]);

  const closeDialog = useCallback(() => {
    hideMigrationDialog();
  }, [hideMigrationDialog]);

  return {
    showDialog,
    hasAppPasswords,
    appPasswordCredentials,
    showMigrationDialog,
    hideMigrationDialog,
    checkAndShowMigrationDialog,
    handleMigrate,
    closeDialog,
  };
}
