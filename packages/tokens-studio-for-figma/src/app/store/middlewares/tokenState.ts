import { StorageProviderType } from '@/constants/StorageProviderType';
import { updateThemeGroupsInTokensStudio } from '@/storage/tokensStudio/updateThemeGroupsInTokensStudio';
import { updateThemeRefsViaRestApi } from '@/utils/tokensStudio/updateThemeRefsViaRestApi';

const actionsToTriggerUpdateInTokensStudio = [
  'tokenState/assignVariableIdsToCurrentTheme',
  'tokenState/assignVariableIdsToTheme',
  'tokenState/assignStyleIdsToCurrentTheme',
  'tokenState/assignStyleIdsToTheme',
  'tokenState/saveTheme',
  'tokenState/setThemes',
  'tokenState/deleteTheme',
  'tokenState/updateThemeGroupName',
  'tokenState/disconnectVariableFromTheme',
  'tokenState/disconnectStyleFromTheme',
];

const refOnlyActions = [
  'tokenState/assignVariableIdsToCurrentTheme',
  'tokenState/assignVariableIdsToTheme',
  'tokenState/assignStyleIdsToCurrentTheme',
  'tokenState/assignStyleIdsToTheme',
  'tokenState/disconnectVariableFromTheme',
  'tokenState/disconnectStyleFromTheme',
  'tokenState/renameVariableIdsToTheme',
  'tokenState/renameStyleIdsToCurrentTheme',
  'tokenState/renameVariableNamesToThemes',
  'tokenState/renameStyleNamesToCurrentTheme',
  'tokenState/removeVariableNamesFromThemes',
  'tokenState/removeStyleNamesFromThemes',
  'tokenState/removeStyleIdsFromThemes',
];

export const tokenStateMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  next(action);
  const nextState = store.getState();

  if (
    nextState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO
      && actionsToTriggerUpdateInTokensStudio.includes(action.type)
  ) {
    updateThemeGroupsInTokensStudio({
      prevState,
      rootState: nextState,
      action,
      dispatch: store.dispatch,
    });
  }

  if (
    nextState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH
      && refOnlyActions.includes(action.type)
  ) {
    updateThemeRefsViaRestApi({
      prevState,
      rootState: nextState,
    }).catch((err) => console.error('[tokenStateMiddleware] REST ref sync failed:', err));
  }
};
