import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import removeStylesFromPlugin from './removeStylesFromPlugin';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('removeStylesFromPlugin', () => {
  const tokenToDelete = {
    path: 'color.red',
    parent: 'global',
  };

  figma.getLocalPaintStyles.mockReturnValue([
    {
      name: 'Light/color/red',
      id: '456',
      description: 'the red one',
      paints: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }],
      remove: jest.fn(),
    },
    {
      name: 'Light/color/blue',
      id: '567',
      description: 'the blue one',
      paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      remove: jest.fn(),
    },
    {
      name: 'Dark/color/red',
      id: '678',
      description: 'the red one',
      paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      remove: jest.fn(),
    },
  ]);
  figma.getLocalTextStyles.mockReturnValue([]);
  figma.getLocalEffectStyles.mockReturnValue([]);

  const runAfter: (() => void)[] = [];

  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: {
      [INTERNAL_THEMES_NO_GROUP]: 'light',
    },
    themes: [{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaStyleReferences: {},
    }],
  });

  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);

  runAfter.push(AsyncMessageChannel.PluginInstance.connect());

  it('should remove styles from plugin', async () => {
    expect(await removeStylesFromPlugin(tokenToDelete)).toEqual(['456']);
  });
});
