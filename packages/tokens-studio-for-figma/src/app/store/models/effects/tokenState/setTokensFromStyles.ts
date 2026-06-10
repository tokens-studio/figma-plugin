import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import type { SetTokensFromStylesPayload } from '@/types/payloads';

// The reducer for setTokensFromStyles populates importedTokens.newTokens, which causes the
// ImportedTokensDialog to appear. Studio OAuth write-back happens after the user confirms
// via the dialog — see the createMultipleTokens effect.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setTokensFromStyles(_dispatch: RematchDispatch<RootModel>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_payload: SetTokensFromStylesPayload, _rootState: any): void => {};
}
