import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { backgroundJobsSelector } from '@/selectors';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { Dispatch } from '../store';

export type SyncProviderProgressDialogState = 'loading' | 'success' | false;

export const useSyncProviderProgressDialog = () => {
  const dispatch = useDispatch<Dispatch>();
  const backgroundJobs = useSelector(backgroundJobsSelector);

  const showSyncProviderDialog = useSelector((state: any) => state.uiState.showSyncProviderDialog as SyncProviderProgressDialogState);

  const activeSyncProviderJob = useMemo(() => (
    backgroundJobs?.find((job) => job.name === BackgroundJobs.UI_SYNC_PROVIDER_SETUP)
  ), [backgroundJobs]);

  const showDialog = useCallback((providerName: string) => {
    dispatch.uiState.setShowSyncProviderDialog('loading');
    dispatch.uiState.setSyncProviderName(providerName);
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_SYNC_PROVIDER_SETUP });
  }, [dispatch]);

  const hideDialog = useCallback(() => {
    dispatch.uiState.setShowSyncProviderDialog(false);
    dispatch.uiState.setSyncProviderName('');
    if (activeSyncProviderJob) {
      dispatch.uiState.completeJob(BackgroundJobs.UI_SYNC_PROVIDER_SETUP);
    }
  }, [dispatch, activeSyncProviderJob]);

  const showSuccess = useCallback(() => {
    dispatch.uiState.setShowSyncProviderDialog('success');
  }, [dispatch]);

  // Auto-transition to success when sync provider job completes successfully
  useEffect(() => {
    if (showSyncProviderDialog === 'loading' && !activeSyncProviderJob) {
      showSuccess();
    }
  }, [showSyncProviderDialog, activeSyncProviderJob, showSuccess]);

  return {
    showSyncProviderDialog,
    showDialog,
    hideDialog,
    showSuccess,
  };
};