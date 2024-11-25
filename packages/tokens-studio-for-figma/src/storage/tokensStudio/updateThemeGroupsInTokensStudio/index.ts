import { RematchDispatch, RematchRootState } from '@rematch/core';
import { ThemeGroup } from '@tokens-studio/sdk';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
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
  // TODO: remove this
  const groupIdsMap = prevThemes.reduce((acc, theme) => {
    if (theme.group) {
      acc[theme.group] = theme.group;
    }
    return acc;
  }, {} as Record<string, string>);

  console.log('initial data', {
    prevThemes,
    themes,
    groupIdsMap,
    action,
  });
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
        groupIdsMap,
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

  console.log('themeGroupsToAlter', {
    themeGroupsToUpdate,
    themeGroupsToDelete,
    themeToCreate,
  });

  Promise.all(
    Object.entries(themeGroupsToUpdate)
      .filter(([groupName]) => !!groupName)
      .map(([groupName, themesToUpdate]) => {
        const data: any = {
          name: groupName,
          options: themesToUpdate.map((theme) => ({
            name: theme.name,
            selectedTokenSets: theme.selectedTokenSets,
            figmaStyleReferences: theme.$figmaStyleReferences,
            figmaVariableReferences: theme.$figmaVariableReferences,
          })),
        };

        // If the group name has changed, we need to send the old name in the newName field
        if (groupName !== themesToUpdate[0].group) {
          data.newName = themesToUpdate[0].group;
        }

        return pushToTokensStudio({
          context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
          action: 'UPDATE_THEME_GROUP',
          data,
        });
      }),
  );

  if (themeToCreate) {
    pushToTokensStudio({
      context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
      action: 'CREATE_THEME_GROUP',
      data: {
        name: themeToCreate.group,
        options: [{
          name: themeToCreate.name,
          selectedTokenSets: themeToCreate.selectedTokenSets,
          figmaStyleReferences: themeToCreate.$figmaStyleReferences,
          figmaVariableReferences: themeToCreate.$figmaVariableReferences,
        }],
      },
    });
  }

  if (themeGroupsToDelete.length) {
    Promise.all(
      themeGroupsToDelete.map((groupName) => pushToTokensStudio({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
        action: 'DELETE_THEME_GROUP',
        data: {
          name: groupName,
        },
      })),
    );
  }
}
