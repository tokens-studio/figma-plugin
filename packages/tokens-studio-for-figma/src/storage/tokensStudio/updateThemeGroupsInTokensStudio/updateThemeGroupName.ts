import { ThemeObjectsList } from '@/types';

type Props = {
  action: any;
  themes: ThemeObjectsList;
  themeGroupsToUpdate: Record<string, ThemeObjectsList>;
};

export const updateThemeGroupName = ({ action, themes, themeGroupsToUpdate }: Props) => {
  const { meta: newName } = action;

  themes
    .filter((theme) => theme.group === newName)
    .forEach((theme) => {
      if (theme.groupId && theme.group) {
        themeGroupsToUpdate[theme.groupId] = themeGroupsToUpdate[theme.groupId] || [];
        themeGroupsToUpdate[theme.groupId].push(theme);
      }
    });
};
