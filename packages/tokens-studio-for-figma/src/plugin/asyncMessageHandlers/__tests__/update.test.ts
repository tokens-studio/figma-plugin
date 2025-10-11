import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';

import { AsyncMessageTypes, UpdateAsyncMessage } from '@/types/AsyncMessages';
import { update } from '../update';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import {
  UpdatedAtProperty, UsedTokenSetProperty, ThemesProperty, ValuesProperty, ActiveThemeProperty,
} from '@/figmaStorage';
import * as NodeManager from '../../NodeManager';
import * as swapStyles from '../swapStyles';
import * as swapFigmaModes from '../swapFigmaModes';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { mockGetVariableCollectionByIdAsync } from '../../../../tests/__mocks__/figmaMock';

describe('update', () => {
  const findNodesSpy = jest.spyOn(NodeManager.defaultNodeManager, 'findBaseNodesWithData');
  const ThemesPropertyWriteSpy = jest.spyOn(ThemesProperty, 'write');
  const ValuesPropertyWriteSpy = jest.spyOn(ValuesProperty, 'write');
  const UsedTokenSetPropertyWriteSpy = jest.spyOn(UsedTokenSetProperty, 'write');
  const UpdatedAtPropertyWriteSpy = jest.spyOn(UpdatedAtProperty, 'write');
  const ActiveThemePropertyWriteSpy = jest.spyOn(ActiveThemeProperty, 'write');
  const mockSwapStyles = jest.spyOn(swapStyles, 'swapStyles');
  const mockSwapFigmaModes = jest.spyOn(swapFigmaModes, 'swapFigmaModes');

  const mockUpdateMessage: UpdateAsyncMessage = {
    type: AsyncMessageTypes.UPDATE,
    activeTheme: {
      [INTERNAL_THEMES_NO_GROUP]: 'light',
    },
    themes: [
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {},
        $figmaCollectionId: 'collection-123',
        $figmaModeId: 'mode-456',
      },
    ],
    tokenValues: {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.red',
          value: '#ff0000',
        },
      ],
    },
    tokens: [
      {
        type: TokenTypes.COLOR,
        name: 'colors.red',
        value: '#ff0000',
      },
    ],
    settings: {
      ignoreFirstPartForStyles: false,
      inspectDeep: false,
      prefixStylesWithThemeName: false,
      updateMode: UpdateMode.PAGE,
      updateOnChange: false,
      updateRemote: true,
      shouldSwapStyles: true,
      shouldSwapFigmaModes: true,
      baseFontSize: '16',
      aliasBaseFontSize: '16',
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
    },
    usedTokenSet: {
      global: TokenSetStatus.ENABLED,
    },
    updatedAt: '2022-07-26T10:00:00.000Z',
    storageProvider: StorageProviderType.LOCAL,
    storageSize: 1024,
  };

  it('should work', async () => {
    const runAfter = [
      AsyncMessageChannel.PluginInstance.connect(),
      AsyncMessageChannel.ReactInstance.connect(),
    ];

    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, async () => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {},
      themes: [],
    }));

    findNodesSpy.mockResolvedValueOnce([]);

    // Mock the collection for swapFigmaModes
    mockGetVariableCollectionByIdAsync.mockResolvedValue({
      id: 'collection-123',
      name: 'Test Collection',
      modes: [
        { modeId: 'mode-456', name: 'Light' },
      ],
    });

    await update(mockUpdateMessage);

    expect(ThemesPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.themes);
    expect(ValuesPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.tokenValues);
    expect(UsedTokenSetPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.usedTokenSet);
    expect(UpdatedAtPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.updatedAt);
    expect(ActiveThemePropertyWriteSpy).toBeCalledWith(mockUpdateMessage.activeTheme);
    expect(mockSwapStyles).toBeCalledWith(mockUpdateMessage.activeTheme, mockUpdateMessage.themes, mockUpdateMessage.settings.updateMode);
    expect(mockSwapFigmaModes).toBeCalledWith(mockUpdateMessage.activeTheme, mockUpdateMessage.themes, mockUpdateMessage.settings.updateMode);

    runAfter.forEach((fn) => fn());
  });

  it('should not call swapFigmaModes when shouldSwapFigmaModes is false', async () => {
    const runAfter = [
      AsyncMessageChannel.PluginInstance.connect(),
      AsyncMessageChannel.ReactInstance.connect(),
    ];

    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, async () => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {},
      themes: [],
    }));

    findNodesSpy.mockResolvedValueOnce([]);
    mockSwapFigmaModes.mockClear();
    mockGetVariableCollectionByIdAsync.mockClear();

    const messageWithoutSwap = {
      ...mockUpdateMessage,
      settings: {
        ...mockUpdateMessage.settings,
        shouldSwapFigmaModes: false,
      },
    };

    await update(messageWithoutSwap);

    expect(mockSwapFigmaModes).not.toHaveBeenCalled();

    runAfter.forEach((fn) => fn());
  });
});
