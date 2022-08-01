import { store } from '@/app/store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { activeThemeSelector, themesListSelector } from '@/selectors';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const getThemeInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_THEME_INFO] = async () => {
  const state = store.getState();
  const activeTheme = activeThemeSelector(state);
  const themesList = themesListSelector(state);

  return {
    activeTheme,
    themes: themesList,
  };
};
