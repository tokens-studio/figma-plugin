import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

export function setThemes(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: false,
      shouldUpdateNodes: false,
    });
  };
}
