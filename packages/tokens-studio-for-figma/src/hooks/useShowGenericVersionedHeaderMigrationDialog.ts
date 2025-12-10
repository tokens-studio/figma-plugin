import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { Dispatch } from '@/app/store';

export function useShowGenericVersionedHeaderMigrationDialog() {
  const dispatch = useDispatch<Dispatch>();
  const apiProviders = useSelector((state: any) => state.uiState?.apiProviders || []);
  const seenFlag = useSelector((state: any) => state.settings?.seenGenericVersionedHeaderMigrationDialog ?? false);
  const setSeenFlag = useCallback((flag: boolean) => {
    dispatch.settings.setSeenGenericVersionedHeaderMigrationDialog(flag);
  }, [dispatch]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const hasGeneric = apiProviders?.some((p) => p?.provider === StorageProviderType.GENERIC_VERSIONED_STORAGE);
    if (!seenFlag && hasGeneric) {
      setOpen(true);
    }
  }, [apiProviders, seenFlag]);
  const handleClose = useCallback(() => {
    setSeenFlag(true);
    setOpen(false);
  }, [setSeenFlag]);
  return { open, handleClose };
}
