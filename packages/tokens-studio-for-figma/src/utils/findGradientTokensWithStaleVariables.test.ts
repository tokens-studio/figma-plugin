import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { findGradientTokensWithStaleVariables } from './findGradientTokensWithStaleVariables';

const gradient = 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)';

const theme = (id: string, sets: Record<string, TokenSetStatus>, refs: Record<string, string>, group?: string): ThemeObject => ({
  id,
  name: id,
  group,
  selectedTokenSets: sets,
  $figmaVariableReferences: refs,
});

describe('findGradientTokensWithStaleVariables', () => {
  it('flags a color token that resolves to a gradient and still has a variable', () => {
    const tokens: Record<string, AnyTokenList> = {
      base: [{ name: 'bg', type: TokenTypes.COLOR, value: gradient }],
    };
    const themes = [theme('light', { base: TokenSetStatus.ENABLED }, { bg: 'key-bg' })];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([
      { name: 'bg', variableKeys: ['key-bg'] },
    ]);
  });

  it('flags a token that becomes a gradient through an alias', () => {
    const tokens: Record<string, AnyTokenList> = {
      core: [{ name: 'brand.gradient', type: TokenTypes.COLOR, value: gradient }],
      comp: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: '{brand.gradient}' }],
    };
    const themes = [theme('light', { core: TokenSetStatus.SOURCE, comp: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-banner' })];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([
      { name: 'banner.bg', variableKeys: ['key-banner'] },
    ]);
  });

  it('ignores a token that is a gradient in a set the theme does not use', () => {
    const tokens: Record<string, AnyTokenList> = {
      brandA: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: '#ff0000' }],
      brandB: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: gradient }],
    };
    const themes = [theme('a', { brandA: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-banner' })];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([]);
  });

  it('ignores a gradient that a later set overrides with a solid color', () => {
    const tokens: Record<string, AnyTokenList> = {
      base: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: gradient }],
      brand: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: '#00ff00' }],
    };
    const themes = [theme('brand', { base: TokenSetStatus.ENABLED, brand: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-banner' })];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([]);
  });

  it('keeps a shared variable when another mode still resolves to a solid color', () => {
    const tokens: Record<string, AnyTokenList> = {
      brandA: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: '#ff0000' }],
      brandB: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: gradient }],
    };
    const themes = [
      theme('a', { brandA: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-banner' }, 'brand'),
      theme('b', { brandB: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-banner' }, 'brand'),
    ];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([]);
  });

  it('only returns the variable keys that are gradient in every theme using them', () => {
    const tokens: Record<string, AnyTokenList> = {
      solid: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: '#ff0000' }],
      grad: [{ name: 'banner.bg', type: TokenTypes.COLOR, value: gradient }],
    };
    const themes = [
      theme('mode', { solid: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-mode' }, 'mode'),
      theme('brand', { grad: TokenSetStatus.ENABLED }, { 'banner.bg': 'key-brand' }, 'brand'),
    ];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([
      { name: 'banner.bg', variableKeys: ['key-brand'] },
    ]);
  });

  it('returns nothing when no token holds a gradient', () => {
    const tokens: Record<string, AnyTokenList> = {
      base: [{ name: 'bg', type: TokenTypes.COLOR, value: '#ffffff' }],
    };
    const themes = [theme('light', { base: TokenSetStatus.ENABLED }, { bg: 'key-bg' })];

    expect(findGradientTokensWithStaleVariables(tokens, themes)).toEqual([]);
  });
});
