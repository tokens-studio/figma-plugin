import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes, UpdateAsyncMessage } from '@/types/AsyncMessages';
import { update } from '../update';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import {
  UpdatedAtProperty, UsedTokenSetProperty, ThemesProperty, ValuesProperty, ActiveThemeProperty, CheckForChangesProperty,
} from '@/figmaStorage';
import * as NodeManager from '../../NodeManager';
import * as swapStyles from '../swapStyles';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('update', () => {
  const findNodesWithDataSpy = jest.spyOn(NodeManager.defaultNodeManager, 'findNodesWithData');
  const ThemesPropertyWriteSpy = jest.spyOn(ThemesProperty, 'write');
  const ValuesPropertyWriteSpy = jest.spyOn(ValuesProperty, 'write');
  const UsedTokenSetPropertyWriteSpy = jest.spyOn(UsedTokenSetProperty, 'write');
  const UpdatedAtPropertyWriteSpy = jest.spyOn(UpdatedAtProperty, 'write');
  const ActiveThemePropertyWriteSpy = jest.spyOn(ActiveThemeProperty, 'write');
  const CheckForChangesPropertyWriteSpy = jest.spyOn(CheckForChangesProperty, 'write');
  const mockSwapStyles = jest.spyOn(swapStyles, 'swapStyles');

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
      updateStyles: true,
      shouldSwapStyles: true,
      baseFontSize: '16',
      aliasBaseFontSize: '16',
    },
    usedTokenSet: {
      global: TokenSetStatus.ENABLED,
    },
    updatedAt: '2022-07-26T10:00:00.000Z',
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

    findNodesWithDataSpy.mockResolvedValueOnce([]);

    await update(mockUpdateMessage);

    expect(ThemesPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.themes);
    expect(ValuesPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.tokenValues);
    expect(UsedTokenSetPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.usedTokenSet);
    expect(UpdatedAtPropertyWriteSpy).toBeCalledWith(mockUpdateMessage.updatedAt);
    expect(ActiveThemePropertyWriteSpy).toBeCalledWith(mockUpdateMessage.activeTheme);
    expect(CheckForChangesPropertyWriteSpy).toBeCalledWith(false);
    expect(mockSwapStyles).toBeCalledWith(mockUpdateMessage.activeTheme, mockUpdateMessage.themes, mockUpdateMessage.settings.updateMode);

    runAfter.forEach((fn) => fn());
  });
});
