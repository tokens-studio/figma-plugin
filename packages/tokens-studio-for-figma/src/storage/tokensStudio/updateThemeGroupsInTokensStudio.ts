import { RematchDispatch, RematchRootState } from '@rematch/core';
import { ThemeGroup } from '@tokens-studio/sdk';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
import { ThemeObject, ThemeObjectsList } from '@/types';

interface UpdateThemeGroupsInTokensStudioPayload {
  prevState: RematchRootState<RootModel, Record<string, never>>;
  rootState: RematchRootState<RootModel, Record<string, never>>;
  dispatch: RematchDispatch<RootModel>;
  action: any;
}

const getThemeGroupsToUpdate = (themes: ThemeObjectsList, groupIdsMap: Record<string, string>) => {
  const themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};

  themes.forEach((theme) => {
    if (theme.group && groupIdsMap[theme.group]) {
      themeGroupsToUpdate[groupIdsMap[theme.group]] = themeGroupsToUpdate[groupIdsMap[theme.group]] || [];
      themeGroupsToUpdate[groupIdsMap[theme.group]].push(theme);
    }
  });

  return themeGroupsToUpdate;
};

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
      const { meta: newName } = action;

      themes
        .filter((theme) => theme.group === newName)
        .forEach((theme) => {
          if (theme.groupId && theme.group) {
            themeGroupsToUpdate[theme.groupId] = themeGroupsToUpdate[theme.groupId] || [];
            themeGroupsToUpdate[theme.groupId].push(theme);
          }
        });
      break;
    }
    case 'tokenState/saveTheme': {
      const {
        payload: { id, name, group },
      } = action;

      if (id) {
        if (groupIdsMap[group]) { // theme value updated and/or moved to an existing group
          themeGroupsToUpdate = getThemeGroupsToUpdate(themes, groupIdsMap);
          themeGroupsToDelete = Object.values(groupIdsMap).filter((groupId) => !themeGroupsToUpdate[groupId]);
        } else { // theme moved to a new group
          // Create new group with the moved theme
          const movedTheme = themes.find((theme) => theme.id === id);
          if (movedTheme) {
            themeToCreate = movedTheme;
          }

          // remove the theme from the old group or remove the group if there are no themes left
          const movedThemePrevGroupId = prevThemes.find((theme) => theme.id === id)?.groupId;
          if (movedThemePrevGroupId) {
            const themesToUpdate = themes.filter(({ groupId }) => groupId === movedThemePrevGroupId);

            if (themesToUpdate.length) {
              themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate, groupIdsMap);
            } else {
              themeGroupsToDelete.push(movedThemePrevGroupId);
            }
          }
        }
      } else if (groupIdsMap[group]) { // theme created in an existing group
        themeGroupsToUpdate = getThemeGroupsToUpdate(themes, groupIdsMap);
      } else { // theme created in a new group
        const newTheme = themes.find((theme) => theme.name === name);
        if (newTheme) {
          themeToCreate = newTheme;
        }
      }
      break;
    }
    case 'tokenState/deleteTheme': {
      const { payload: themeUrn } = action;

      const themeGroupId = prevThemes.find((theme) => theme.id === themeUrn)?.groupId;

      if (themeGroupId) {
        const themesToUpdate = themes.filter(({ groupId }) => groupId === themeGroupId);

        if (themesToUpdate.length) {
          themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate, groupIdsMap);
        } else {
          themeGroupsToDelete.push(themeGroupId);
        }
      }
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
          urn: themeToCreate.id,
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
