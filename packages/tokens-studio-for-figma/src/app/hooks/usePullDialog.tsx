import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { showPullDialogSelector } from '@/selectors';
import { Dispatch } from '../store';

export type PullDialogPromiseResult = boolean;

export type UseDialogResult = {
  pullDialogMode?: string | boolean
  closePullDialog: () => void
  showPullDialog: (givenState?: string) => Promise<PullDialogPromiseResult | null>
  onConfirm: () => void
  onCancel: () => void
};

let resolveCallback: (result: PullDialogPromiseResult | null) => void = () => {};
function usePullDialog(): UseDialogResult {
  const pullDialogMode = useSelector(showPullDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const showPullDialog: UseDialogResult['showPullDialog'] = useCallback((givenState) => {
    if (givenState) {
      dispatch.uiState.setShowPullDialog(givenState);
    } else {
      dispatch.uiState.setShowPullDialog('initial');
    }
    return new Promise<PullDialogPromiseResult | null>((res) => {
      resolveCallback = res;
    });
  }, [dispatch]);

  const closePullDialog = useCallback(() => {
    dispatch.uiState.setShowPullDialog(false);
  }, [dispatch]);

  const onCancel = useCallback(() => {
    closePullDialog();
    resolveCallback(false);
  }, [closePullDialog]);

  const onConfirm = useCallback(() => {
    closePullDialog();
    resolveCallback(true);
  }, [closePullDialog]);

  return useMemo(() => ({
    showPullDialog, onConfirm, onCancel, pullDialogMode, closePullDialog,
  }), [showPullDialog, onConfirm, onCancel, closePullDialog, pullDialogMode]);
}

export default usePullDialog;
