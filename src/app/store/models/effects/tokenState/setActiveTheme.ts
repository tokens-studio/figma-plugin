import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

export function setActiveTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { themeId: string, shouldUpdateNodes?: boolean }): void => {
    dispatch.tokenState.updateDocument({ updateRemote: false, shouldUpdateNodes: payload.shouldUpdateNodes });
  };
}
