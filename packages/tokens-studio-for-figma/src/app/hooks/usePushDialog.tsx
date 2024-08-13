import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { showPushDialogSelector } from '@/selectors';
import { Dispatch } from '../store';
import { PushOverrides } from '../store/remoteTokens';

// @TODO fix using useCallback and other memoization

export type PushDialogPromiseResult = {
  commitMessage: string;
  customBranch: string;
};

export type UseDialogResult = {
  showPushDialog?: { state: string | boolean, overrides?: PushOverrides };
  closePushDialog: () => void
  pushDialog: ({ state, overrides }: { state?: string, overrides?: PushOverrides }) => Promise<PushDialogPromiseResult | null>
  onConfirm: (commitMessage: string, customBranch: string) => void
  onCancel: () => void
};

let resolveCallback: (result: PushDialogPromiseResult | null) => void = () => {};
function usePushDialog(): UseDialogResult {
  const showPushDialog = useSelector(showPushDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const pushDialog: UseDialogResult['pushDialog'] = useCallback(({ state, overrides }) => {
    if (state) {
      dispatch.uiState.setShowPushDialog({ state, overrides });
    } else {
      dispatch.uiState.setShowPushDialog({ state: 'initial', overrides });
    }
    return new Promise<PushDialogPromiseResult | null>((res) => {
      resolveCallback = res;
    });
  }, [dispatch]);

  const closePushDialog = useCallback(() => {
    dispatch.uiState.setShowPushDialog({ state: false });
  }, [dispatch]);

  const onCancel = useCallback(() => {
    closePushDialog();
    resolveCallback(null);
  }, [closePushDialog]);

  const onConfirm = useCallback((commitMessage: string, customBranch: string) => {
    dispatch.uiState.setShowPushDialog({ state: 'loading' });
    resolveCallback({ commitMessage, customBranch });
  }, [dispatch]);

  return useMemo(() => ({
    pushDialog, onConfirm, onCancel, showPushDialog, closePushDialog,
  }), [pushDialog, onConfirm, onCancel, closePushDialog, showPushDialog]);
}

export default usePushDialog;
