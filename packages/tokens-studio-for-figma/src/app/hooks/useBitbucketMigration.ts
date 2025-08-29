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
} from '@/utils/bitbucketMigration';

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

  return {
    showDialog,
    hasAppPasswords,
    appPasswordCredentials,
    showMigrationDialog,
    hideMigrationDialog,
    checkAndShowMigrationDialog,
  };
}
