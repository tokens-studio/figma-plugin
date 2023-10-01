import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import renameStylesFromPlugin from './renameStylesFromPlugin';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('renameStylesFromPlugin', () => {
  figma.getLocalPaintStyles.mockReturnValue([
    {
      name: 'colors/old',
      id: '456',
      description: 'the red one',
      paints: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }],
      remove: jest.fn(),
    },
    {
      name: 'colors/blue',
      id: '567',
      description: 'the blue one',
      paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      remove: jest.fn(),
    },
    {
      name: 'colors/red',
      id: '678',
      description: 'the red one',
      paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      remove: jest.fn(),
    },
  ]);

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
    expect(await renameStylesFromPlugin('global.colors.old', 'global.colors.new', 'global')).toEqual(['456']);
  });
});
