import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

export function setActiveTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { themeId: string, shouldUpdateNodes?: boolean, shouldUpdateDocument?: boolean }): void => {
    if (payload.shouldUpdateDocument) {
      dispatch.tokenState.updateDocument({ updateRemote: false, shouldUpdateNodes: payload.shouldUpdateNodes });
    }
  };
}
