import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { showPullDialogSelector } from '@/selectors';
import { Dispatch } from '../store';

export type PullDialogPromiseResult = boolean;

export type UseDialogResult = {
  showPullDialog?: string | boolean
  closePullDialog: () => void
  pullDialog: (givenState?: string) => Promise<PullDialogPromiseResult | null>
  onConfirm: () => void
  onCancel: () => void
};

let resolveCallback: (result: PullDialogPromiseResult | null) => void = () => {};
function usePullDialog(): UseDialogResult {
  const showPullDialog = useSelector(showPullDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const pullDialog: UseDialogResult['pullDialog'] = useCallback((givenState) => {
    console.log('pullDialaog', givenState);
    if (givenState) {
      dispatch.uiState.setShowPullDialog(givenState);
    } else {
      console.log('initial');
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
    pullDialog, onConfirm, onCancel, showPullDialog, closePullDialog,
  }), [pullDialog, onConfirm, onCancel, closePullDialog, showPullDialog]);
}

export default usePullDialog;
