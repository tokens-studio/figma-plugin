import {
  mockGetLocalVariableCollectionsAsync, mockGetLocalVariablesAsync, mockSetValueForMode,
} from '../../tests/__mocks__/figmaMock';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import updateVariablesFromPlugin from './updateVariablesFromPlugin';
import { TokenTypes } from '@/constants/TokenTypes';
import * as setColorValuesOnVariable from './setColorValuesOnVariable';

describe('updateVariablesFromPlugin', () => {
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
        'fg.default': '12345',
        'fg.muted': '23456',
        'fg.alias': '34567',
      },
      $figmaModeId: 'modeID:123',
    }],
  });
  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);
  const mockLocalVariableCollections = [
    {
      id: 'VariableCollectionId:12:12345',
      name: 'fg',
    },
  ];
  const mockLocalVariables = [
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

  it('when the token value is updated, should update the connected variable', async () => {
    const setColorValuesOnVariableSpy = jest.spyOn(setColorValuesOnVariable, 'default');
    const payload = {
      name: 'fg.default',
      parent: 'global',
      rawValue: '#000000',
      type: TokenTypes.COLOR,
      value: '#000000',
    };
    mockGetLocalVariablesAsync.mockImplementation(() => mockLocalVariables);
    mockGetLocalVariableCollectionsAsync.mockImplementation(() => Promise.resolve(mockLocalVariableCollections));
    await updateVariablesFromPlugin(payload);
    expect(setColorValuesOnVariableSpy).toBeCalledWith(
      {
        description: '',
        id: 'VariableID:1234',
        key: '12345',
        variableCollectionId: 'VariableCollectionId:12:12345',
        name: 'fg/default',
        valuesByMode: {
          123: '#ffffff',
        },
        setValueForMode: mockSetValueForMode,
      },
      'modeID:123',
      '#000000',
    );
  });

  it('when the token value is updated, should update the connected variable - if new token value is reference value, then connected variable should reference a variable', async () => {
    const payload = {
      name: 'fg.default',
      parent: 'global',
      rawValue: '{fg.muted}',
      type: TokenTypes.COLOR,
      value: '#000000',
    };
    mockGetLocalVariablesAsync.mockImplementation(() => Promise.resolve(mockLocalVariables));
    mockGetLocalVariableCollectionsAsync.mockImplementation(() => Promise.resolve(mockLocalVariableCollections));
    await updateVariablesFromPlugin(payload);
    expect(mockSetValueForMode).toBeCalledWith('modeID:123', {
      type: 'VARIABLE_ALIAS',
      id: 'VariableID:2345',
    });
  });
});
