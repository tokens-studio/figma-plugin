import { AsyncMessageChannel } from './AsyncMessageChannel';
import {
  AsyncMessageTypes, GetThemeInfoMessageResult,
} from './types/AsyncMessages';

describe('Testing the mock functionality of the AsyncMessageChannel', () => {
  it('should be able to communicate between UI and plugin', async () => {
    const getThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: 'light',
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });

    AsyncMessageChannel.PluginInstance.connect();
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.GET_THEME_INFO, getThemeInfoHandler);

    AsyncMessageChannel.ReactInstance.connect();
    const result = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });
    expect(result).toEqual({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: 'light',
      themes: [{ id: 'light', name: 'Light', selectedTokenSets: {} }],
    });
  });
});
