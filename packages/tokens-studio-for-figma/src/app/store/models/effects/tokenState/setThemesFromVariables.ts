import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { ThemeObjectsList } from '@/types';

// With Tokens Studio sync, writeVariableImportToTokensStudio pushes the imported themes.
export function setThemesFromVariables(dispatch: RematchDispatch<RootModel>) {
  return (_payload: ThemeObjectsList, _rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });
  };
}
