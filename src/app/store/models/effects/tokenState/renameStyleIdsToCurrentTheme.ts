import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

export function renameStyleIdsToCurrentTheme(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    // @ts-ignore
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });
  };
}
