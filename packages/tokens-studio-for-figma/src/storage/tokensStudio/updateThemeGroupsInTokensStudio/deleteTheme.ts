import { ThemeObjectsList } from '@/types';
import { getThemeGroupsToUpdate } from './getThemeGroupsToUpdate';

type Props = {
  action: any;
  themes: ThemeObjectsList;
  prevThemes: ThemeObjectsList;
  groupIdsMap: Record<string, string>;
};

export const deleteTheme = ({
  action, themes, prevThemes, groupIdsMap,
}: Props) => {
  const { payload: themeUrn } = action;

  let themeGroupsToUpdate: Record<string, ThemeObjectsList> = {};
  let themeGroupsToDelete: string[] = [];

  const themeGroupId = prevThemes.find((theme) => theme.id === themeUrn)?.groupId;

  if (themeGroupId) {
    const themesToUpdate = themes.filter(({ groupId }) => groupId === themeGroupId);

    if (themesToUpdate.length) {
      themeGroupsToUpdate = getThemeGroupsToUpdate(themesToUpdate, groupIdsMap);
    } else {
      themeGroupsToDelete = [themeGroupId];
    }
  }

  return { themeGroupsToUpdate, themeGroupsToDelete };
};
