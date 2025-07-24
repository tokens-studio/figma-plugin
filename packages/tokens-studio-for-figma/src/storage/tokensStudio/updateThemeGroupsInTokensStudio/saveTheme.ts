import { ThemeObject, ThemeObjectsList } from '@/types';
import { getThemeGroupsToUpdate } from './getThemeGroupsToUpdate';

type Props = {
  action: any;
  themes: ThemeObjectsList;
  prevThemes: ThemeObjectsList;
};

export const saveTheme = ({ action, themes: newThemes, prevThemes }: Props) => {
  const {
    payload: {
      name, group, meta, id,
    },
  } = action;

  const prevGroupsThemes = prevThemes.reduce((acc, theme) => {
    if (theme.group) {
      acc[theme.group] = [...(acc[theme.group] || []), theme];
    }
    return acc;
  }, {});
  const newGroupsThemes = newThemes.reduce((acc, theme) => {
    if (theme.group) {
      acc[theme.group] = [...(acc[theme.group] || []), theme];
    }
    return acc;
  }, {});

  let themeToCreate: ThemeObject | null = null;
  let themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};
  const themeGroupsToDelete: string[] = [];

  const themeObject = newThemes.find((newTheme) => newTheme.name === name);

  if (!themeObject) {
    return { themeGroupsToUpdate, themeGroupsToDelete, themeToCreate: null };
  }

  if (!id) {
    // created theme
    if (group && prevGroupsThemes[group]) {
      // created in an existing group
      themeGroupsToUpdate = getThemeGroupsToUpdate(newGroupsThemes[group]);
    } else {
      // created in a new group
      themeToCreate = themeObject;
    }
  } else {
    // updated theme
    const themeGroupChanged = group !== meta?.oldGroup;

    if (themeGroupChanged) {
      const groupExists = prevGroupsThemes[group];
      const themesToUpdate: ThemeObject[] = [];
      if (groupExists) {
        // update theme group
        themesToUpdate.push(...newGroupsThemes[group]);
      } else {
        // create new group
        themeToCreate = themeObject;
      }

      // update old group or remove it if there are no themes left
      const remainingThemeInOldGroup = newGroupsThemes[meta.oldGroup];
      if (remainingThemeInOldGroup?.length) {
        themesToUpdate.push(...remainingThemeInOldGroup);
      } else {
        themeGroupsToDelete.push(meta.oldGroup);
      }

      themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate);
    } else {
      // updated theme values
      themeGroupsToUpdate = getThemeGroupsToUpdate(newGroupsThemes[group]);
    }
  }

  return { themeGroupsToUpdate, themeGroupsToDelete, themeToCreate };
};
