import { AsyncMessageChannel } from './AsyncMessageChannel';
import { INTERNAL_THEMES_NO_GROUP } from './constants/InternalTokenGroup';
import {
  AsyncMessageTypes, GetThemeInfoMessageResult,
} from './types/AsyncMessages';

describe('Testing the mock functionality of the AsyncMessageChannel', () => {
  it('should be able to communicate between UI and plugin', async () => {
    const runAfter: (() => void)[] = [];

    const getThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {
        [INTERNAL_THEMES_NO_GROUP]: 'light',
      },
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });

    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.GET_THEME_INFO, getThemeInfoHandler);

    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    const result = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });
    expect(result).toEqual({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {
        [INTERNAL_THEMES_NO_GROUP]: 'light',
      },
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });

    runAfter.forEach((fn) => fn());
  });

  it('should be able to communicate between plugin and UI', async () => {
    const runAfter: (() => void)[] = [];

    const getThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {
        [INTERNAL_THEMES_NO_GROUP]: 'light',
      },
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });

    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, getThemeInfoHandler);

    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
    const result = await AsyncMessageChannel.PluginInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });
    expect(result).toEqual({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {
        [INTERNAL_THEMES_NO_GROUP]: 'light',
      },
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });

    runAfter.forEach((fn) => fn());
  });

  it('should handle errors', async () => {
    const runAfter: (() => void)[] = [];

    const getThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => {
      throw new Error('error');
    };

    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.GET_THEME_INFO, getThemeInfoHandler);

    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    expect(AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    })).rejects.toEqual(new Error('error'));

    runAfter.forEach((fn) => fn());
  });
});
