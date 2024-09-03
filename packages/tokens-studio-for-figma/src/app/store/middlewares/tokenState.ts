import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { updateThemeGroupsInTokensStudio } from '@/storage/tokensStudio/updateThemeGroupsInTokensStudio';

const actionsToTriggerUpdateInTokensStudio = [
  'tokenState/assignVariableIdsToCurrentTheme',
  'tokenState/assignVariableIdsToTheme',
  'tokenState/assignStyleIdsToCurrentTheme',
  'tokenState/assignStyleIdsToTheme',
  'tokenState/saveTheme',
  'tokenState/deleteTheme',
  'tokenState/updateThemeGroupName',
  'tokenState/disconnectVariableFromTheme',
  'tokenState/disconnectStyleFromTheme',
];

export const tokenStateMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  next(action);
  const nextState = store.getState();

  if (
    nextState.uiState.api?.provider === AVAILABLE_PROVIDERS.TOKENS_STUDIO
      && actionsToTriggerUpdateInTokensStudio.includes(action.type)
  ) {
    updateThemeGroupsInTokensStudio({
      prevState,
      rootState: nextState,
      action,
      dispatch: store.dispatch,
    });
  }
};
