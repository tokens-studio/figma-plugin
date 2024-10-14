import { ThemeObjectsList } from '@/types';

export const getThemeGroupsToUpdate = (themes: ThemeObjectsList, groupIdsMap: Record<string, string>) => {
  const themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};

  themes.forEach((theme) => {
    if (theme.group && groupIdsMap[theme.group]) {
      themeGroupsToUpdate[groupIdsMap[theme.group]] = themeGroupsToUpdate[groupIdsMap[theme.group]] || [];
      themeGroupsToUpdate[groupIdsMap[theme.group]].push(theme);
    }
  });

  return themeGroupsToUpdate;
};
