import { createSelector } from 'reselect';
import type { RootState } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { StudioSimpleView } from '@/types/StudioSimpleView';

/**
 * The one gate for Tokens Studio's Simple view: the connected Tokens Studio (OAuth/REST) project's collections
 * and modes, only while that project is in Simple view. Null for every other provider, for local tokens, for an
 * Advanced Studio project and for a Simple view read for another project. Plain function so effects can call it
 * with a store snapshot.
 */
export function getStudioSimpleView(state: Pick<RootState, 'uiState' | 'tokenState'>): StudioSimpleView | null {
  const api = state.uiState?.api;
  const view = state.tokenState?.studioSimpleView;
  if (api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return null;
  if (!view || view.active !== true) return null;
  if (!api.id || view.projectId !== api.id) return null;
  return view;
}

export const studioSimpleViewSelector = createSelector(
  (state: RootState) => state.uiState.api,
  (state: RootState) => state.tokenState.studioSimpleView,
  (api, studioSimpleView) => getStudioSimpleView({ uiState: { api }, tokenState: { studioSimpleView } } as any),
);

export const isStudioSimpleViewSelector = createSelector(studioSimpleViewSelector, (view) => view !== null);

/** True while a Simple view write and the pull after it run. */
export const studioSimpleWritePendingSelector = (state: RootState) => state.tokenState.studioSimpleWritePending === true;
