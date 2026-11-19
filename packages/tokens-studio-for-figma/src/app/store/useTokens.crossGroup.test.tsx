// Style export counterpart of generateTokensToCreate.crossGroup.test.ts: a modified color in one
// theme group that references another group must resolve against the first exported option of
// that group in theme order, and must not depend on the active theme.

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import useTokens from './useTokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { createMockStore } from '../../../tests/config/setupTest';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';
import { ThemeObject } from '@/types';
import { SingleToken } from '@/types/tokens';

jest.mock('@/profiling/transaction', () => ({
  wrapTransaction: (_opts: unknown, fn: () => unknown) => fn(),
}));

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({ confirm: jest.fn() }),
}));

describe('useTokens createStylesFromSelectedThemes — references into another theme group', () => {
  const themes: ThemeObject[] = [
    {
      id: 'a', name: 'A', group: 'brand', selectedTokenSets: { 'brand/a': TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
    {
      id: 'b', name: 'B', group: 'brand', selectedTokenSets: { 'brand/b': TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
    {
      id: 'charts', name: 'Charts', group: 'charts', selectedTokenSets: { charts: TokenSetStatus.ENABLED }, $figmaStyleReferences: {},
    },
  ];
  const tokens = {
    'brand/a': [{ name: 'brand.accent', value: '#2143a2', type: TokenTypes.COLOR } as SingleToken],
    'brand/b': [{ name: 'brand.accent', value: '#2754ac', type: TokenTypes.COLOR } as SingleToken],
    charts: [
      { name: 'chart.default', value: '{brand.accent}', type: TokenTypes.COLOR } as SingleToken,
      {
        name: 'chart.reduced',
        value: '{chart.default}',
        type: TokenTypes.COLOR,
        $extensions: { 'studio.tokens': { modify: { type: ColorModifierTypes.ALPHA, value: '0.4', space: ColorSpaceTypes.SRGB } } },
      } as SingleToken,
    ],
  };

  let messageSpy: jest.SpyInstance;

  beforeEach(() => {
    messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockImplementation(async (msg) => {
      if (msg.type === AsyncMessageTypes.CREATE_STYLES) return { type: msg.type, styleIds: {} } as any;
      return { type: msg.type } as any;
    });
  });

  afterEach(() => {
    messageSpy.mockRestore();
  });

  const exportedReducedValue = async (activeTheme: Record<string, string>, selectedThemes: string[]) => {
    const store = createMockStore({
      tokenState: { tokens, themes, activeTheme },
      settings: { stylesColor: true, removeStylesAndVariablesWithoutConnection: false },
    });
    const { result } = renderHook(() => useTokens(), {
      wrapper: ({ children }: { children?: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    });

    await act(async () => {
      await result.current.createStylesFromSelectedThemes(selectedThemes);
    });

    const chartsCall = messageSpy.mock.calls
      .map(([msg]) => msg)
      .find((msg) => msg.type === AsyncMessageTypes.CREATE_STYLES && msg.selectedTheme.id === 'charts');
    return chartsCall?.tokens.find((token: SingleToken) => token.name === 'chart.reduced')?.value;
  };

  it('bakes the first exported brand, whichever brand is active', async () => {
    expect(await exportedReducedValue({ brand: 'a', charts: 'charts' }, ['a', 'b', 'charts'])).toBe('#2143a266');
    expect(await exportedReducedValue({ brand: 'b', charts: 'charts' }, ['a', 'b', 'charts'])).toBe('#2143a266');
  });

  it('bakes the only exported brand', async () => {
    expect(await exportedReducedValue({ brand: 'a', charts: 'charts' }, ['b', 'charts'])).toBe('#2754ac66');
  });
});
