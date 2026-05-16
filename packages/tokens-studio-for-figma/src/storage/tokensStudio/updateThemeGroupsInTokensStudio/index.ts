import { RematchDispatch, RematchRootState } from '@rematch/core';
import { pushToTokensStudio, pushToTokensStudioOAuth } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType, TokensStudioOAuthStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ThemeObject, ThemeObjectsList } from '@/types';
import { getThemeGroupsToUpdate } from './getThemeGroupsToUpdate';
import { updateThemeGroupName } from './updateThemeGroupName';
import { saveTheme } from './saveTheme';
import { deleteTheme } from './deleteTheme';

interface UpdateThemeGroupsInTokensStudioPayload {
  prevState: RematchRootState<RootModel, Record<string, never>>;
  rootState: RematchRootState<RootModel, Record<string, never>>;
  dispatch: RematchDispatch<RootModel>;
  action: any;
}

export async function updateThemeGroupsInTokensStudio({
  prevState,
  rootState,
  action,
}: UpdateThemeGroupsInTokensStudioPayload) {
  const {
    tokenState: { themes },
  } = rootState;
  const {
    tokenState: { themes: prevThemes },
  } = prevState;

  let themeToCreate: ThemeObject | null = null;
  let themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};
  let themeGroupsToDelete: string[] = [];

  switch (action.type) {
    case 'tokenState/updateThemeGroupName': {
      updateThemeGroupName({ action, themes, themeGroupsToUpdate });
      break;
    }
    case 'tokenState/saveTheme': {
      const themeGroupsToAlter = saveTheme({
        action,
        themes,
        prevThemes,
      });
      themeToCreate = themeGroupsToAlter.themeToCreate;
      themeGroupsToDelete = themeGroupsToAlter.themeGroupsToDelete;
      themeGroupsToUpdate = themeGroupsToAlter.themeGroupsToUpdate;
      break;
    }
    case 'tokenState/deleteTheme': {
      const themeGroupsToAlter = deleteTheme({
        action,
        themes,
        prevThemes,
      });
      themeGroupsToDelete = themeGroupsToAlter.themeGroupsToDelete;
      themeGroupsToUpdate = themeGroupsToAlter.themeGroupsToUpdate;
      break;
    }
    case 'tokenState/assignVariableIdsToCurrentTheme':
    case 'tokenState/assignVariableIdsToTheme':
    case 'tokenState/assignStyleIdsToCurrentTheme':
    case 'tokenState/assignStyleIdsToTheme':
    case 'tokenState/disconnectVariableFromTheme':
    case 'tokenState/disconnectStyleFromTheme':
      themeGroupsToUpdate = getThemeGroupsToUpdate(themes);
      break;
    default:
  }

  for (const [groupName, themesToUpdate] of Object.entries(themeGroupsToUpdate)) {
    const data: any = {
      name: groupName,
      options: themesToUpdate.map((theme) => ({
        name: theme.name,
        selectedTokenSets: theme.selectedTokenSets,
        figmaStyleReferences: theme.$figmaStyleReferences,
        figmaVariableReferences: theme.$figmaVariableReferences,
        figmaCollectionId: theme.$figmaCollectionId,
        figmaModeId: theme.$figmaModeId,
      })),
    };

    // If the group name has changed, we need to send the old name in the newName field
    if (groupName !== themesToUpdate[0].group) {
      data.newName = themesToUpdate[0].group;
    }

    if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
      pushToTokensStudio({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
        action: 'UPDATE_THEME_GROUP',
        data,
      });
    }

    if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      pushToTokensStudioOAuth({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioOAuthStorageType, false>,
        action: 'UPDATE_THEME_GROUP',
        data: {
          ...data,
          id: themesToUpdate[0].id,
        },
      });
    }
  }

  if (themeToCreate) {
    const data = {
      name: themeToCreate.group,
      options: [{
        name: themeToCreate.name,
        selectedTokenSets: themeToCreate.selectedTokenSets,
        figmaStyleReferences: themeToCreate.$figmaStyleReferences,
        figmaVariableReferences: themeToCreate.$figmaVariableReferences,
        figmaCollectionId: themeToCreate.$figmaCollectionId,
        figmaModeId: themeToCreate.$figmaModeId,
      }],
    };

    if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
      pushToTokensStudio({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
        action: 'CREATE_THEME_GROUP',
        data,
      });
    }

    if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      pushToTokensStudioOAuth({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioOAuthStorageType, false>,
        action: 'CREATE_THEME_GROUP',
        data,
      });
    }
  }

  if (themeGroupsToDelete.length) {
    for (const groupName of themeGroupsToDelete) {
      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO) {
        pushToTokensStudio({
          context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
          action: 'DELETE_THEME_GROUP',
          data: {
            name: groupName,
          },
        });
      }

      if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
        const themeToDelete = prevThemes.find((theme) => theme.group === groupName || theme.name === groupName);
        if (themeToDelete) {
          pushToTokensStudioOAuth({
            context: rootState.uiState.api as StorageTypeCredential<TokensStudioOAuthStorageType, false>,
            action: 'DELETE_THEME_GROUP',
            data: {
              id: themeToDelete.id,
            },
          });
        }
      }
    }
  }
}
