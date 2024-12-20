import { ThemeObjectsList } from '@/types';

export const getThemeGroupsToUpdate = (themes: ThemeObjectsList) => {
  const themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};

  themes.forEach((theme) => {
    if (theme.group) {
      themeGroupsToUpdate[theme.group] = themeGroupsToUpdate[theme.group] || [];
      themeGroupsToUpdate[theme.group].push(theme);
    }
  });

  return themeGroupsToUpdate;
};
