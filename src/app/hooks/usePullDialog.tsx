import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { showPullDialogSelector } from '@/selectors';
import { Dispatch } from '../store';

export type PullDialogPromiseResult = {
  shouldOverride: boolean
};

export type UseDialogResult = {
  showPullDialog?: string | boolean
  closeDialog: () => void
  pullDialog: (givenState?: string) => Promise<PullDialogPromiseResult | null>
  onConfirm: () => void
  onCancel: () => void
};

let resolveCallback: (result: PullDialogPromiseResult | null) => void = () => {};
function usePullDialog(): UseDialogResult {
  const showPullDialog = useSelector(showPullDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const pullDialog: UseDialogResult['pullDialog'] = useCallback((givenState) => {
    if (givenState) {
      dispatch.uiState.setShowPullDialog(givenState);
    } else {
      dispatch.uiState.setShowPullDialog('initial');
    }
    return new Promise<PullDialogPromiseResult | null>((res) => {
      resolveCallback = res;
    });
  }, [dispatch]);

  const closeDialog = useCallback(() => {
    dispatch.uiState.setShowPullDialog(false);
  }, [dispatch]);

  const onCancel = useCallback(() => {
    closeDialog();
    resolveCallback({ shouldOverride: false });
  }, [closeDialog]);

  const onConfirm = useCallback(() => {
    closeDialog();
    resolveCallback({ shouldOverride: true });
  }, [closeDialog]);

  return useMemo(() => ({
    pullDialog, onConfirm, onCancel, showPullDialog, closeDialog,
  }), [pullDialog, onConfirm, onCancel, closeDialog, showPullDialog]);
}

export default usePullDialog;
