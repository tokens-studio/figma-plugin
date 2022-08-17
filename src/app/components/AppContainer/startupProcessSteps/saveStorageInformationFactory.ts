import useStorage from '@/app/store/useStorage';
import type { Dispatch } from '@/app/store';
import type { StartupMessage } from '@/types/AsyncMessages';

export function saveStorageInformationFactory(
  dispatch: Dispatch,
  params: StartupMessage,
  useStorageResult: ReturnType<typeof useStorage>,
) {
  return async () => {
    const { setStorageType } = useStorageResult;
    const providers = params.localApiProviders ?? [];
    setStorageType({ provider: params.storageType });
    dispatch.uiState.setAPIProviders(providers);
  };
}
