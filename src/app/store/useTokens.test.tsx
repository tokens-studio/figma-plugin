import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import useTokens from './useTokens';
import {
  AnyTokenList, SingleToken,
} from '@/types/tokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import {
  createStyles, renameStyles, removeStyles, syncStyles,
} from '@/plugin/asyncMessageHandlers';
import { AllTheProviders, createMockStore, resetStore } from '../../../tests/config/setupTest';
import { store } from '../store';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UpdateMode } from '@/constants/UpdateMode';
import { NodeInfo } from '@/types/NodeInfo';
import { Properties } from '@/constants/Properties';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

type GetFormattedTokensOptions = {
  includeAllTokens: boolean;
  includeParent: boolean;
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
  expandBorder: boolean;
};

const resolvedTokens: AnyTokenList = [
  {
    name: 'size.6',
    type: TokenTypes.SIZING,
    value: '2',
    rawValue: '2',
  },
  {
    name: 'size.alias',
    type: TokenTypes.SIZING,
    value: '2',
    rawValue: '{size.6}',
  },
  {
    name: 'color.slate.50',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
    rawValue: '#f8fafc',
  },
  {
    name: 'color.alias',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
    rawValue: '{color.slate.50}',
  },
  {
    name: 'border-radius.0',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
    rawValue: '64px',
  },
  {
    name: 'border-radius.alias',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
    rawValue: '{border-radius.0}',
  },
  {
    name: 'opacity.10',
    type: TokenTypes.OPACITY,
    value: '10%',
    rawValue: '10%',
  },
  {
    name: 'opacity.alias',
    type: TokenTypes.OPACITY,
    rawValue: '10%',
    value: '{opacity.10}',
  },
  {
    name: 'typography.headlines.small',
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    rawValue: {
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
  },
  {
    name: 'typography.alias',
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    rawValue: '{typography.headlines.small}',
  },
  {
    name: 'font-family.serif',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
    rawValue: 'IBM Plex Serif',
  },
  {
    name: 'font-family.alias',
    type: TokenTypes.FONT_FAMILIES,
    rawValue: '{font-family.serif}',
    value: 'IBM Plex Serif',
  },
  {
    name: 'line-height.1',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
    rawValue: '130%',
  },
  {
    name: 'line-height.alias',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
    rawValue: '{line-height.1}',
  },
  {
    name: 'typography.headlines.boxshadow',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
  },
  {
    name: 'typography.boxshadow.alias',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: 2,
      y: 2,
      blur: 2,
      spread: 2,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: '{typography.headlines.boxshadow}',
  },
  {
    name: 'font-weight.regular',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    default: '400',
    rawValue: 'Regular',
  },
  {
    name: 'font-weight.alias',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    rawValue: '{font-weight.regular}',
    default: '400',
  },
  {
    name: 'font-style.normal',
    type: TokenTypes.OTHER,
    value: 'normal',
    rawValue: 'normal',
  },
  {
    name: 'font-style.alias',
    type: TokenTypes.OTHER,
    value: 'normal',
    rawValue: '{font-style.normal}',
  },
];

const mockConfirm = jest.fn();
const mockPullStylesHandler = jest.fn(async () => { });
const mockRemapTokensHandler = jest.fn(async () => { });
const mockRemoveTokensByValueHandler = jest.fn(async () => { });
jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

describe('useToken test', () => {
  const mockStore = createMockStore({});
  let { result } = renderHook(() => useTokens(), {
    wrapper: AllTheProviders,
  });

  beforeEach(() => {
    resetStore();
    result = renderHook(() => useTokens(), {
      wrapper: ({ children }: { children?: React.ReactNode }) => <Provider store={mockStore}>{children}</Provider>,
    }).result;
  });

  it('getTokenValue test', () => {
    resolvedTokens.forEach((token) => {
      expect(result.current.getTokenValue(token.name, resolvedTokens)).toBe(token);
    });
  });

  it('isAlias test', () => {
    const aliasToken: SingleToken = {
      name: 'color.alias',
      type: TokenTypes.COLOR,
      value: '{color.slate.50}',
    };
    const token: SingleToken = {
      name: 'color.alias',
      type: TokenTypes.COLOR,
      value: '#0033ff',
    };
    expect(result.current.isAlias(aliasToken, resolvedTokens)).toBe(true);
    expect(result.current.isAlias(token, resolvedTokens)).toBe(false);
  });

  it('getFormattedTokens test', () => {
    const opts: GetFormattedTokensOptions = {
      includeAllTokens: false,
      includeParent: false,
      expandTypography: false,
      expandShadow: false,
      expandComposition: false,
      expandBorder: false,
    };
    expect(result.current.getFormattedTokens(opts)).toBeTruthy();
  });

  it('getStringTokens test', () => {
    expect(result.current.getStringTokens()).toBeTruthy();
  });

  it('pullStyles test', async () => {
    mockConfirm.mockImplementation(() => Promise.resolve(['textStyles', 'colorStyles', 'effectStyles']));
    await act(async () => {
      await result.current.pullStyles();
    });
    await expect(result.current.pullStyles()).resolves.not.toThrow();
  });

  it('should send message to pull styles from figma', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    mockConfirm.mockImplementation(() => Promise.resolve({
      data: ['textStyles', 'colorStyles', 'effectStyles'],
    }));
    await act(async () => {
      await result.current.pullStyles();
    });
    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.PULL_STYLES,
      styleTypes: {
        textStyles: true,
        colorStyles: true,
        effectStyles: true,
      },
    });
  });

  it('removeTokensByValue test', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    const data = [{
      property: Properties.fill,
      nodes: [{
        id: '12',
        type: 'RECTANGLE',
      } as NodeInfo],
    }];
    await act(async () => {
      await result.current.removeTokensByValue(data);
    });

    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove: data,
    });
  });

  it('handleRemap test', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    await act(async () => {
      await result.current.handleRemap(TokenTypes.SIZING, 'sizing.small', 'sizing.sm', [{ name: 'sizing.small', value: 3, type: TokenTypes.SIZING }]);
    });

    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.REMAP_TOKENS,
      category: TokenTypes.SIZING,
      oldName: 'sizing.small',
      newName: 'sizing.sm',
      updateMode: UpdateMode.SELECTION,
      tokens: [{ name: 'sizing.small', value: 3, type: TokenTypes.SIZING }],
      settings: store.getState().settings,
    });
  });

  it('remapToken test', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    await act(async () => {
      await result.current.remapToken('oldName', 'newName', UpdateMode.SELECTION);
    });

    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName: 'oldName',
      newName: 'newName',
      updateMode: UpdateMode.SELECTION,
    });
  });

  it('remapTokensInGroup', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    mockConfirm.mockImplementation(() => Promise.resolve({ data: ['selection', 'page', 'document'] }));
    await act(async () => {
      await result.current.remapTokensInGroup({ oldGroupName: 'old.', newGroupName: 'new.' });
    });
    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName: 'old.',
      newName: 'new.',
      updateMode: UpdateMode.SELECTION,
    });
  });

  describe('createStylesFromTokens', () => {
    const tokenMockStore = createMockStore({
      tokenState: {
        usedTokenSet: { global: TokenSetStatus.ENABLED, light: TokenSetStatus.ENABLED },
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
        themes: [{
          id: 'light', name: 'Light', selectedTokenSets: {}, $figmaStyleReferences: {},
        }],
        tokens: {
          global: [{ name: 'white', value: '#ffffff', type: TokenTypes.COLOR }, { name: 'headline', value: { fontFamily: 'Inter', fontWeight: 'Bold' }, type: TokenTypes.TYPOGRAPHY }, { name: 'shadow', value: '{shadows.default}', type: TokenTypes.BOX_SHADOW }],
          light: [{ name: 'bg.default', value: '#ffffff', type: TokenTypes.COLOR }],
        },
      },
    });
    beforeEach(() => {
      resetStore();
      result = renderHook(() => useTokens(), {
        wrapper: ({ children }: { children?: React.ReactNode }) => <Provider store={tokenMockStore}>{children}</Provider>,
      }).result;
    });
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
    const runAfter: (() => void)[] = [];
    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, mockRemoveTokensByValueHandler);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMAP_TOKENS, mockRemapTokensHandler);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.PULL_STYLES, mockPullStylesHandler);
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, async (): Promise<GetThemeInfoMessageResult> => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: {},
      themes: [],
    }));
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_STYLES, createStyles);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RENAME_STYLES, renameStyles);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_STYLES, removeStyles);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SYNC_STYLES, syncStyles);

    it('creates all styles', async () => {
      mockConfirm.mockImplementation(() => Promise.resolve({ data: ['textStyles', 'colorStyles', 'effectStyles'] }));

      await act(async () => {
        await result.current.createStylesFromTokens();
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.CREATE_STYLES,
        tokens: [
          {
            internal__Parent: 'light',
            name: 'bg.default',
            rawValue: '#ffffff',
            type: 'color',
            value: '#ffffff',
          },
          {
            internal__Parent: 'global',
            name: 'white',
            rawValue: '#ffffff',
            type: 'color',
            value: '#ffffff',
          },
          {
            internal__Parent: 'global',
            name: 'headline',
            rawValue: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
            type: 'typography',
            value: {
              fontFamily: 'Inter',
              fontWeight: 'Bold',
            },
          },
          {
            failedToResolve: true,
            internal__Parent: 'global',
            name: 'shadow',
            rawValue: '{shadows.default}',
            type: 'boxShadow',
            value: '{shadows.default}',
          },
        ],
        settings: store.getState().settings,
      });
    });

    it('respects decision to only create text styles', async () => {
      mockConfirm.mockImplementation(() => Promise.resolve({ data: ['textStyles'] }));

      await act(async () => {
        await result.current.createStylesFromTokens();
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.CREATE_STYLES,
        tokens: [{
          internal__Parent: 'global',
          name: 'headline',
          rawValue: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
          },
          type: 'typography',
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
          },
        },
        ],
        settings: store.getState().settings,
      });
    });
    it('rename styles from current theme', async () => {
      await act(async () => {
        await result.current.renameStylesFromTokens({ oldName: 'old', newName: 'new', parent: 'global' });
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.RENAME_STYLES,
        oldName: 'old',
        newName: 'new',
        parent: 'global',
        settings: store.getState().settings,
      });
    });

    it('should remap all tokens', async () => {
      await act(async () => {
        await result.current.handleBulkRemap('newName', 'oldName');
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.BULK_REMAP_TOKENS,
        oldName: 'oldName',
        newName: 'newName',
        updateMode: UpdateMode.SELECTION,
      });
    });

    it('removeStylesFromTokens', async () => {
      const tokenToDelete = {
        path: 'color.red',
        parent: 'global',
      };
      await act(async () => {
        await result.current.removeStylesFromTokens(tokenToDelete);
      });
      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.REMOVE_STYLES,
        token: tokenToDelete,
        settings: store.getState().settings,
      });
    });

    it('syncStyles', async () => {
      mockConfirm.mockImplementation(() => Promise.resolve({ data: ['renameStyles', 'removeStyles'] }));
      await act(async () => {
        await result.current.syncStyles();
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.SYNC_STYLES,
        tokens: {
          global: [{ name: 'white', value: '#ffffff', type: TokenTypes.COLOR }, { name: 'headline', value: { fontFamily: 'Inter', fontWeight: 'Bold' }, type: TokenTypes.TYPOGRAPHY }, { name: 'shadow', value: '{shadows.default}', type: TokenTypes.BOX_SHADOW }],
          light: [{ name: 'bg.default', value: '#ffffff', type: TokenTypes.COLOR }],
        },
        options: {
          renameStyle: true,
          removeStyle: true,
        },
        settings: store.getState().settings,
      });
    });
  });

  describe('setNoneValuesOnNode', () => {
    const mockStore = createMockStore({
      uiState: {
        selectionValues: [{
          category: Properties.fill,
          type: 'fill',
          value: 'color.slate.800',
          nodes: [{
            id: '12',
            type: 'RECTANGLE',
          } as NodeInfo],
        }, {
          category: Properties.borderRadius,
          type: 'borderRadius',
          value: 'border-radius.8',
          nodes: [{
            id: '12',
            type: 'RECTANGLE',
          } as NodeInfo],
        }],
      },
      inspectState: {
        selectedTokens: ['fill-color.slate.800', 'borderRadius-border-radius.8'],
      },
    });
    beforeEach(() => {
      resetStore();
      result = renderHook(() => useTokens(), {
        wrapper: ({ children }: { children?: React.ReactNode }) => <Provider store={mockStore}>{children}</Provider>,
      }).result;
    });

    it('setNoneValuesOnNode test', async () => {
      const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');
      await act(async () => {
        await result.current.setNoneValuesOnNode(resolvedTokens);
      });

      expect(messageSpy).toBeCalledWith({
        type: AsyncMessageTypes.SET_NONE_VALUES_ON_NODE,
        tokensToSet: [{
          nodes: [{
            id: '12',
            type: 'RECTANGLE',
          }],
          property: 'fill',
        },
        {
          nodes: [{
            id: '12',
            type: 'RECTANGLE',
          }],
          property: 'borderRadius',
        }],
        tokens: resolvedTokens,
      });
    });
  });
});
