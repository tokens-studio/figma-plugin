import { useDispatch, useSelector } from 'react-redux';
import { showPushDialogSelector } from '@/selectors';
import { Dispatch } from '../store';

// @TODO fix using useCallback and other memoization

let resolveCallback;
function usePushDialog() {
  const showPushDialog = useSelector(showPushDialogSelector);
  const dispatch = useDispatch<Dispatch>();

  const pushDialog = (givenState?: string): Promise<{ commitMessage: string; customBranch: string }> => {
    if (givenState) {
      dispatch.uiState.setShowPushDialog(givenState);
    } else {
      dispatch.uiState.setShowPushDialog('initial');
    }
    return new Promise((res) => {
      resolveCallback = res;
    });
  };

  const closeDialog = () => {
    dispatch.uiState.setShowPushDialog(false);
  };

  const onCancel = () => {
    closeDialog();
    resolveCallback(null);
  };

  const onConfirm = (commitMessage, customBranch) => {
    dispatch.uiState.setShowPushDialog('loading');
    resolveCallback({ commitMessage, customBranch });
  };

  return {
    pushDialog, onConfirm, onCancel, showPushDialog,
  };
}

export default usePushDialog;
