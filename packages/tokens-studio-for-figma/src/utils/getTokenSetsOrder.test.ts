import { getTokenSetsOrder } from './getTokenSetsOrder';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { SingleToken } from '@/types/tokens';
import { UsedTokenSetsMap } from '@/types';

describe('getTokenSetsOrder', () => {
  it('orders token sets correctly with enabled, source, and disabled statuses', () => {
    const tokens: Record<string, SingleToken[]> = {
      global: [],
      brand: [],
      'mode/light': [],
      'mode/dark': [],
      'spacing/small': [],
      'spacing/large': [],
      'color/primary': [],
      'typography/heading': [],
    };

    const usedSets: UsedTokenSetsMap = {
      global: TokenSetStatus.ENABLED,
      brand: TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.SOURCE,
      'mode/dark': TokenSetStatus.DISABLED,
      'spacing/small': TokenSetStatus.DISABLED,
      'spacing/large': TokenSetStatus.ENABLED,
      'color/primary': TokenSetStatus.DISABLED,
      'typography/heading': TokenSetStatus.DISABLED,
    };

    const overallConfig: UsedTokenSetsMap = {
      global: TokenSetStatus.ENABLED,
      brand: TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.SOURCE,
      'mode/dark': TokenSetStatus.SOURCE,
      'spacing/small': TokenSetStatus.ENABLED,
      'spacing/large': TokenSetStatus.ENABLED,
      'color/primary': TokenSetStatus.DISABLED,
      'typography/heading': TokenSetStatus.DISABLED,
    };

    const activeTokenSet = 'mode/light';

    const result = getTokenSetsOrder(tokens, usedSets, overallConfig, activeTokenSet);

    expect(result).toEqual({
      tokenSetsOrder: ['color/primary', 'typography/heading', 'mode/dark', 'spacing/small', 'global', 'brand', 'spacing/large', 'mode/light'],
      usedSetsList: ['global', 'brand', 'spacing/large', 'mode/light'],
      overallSets: ['color/primary', 'typography/heading', 'mode/dark', 'spacing/small'],
    });
  });

  it('places the active token set at the end of the used sets list', () => {
    const tokens: Record<string, SingleToken[]> = {
      base: [],
      theme: [],
    };

    const usedSets: UsedTokenSetsMap = {
      base: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.ENABLED,
    };

    const overallConfig: UsedTokenSetsMap = {
      base: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.ENABLED,
    };

    const activeTokenSet = 'base';

    const result = getTokenSetsOrder(tokens, usedSets, overallConfig, activeTokenSet);

    expect(result).toEqual({
      tokenSetsOrder: ['theme', 'base'],
      usedSetsList: ['theme', 'base'],
      overallSets: [],
    });
  });

  it('respects the overallConfig order for sets not in usedSetsList', () => {
    const tokens: Record<string, SingleToken[]> = {
      fonts: [],
      colors: [],
      'mode/light': [],
      'mode/dark': [],
      unused: [],
    };

    const usedSets: UsedTokenSetsMap = {
      fonts: TokenSetStatus.DISABLED,
      colors: TokenSetStatus.DISABLED,
      'mode/light': TokenSetStatus.SOURCE,
      'mode/dark': TokenSetStatus.ENABLED,
    };

    const overallConfig: UsedTokenSetsMap = {
      fonts: TokenSetStatus.ENABLED,
      colors: TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.SOURCE,
      'mode/dark': TokenSetStatus.SOURCE,
      unused: TokenSetStatus.DISABLED,
    };

    const result = getTokenSetsOrder(tokens, usedSets, overallConfig);

    expect(result).toEqual({
      tokenSetsOrder: ['unused', 'fonts', 'colors', 'mode/light', 'mode/dark'],
      usedSetsList: ['mode/light', 'mode/dark'],
      overallSets: ['unused', 'fonts', 'colors'],
    });
  });

  it('handles empty tokens input gracefully', () => {
    const tokens: Record<string, SingleToken[]> = {};

    const usedSets: UsedTokenSetsMap = {};

    const overallConfig: UsedTokenSetsMap = {};

    const result = getTokenSetsOrder(tokens, usedSets, overallConfig);

    expect(result).toEqual({
      tokenSetsOrder: [],
      usedSetsList: [],
      overallSets: [],
    });
  });
});
