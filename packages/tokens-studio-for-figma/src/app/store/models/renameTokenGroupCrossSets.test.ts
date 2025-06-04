import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { TokenTypes } from '@/constants/TokenTypes';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('renameTokenGroup cross-set issue', () => {
  let store: Store;

  beforeEach(() => {
    store = init({ models });
  });

  it('should rename token groups across ALL sets, not just the parent set', () => {
    const initialTokens = {
      global: [
        {
          name: 'colors.primary.500',
          value: '#3b82f6',
          type: TokenTypes.COLOR,
        },
      ],
      theme1: [
        {
          name: 'colors.primary.500', // Same token exists in another set
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
        {
          name: 'button.bg',
          value: '{colors.primary.500}', // References the token
          type: TokenTypes.COLOR,
        },
      ],
      theme2: [
        {
          name: 'colors.primary.600',
          value: '#1e40af',
          type: TokenTypes.COLOR,
        },
        {
          name: 'header.bg',
          value: '{colors.primary.600}', // References related token
          type: TokenTypes.COLOR,
        },
      ],
    };

    store.dispatch.tokenState.setTokens(initialTokens);

    // Rename the colors.primary group in the global set
    store.dispatch.tokenState.renameTokenGroup({
      parent: 'global', // Only specifying global as parent
      oldName: 'colors.primary',
      newName: 'colors.brand',
      type: TokenTypes.COLOR,
    });

    const updatedTokens = store.getState().tokenState.tokens;

    // The token in global set should be renamed
    expect(updatedTokens.global[0].name).toBe('colors.brand.500');

    // The token in theme1 should ALSO be renamed (this might be the issue)
    expect(updatedTokens.theme1[0].name).toBe('colors.brand.500');
    
    // The reference in theme1 should be updated
    expect(updatedTokens.theme1[1].value).toBe('{colors.brand.500}');

    // The token in theme2 should also be renamed
    expect(updatedTokens.theme2[0].name).toBe('colors.brand.600');
    
    // The reference in theme2 should be updated
    expect(updatedTokens.theme2[1].value).toBe('{colors.brand.600}');
  });
});