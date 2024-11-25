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
      if (theme.group) {
        themeGroupsToUpdate[action.payload] = themeGroupsToUpdate[action.payload] || [];
        themeGroupsToUpdate[action.payload].push({
          ...theme,
        });
      }
    });
};
