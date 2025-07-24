import {
  mockGetLocalVariableCollectionsAsync, mockGetLocalVariablesAsync, mockGetVariableById, mockSetValueForMode,
} from '../../tests/__mocks__/figmaMock';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import renameVariablesFromPlugin from './renameVariablesFromPlugin';

describe('renameVariablesFromPlugin', () => {
  const runAfter: (() => void)[] = [];
  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: {
      [INTERNAL_THEMES_NO_GROUP]: 'light',
    },
    themes: [{
      id: 'light',
      name: 'light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaVariableReferences: {
        'fg.default-rename': '12345',
        'fg.muted': '23456',
        'fg.alias': '34567',
      },
    }],
  });
  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);

  it('should rename variables', async () => {
    const mockLocalVariablesAsync = [
      {
        id: 'VariableID:1234',
        key: '12345',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/default',
        valuesByMode: {
          123: '#ffffff',
        },
        setValueForMode: mockSetValueForMode,
      },
      {
        id: 'VariableID:2345',
        key: '23456',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/muted',
        valuesByMode: {
          123: '#000000',
        },
        setValueForMode: mockSetValueForMode,
      },
      {
        id: 'VariableID:3456',
        key: '34567',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/alias',
        valuesByMode: {
          123: {
            id: 'VariableID:1234',
            type: 'VARIABLE_ALIAS',
          },
        },
        setValueForMode: mockSetValueForMode,
      },
    ];
    const mockLocalVariableCollectionsAsync = [
      {
        id: 'VariableCollectionId:12:12345',
        name: 'Collection 1',
        remote: false,
        modes: [
          { name: 'Default', modeId: '123' },
        ],
      },
    ];
    mockGetLocalVariablesAsync.mockImplementation(() => mockLocalVariablesAsync);
    mockGetLocalVariableCollectionsAsync.mockImplementation(() => Promise.resolve(mockLocalVariableCollectionsAsync));
    mockGetVariableById.mockImplementation(() => mockLocalVariablesAsync[2]);
    expect(await renameVariablesFromPlugin([
      {
        oldName: 'fg.default',
        newName: 'fg.default-rename',
      },
    ])).toEqual([{
      oldName: 'fg.default',
      newName: 'fg.default-rename',
      variableIds: ['12345'],
    }]);
    expect(mockLocalVariablesAsync[0].name).toBe('fg/default-rename');
  });
});
