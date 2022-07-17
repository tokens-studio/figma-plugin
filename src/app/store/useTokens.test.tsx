import { renderHook, act } from '@testing-library/react-hooks';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import useTokens from './useTokens';
import {
  AnyTokenList, SingleToken,
} from '@/types/tokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { createStyles } from '@/plugin/asyncMessageHandlers';
import { AllTheProviders, resetStore } from '../../../tests/config/setupTest';
import { store } from '../store';

type GetFormattedTokensOptions = {
  includeAllTokens: boolean;
  includeParent: boolean;
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
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

const mockConfirm = jest.fn(() => {});
const mockPullStylesHandler = jest.fn(async () => {});
const mockRemapTokensHandler = jest.fn(async () => {});
const mockRemoveTokensByValueHandler = jest.fn(async () => {});

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

describe('useToken test', () => {
  let { result } = renderHook(() => useTokens(), {
    wrapper: AllTheProviders,
  });

  beforeEach(() => {
    resetStore();
    result = renderHook(() => useTokens(), {
      wrapper: AllTheProviders,
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
    };
    expect(result.current.getFormattedTokens(opts)).toBeTruthy();
  });

  it('getStringTokens test', () => {
    expect(result.current.getStringTokens()).toBeTruthy();
  });

  it('pullStyles test', async () => {
    mockConfirm.mockImplementation(() => {
      Promise.resolve(['textStyles', 'colorStyles', 'effectStyles']);
    });
    await act(async () => {
      await result.current.pullStyles();
    });
    await expect(result.current.pullStyles()).resolves.not.toThrow();
  });

  it('createStylesFromTokens', async () => {
    const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');

    const runAfter: (() => void)[] = [];
    runAfter.push(AsyncMessageChannel.ReactInstance.connect());
    runAfter.push(AsyncMessageChannel.PluginInstance.connect());
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, mockRemoveTokensByValueHandler);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMAP_TOKENS, mockRemapTokensHandler);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.PULL_STYLES, mockPullStylesHandler);
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, async (): Promise<GetThemeInfoMessageResult> => ({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: null,
      themes: [],
    }));
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_STYLES, createStyles);
    await result.current.createStylesFromTokens();

    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.CREATE_STYLES,
      tokens: [],
      settings: store.getState().settings,
    });

    runAfter.forEach((fn) => fn());
  });
});
