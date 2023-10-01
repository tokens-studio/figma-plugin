import { useDispatch, useSelector } from 'react-redux';
import {
  useCallback, useMemo,
} from 'react';
import { Dispatch } from '../store';
import { ConfirmProps } from '../store/models/uiState';
import { confirmStateSelector } from '@/selectors';

export type ResolveCallbackPayload<C = any> = false | {
  result: true;
  data: C;
};

let resolveCallback: (payload: ResolveCallbackPayload<any>) => void = () => {};

function useConfirm<C = any>() {
  const confirmState = useSelector(confirmStateSelector);
  const dispatch = useDispatch<Dispatch>();

  const confirm = useCallback((opts: ConfirmProps) => {
    const {
      text,
      description,
      confirmAction,
      cancelAction,
      choices,
      input,
    } = opts;

    dispatch.uiState.setShowConfirm({
      input,
      description,
      confirmAction,
      cancelAction,
      text: text ?? '',
      choices: choices ?? [],
    });

    return new Promise<ResolveCallbackPayload<C>>((res) => {
      resolveCallback = res;
    });
  }, [dispatch.uiState]);

  const closeConfirm = useCallback(() => {
    dispatch.uiState.setHideConfirm();
  }, [dispatch.uiState]);

  const onCancel = useCallback(() => {
    resolveCallback(false);
    closeConfirm();
  }, [closeConfirm]);

  const onConfirm = useCallback((data: C) => {
    resolveCallback({ result: true, data });
    closeConfirm();
  }, [closeConfirm]);

  return useMemo(() => ({
    confirm, onConfirm, onCancel, confirmState,
  }), [confirm, onConfirm, onCancel, confirmState]);
}

export default useConfirm;
