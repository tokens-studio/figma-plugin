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
  dispatch,
}: UpdateThemeGroupsInTokensStudioPayload) {
  const {
    tokenState: { themes },
  } = rootState;
  const {
    tokenState: { themes: prevThemes },
  } = prevState;
  const groupIdsMap = prevThemes.reduce((acc, theme) => {
    if (theme.groupId && theme.group) {
      acc[theme.group] = theme.groupId;
    }
    return acc;
  }, {} as Record<string, string>);

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
        action, themes, prevThemes, groupIdsMap,
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
      themeGroupsToUpdate = getThemeGroupsToUpdate(themes, groupIdsMap);
      break;
    default:
  }

  const updatedThemeGroups = await Promise.all(
    Object.entries(themeGroupsToUpdate).filter(([groupId]) => !!groupId).map(([groupId, themesToUpdate]) => pushToTokensStudio({
      context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
      action: 'UPDATE_THEME_GROUP',
      data: {
        groupId,
        name: themesToUpdate[0].group,
        options: themesToUpdate.map((theme) => ({
          name: theme.name,
          urn: theme.id,
          selectedTokenSets: JSON.stringify(theme.selectedTokenSets),
          figmaStyleReferences: JSON.stringify(theme.$figmaStyleReferences),
          figmaVariableReferences: JSON.stringify(theme.$figmaVariableReferences),
        })),
      },
    })),
  );

  let updatedFigmaThemes = [...themes];
  let shouldUpdateThemes = false;

  if (updatedThemeGroups.length && action.type === 'tokenState/saveTheme') {
    const updatedThemeGroupsMapping = (updatedThemeGroups as ThemeGroup[]).reduce((acc, group) => {
      if (group && typeof group !== 'boolean' && group.name && group.options) {
        acc[group.name] = {
          urn: group.urn,
          themes: group.options.reduce((themesAcc, theme) => {
            if (theme?.name && theme?.urn) {
              themesAcc[theme.name] = theme.urn;
            }
            return themesAcc;
          }, {} as Record<string, string>),
        };
      }
      return acc;
    }, {} as Record<string, { urn: string; themes: Record<string, string> }>);

    updatedFigmaThemes = updatedFigmaThemes.map((theme) => {
      if (theme.group && updatedThemeGroupsMapping[theme.group]) {
        const { urn: groupUrn, themes: groupThemes } = updatedThemeGroupsMapping[theme.group];
        return {
          ...theme,
          groupId: groupUrn,
          id: groupThemes[theme.name],
        };
      }

      return theme;
    });

    shouldUpdateThemes = true;
  }

  if (themeToCreate) {
    const createdThemeGroup = await pushToTokensStudio({
      context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
      action: 'CREATE_THEME_GROUP',
      data: {
        name: themeToCreate.group,
        options: {
          name: themeToCreate.name,
          selectedTokenSets: JSON.stringify(themeToCreate.selectedTokenSets),
          figmaStyleReferences: JSON.stringify(themeToCreate.$figmaStyleReferences),
          figmaVariableReferences: JSON.stringify(themeToCreate.$figmaVariableReferences),
        },
      },
    });

    if (createdThemeGroup && typeof createdThemeGroup !== 'boolean') {
      try {
        const { name: groupName, urn: groupUrn, options } = createdThemeGroup as ThemeGroup;

        if (!options || !options.length) {
          return;
        }

        const remoteTheme = options[0];

        updatedFigmaThemes = updatedFigmaThemes.map((theme) => {
          if (theme.group === groupName && theme.name === remoteTheme?.name) {
            return {
              ...theme,
              groupId: groupUrn,
              id: remoteTheme?.urn,
            };
          }
          return theme;
        });

        shouldUpdateThemes = true;
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  }

  if (shouldUpdateThemes) {
    dispatch({ type: 'tokenState/setThemes', payload: updatedFigmaThemes });
  }

  if (themeGroupsToDelete.length) {
    await Promise.all(
      themeGroupsToDelete.map((groupId) => pushToTokensStudio({
        context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
        action: 'DELETE_THEME_GROUP',
        data: {
          groupId,
        },
      })),
    );
  }
}
