import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';

// The style export runs this once per theme, and each run can change any selected theme. It pushes to Tokens
// Studio once, through pushThemesToStudio, after the last theme.
export function assignStyleIdsToCurrentTheme(dispatch: RematchDispatch<RootModel>) {
  return (): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });
  };
}
