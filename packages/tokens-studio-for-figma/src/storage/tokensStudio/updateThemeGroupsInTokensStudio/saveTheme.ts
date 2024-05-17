import { ThemeObject, ThemeObjectsList } from '@/types';
import { getThemeGroupsToUpdate } from './getThemeGroupsToUpdate';

type Props = {
  action: any;
  themes: ThemeObjectsList;
  prevThemes: ThemeObjectsList;
  groupIdsMap: Record<string, string>;
};

export const saveTheme = ({
  action, themes: newThemes, prevThemes, groupIdsMap,
}: Props) => {
  const {
    payload: { id, name, group },
  } = action;

  const themes = newThemes.map((theme) => (!id && theme.name === name ? { ...theme, id: '' } : theme));

  let themeToCreate: ThemeObject | null = null;
  let themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};
  let themeGroupsToDelete: string[] = [];

  if (id) {
    if (groupIdsMap[group]) {
      // theme value updated and/or moved to an existing group
      themeGroupsToUpdate = getThemeGroupsToUpdate(themes, groupIdsMap);
      themeGroupsToDelete = Object.values(groupIdsMap).filter((groupId) => !themeGroupsToUpdate[groupId]);
    } else {
      // theme moved to a new group
      // Create new group with the moved theme
      const movedTheme = themes.find((theme) => theme.id === id);
      if (movedTheme) {
        themeToCreate = {
          ...movedTheme,
          groupId: undefined,
        };
      }

      // remove the theme from the old group or remove the group if there are no themes left
      const movedThemePrevGroupId = prevThemes.find((theme) => theme.id === id)?.groupId;

      if (movedThemePrevGroupId) {
        const themesToUpdate = themes.filter(({ groupId, name: themeName }) => groupId === movedThemePrevGroupId && themeName !== name);

        if (themesToUpdate.length) {
          themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate, groupIdsMap);
        } else {
          themeGroupsToDelete.push(movedThemePrevGroupId);
        }
      }
    }
  } else if (groupIdsMap[group]) {
    // theme created in an existing group
    themeGroupsToUpdate = getThemeGroupsToUpdate(themes, groupIdsMap);
  } else {
    // theme created in a new group
    const newTheme = themes.find((theme) => theme.name === name);
    if (newTheme) {
      themeToCreate = newTheme;
    }
  }

  return { themeGroupsToUpdate, themeGroupsToDelete, themeToCreate };
};
