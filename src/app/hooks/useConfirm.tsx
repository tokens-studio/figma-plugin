import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo, useRef } from 'react';
import { Dispatch } from '../store';
import { ConfirmProps } from '../store/models/uiState';
import { confirmStateSelector } from '@/selectors';

type ResolveCallbackPayload<C = any> = false | {
  result: true;
  data: C;
};

function useConfirm<C = any>() {
  const confirmState = useSelector(confirmStateSelector);
  const resolveCallbackRef = useRef<(payload: ResolveCallbackPayload<C>) => void>(() => {});
  const dispatch = useDispatch<Dispatch>();

  const confirm = useCallback((opts: ConfirmProps) => {
    const {
      text,
      description,
      confirmAction,
      choices,
      input,
    } = opts;

    dispatch.uiState.setShowConfirm({
      input,
      description,
      confirmAction,
      text: text ?? '',
      choices: choices ?? [],
    });

    return new Promise<ResolveCallbackPayload<C>>((res) => {
      resolveCallbackRef.current = res;
    });
  }, [dispatch.uiState]);

  const closeConfirm = useCallback(() => {
    dispatch.uiState.setHideConfirm();
  }, [dispatch.uiState]);

  const onCancel = useCallback(() => {
    closeConfirm();
    resolveCallbackRef.current(false);
  }, [closeConfirm]);

  const onConfirm = useCallback((data: C) => {
    closeConfirm();
    resolveCallbackRef.current({ result: true, data });
  }, [closeConfirm]);

  return useMemo(() => ({
    confirm, onConfirm, onCancel, confirmState,
  }), [confirm, onConfirm, onCancel, confirmState]);
}

export default useConfirm;
