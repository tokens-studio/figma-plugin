import { mockCreateVariableCollection, mockGetLocalVariableCollections } from '../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import createLocalVariablesInPlugin from './createLocalVariablesInPlugin';
import { SingleToken } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';

describe('createLocalVariablesInPlugin', () => {
  const mockRenameMode = jest.fn();
  const mockAddMode = jest.fn();
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
      $figmaStyleReferences: {},
    }],
  });

  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);

  runAfter.push(AsyncMessageChannel.PluginInstance.connect());

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
  const settings = {
    baseFontSize: '16',
  } as SettingsState;

  it('when there is no collection which correspond to the theme, then we create a new collection', async () => {
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:334:16746',
        modes: [
          {
            name: 'light',
            modeId: '123',
          },
        ],
        name: 'core',
      },
    ];
    const mockNewCollection = {
      id: 'VariableCollectionId:334:16723',
      modes: [
        {
          name: 'new Mode',
          modeId: '123',
        },
      ],
      name: 'color',
      renameMode: mockRenameMode,
    } as unknown as VariableCollection;
    mockGetLocalVariableCollections.mockImplementationOnce(() => mockLocalVariableCollections);
    mockCreateVariableCollection.mockImplementationOnce(() => mockNewCollection);
    expect(await createLocalVariablesInPlugin(tokens, settings)).toEqual({
      allVariableCollectionIds: {},
      totalVariables: 0,
    });
  });

  it('when there is a collection which correspond to the theme, then we update the collection', async () => {
    const mockLocalVariableCollections = [
      {
        id: 'VariableCollectionId:334:16746',
        modes: [
          {
            name: 'dark',
            modeId: '123',
          },
        ],
        name: 'color',
        addMode: mockAddMode,
      },
    ];
    mockGetLocalVariableCollections.mockImplementationOnce(() => mockLocalVariableCollections);
    mockAddMode.mockImplementationOnce(() => '234');
    expect(await createLocalVariablesInPlugin(tokens, settings)).toEqual({
      allVariableCollectionIds: {},
      totalVariables: 0,
    });
  });
});
