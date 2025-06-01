import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiStateSelector } from '@/selectors';
import { Dispatch } from '../store';

export function useApplyProgressDialog() {
  const { showApplyDialog } = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();

  const onCancel = useCallback(() => {
    dispatch.uiState.setShowApplyDialog(false);
  }, [dispatch]);

  return {
    onCancel,
    applyDialogMode: showApplyDialog,
  };
}