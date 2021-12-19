import { useDispatch } from 'react-redux';
import { postToFigma } from '@/plugin/notifiers';
import { StorageType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { Dispatch } from '../store';

export default function useStorage() {
  const dispatch = useDispatch<Dispatch>();

  function setStorageType({
    provider,
    shouldSetInDocument = false,
  }: {
    provider: StorageType;
    shouldSetInDocument?: boolean;
  }) {
    if (shouldSetInDocument) {
      postToFigma({
        type: MessageToPluginTypes.SET_STORAGE_TYPE,
        storageType: provider,
      });
    }
    dispatch.uiState.setStorage(provider);
  }

  return { setStorageType };
}
