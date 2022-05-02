import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { showPushDialogSelector } from '@/selectors';
import { Dispatch } from '../store';

// @TODO fix using useCallback and other memoization

export type PushDialogPromiseResult = {
  commitMessage: string;
  customBranch: string;
};

export type UseDialogResult = {
  closeDialog: () => void
  pushDialog: (givenState?: string) => Promise<PushDialogPromiseResult | null>
  onConfirm: (commitMessage: string, customBranch: string) => void
  onCancel: () => void
};

let resolveCallback: (result: PushDialogPromiseResult | null) => void = () => {};
function usePushDialog(): UseDialogResult {
  const showPushDialog = useSelector(showPushDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const pushDialog: UseDialogResult['pushDialog'] = useCallback((givenState) => {
    if (givenState) {
      dispatch.uiState.setShowPushDialog(givenState);
    } else {
      dispatch.uiState.setShowPushDialog('initial');
    }
    return new Promise<PushDialogPromiseResult | null>((res) => {
      resolveCallback = res;
    });
  }, [dispatch]);

  const closeDialog = useCallback(() => {
    dispatch.uiState.setShowPushDialog(false);
  }, [dispatch]);

  const onCancel = useCallback(() => {
    closeDialog();
    resolveCallback(null);
  }, [closeDialog]);

  const onConfirm = useCallback((commitMessage: string, customBranch: string) => {
    dispatch.uiState.setShowPushDialog('loading');
    resolveCallback({ commitMessage, customBranch });
  }, [dispatch]);

  return useMemo(() => ({
    pushDialog, onConfirm, onCancel, showPushDialog, closeDialog,
  }), [pushDialog, onConfirm, onCancel, closeDialog, showPushDialog]);
}

export default usePushDialog;
