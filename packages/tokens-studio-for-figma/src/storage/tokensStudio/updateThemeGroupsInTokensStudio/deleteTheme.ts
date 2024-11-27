import { ThemeObjectsList } from '@/types';
import { getThemeGroupsToUpdate } from './getThemeGroupsToUpdate';

type Props = {
  action: any;
  themes: ThemeObjectsList;
  prevThemes: ThemeObjectsList;
};

export const deleteTheme = ({ action, themes, prevThemes }: Props) => {
  const { payload: themeId } = action;

  let themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};
  let themeGroupsToDelete: string[] = [];

  const themeGroupName = prevThemes.find((theme) => theme.id === themeId)?.group;

  if (themeGroupName) {
    const themesToUpdate = themes.filter(({ group }) => group === themeGroupName);

    if (themesToUpdate.length) {
      themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate);
    } else {
      themeGroupsToDelete = [themeGroupName];
    }
  }

  return { themeGroupsToUpdate, themeGroupsToDelete };
};
