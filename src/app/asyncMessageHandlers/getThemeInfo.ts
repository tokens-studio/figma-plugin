import { store } from '@/app/store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import { ThemeObjectsList } from '@/types';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

interface ThemeInfo {
  activeTheme: Record<string, string>;
  themes: ThemeObjectsList;
}

export const getThemeInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_THEME_INFO] = async (): Promise<ThemeInfo> => {
  const state = store.getState();
  const activeTheme = activeThemeSelector(state);
  const themesList = themesListSelector(state);

  return {
    activeTheme,
    themes: themesList,
  };
};
