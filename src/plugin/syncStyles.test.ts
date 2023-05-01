import { SettingsState } from '@/app/store/models/settings';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import syncStyles from './syncStyles';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('syncStyles', () => {
  const mockValues: Record<string, AnyTokenList> = {
    global: [
      {
        type: TokenTypes.COLOR,
        value: '#ff0000',
        name: 'red',
      },
      {
        type: TokenTypes.COLOR,
        value: '#000000',
        name: 'black',
      },
      {
        type: TokenTypes.BORDER_RADIUS,
        value: '12px',
        name: 'rounded.md',
      },
    ],
    playground: [
      {
        type: TokenTypes.COLOR,
        value: '#ff0000',
        name: 'red',
      },
    ],
  };
  figma.getLocalPaintStyles.mockReturnValue([
    {
      name: 'Light/red',
      id: '456',
      description: 'the red one',
      paints: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }],
      remove: jest.fn(),
    },
    {
      name: 'Light/blue',
      id: '567',
      description: 'the blue one',
      paints: [{ type: 'other', color: { r: 0, g: 0, b: 1 }, opacity: 0.5 }],
      remove: jest.fn(),
    },
    {
      name: 'Dark/red',
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
    themes: [
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
        },
        $figmaStyleReferences: {},
      },
    ],
  });

  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);

  runAfter.push(AsyncMessageChannel.PluginInstance.connect());

  it('should remove styles', async () => {
    expect(await syncStyles(mockValues, { removeStyle: true, renameStyle: false }, { baseFontSize: '16' } as SettingsState)).toEqual({
      styleIdsToRemove: ['567', '678'],
    });
  });

  it('should rename styles', async () => {
    expect(await syncStyles(mockValues, { removeStyle: false, renameStyle: true }, { baseFontSize: '16' } as SettingsState)).toEqual({
      styleIdsToRemove: [],
    });
  });

  it('should rename & remove styles', async () => {
    expect(await syncStyles(mockValues, { removeStyle: true, renameStyle: true }, { baseFontSize: '16' } as SettingsState)).toEqual({
      styleIdsToRemove: ['567', '678'],
    });
  });
});
