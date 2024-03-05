import { mockGetLocalVariables } from '../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import syncVariables from './syncVariables';

describe('SyncVariables', () => {
  const mockRemove = jest.fn();
  let variablesInFigma = [] as Variable[];

  const runAfter: (() => void)[] = [];

  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: {
      [INTERNAL_THEMES_NO_GROUP]: 'light',
    },
    themes: [{
      id: 'light',
      name: 'light',
      group: 'color',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaVariableReferences: {
        'button.primary.semi-borderRadius': '123',
        'button.primary.width': '125',
      },
    }],
  });

  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);

  runAfter.push(AsyncMessageChannel.PluginInstance.connect());

  beforeEach(() => {
    variablesInFigma = [
      {
        id: 'VariableID:309:16431',
        key: '123',
        name: 'button/primary/borderRadius',
      } as unknown as Variable,
      {
        id: 'VariableID:309:16432',
        key: '124',
        name: 'button/primary/height',
        remove: mockRemove,
      } as unknown as Variable,

    ];
  });

  const tokens = {
    global: [
      {
        name: 'button.primary.borderRadius',
        value: '8',
        type: TokenTypes.BORDER_RADIUS,
      } as SingleToken,
      {
        name: 'button.primary.width',
        value: '16',
        type: TokenTypes.SIZING,
      } as SingleToken,
    ],
  };

  it('While syncing variables, should be able to rename variable and delete variable', async () => {
    mockGetLocalVariables.mockImplementation(() => variablesInFigma);
    const options = {
      removeVariable: true,
      renameVariable: true,
    };
    const settings = {} as SettingsState;
    await syncVariables(tokens, options, settings);
    expect(variablesInFigma[0].name).toBe('button/primary/semi-borderRadius');
    expect(mockRemove).toBeCalledTimes(1);
  });
});
