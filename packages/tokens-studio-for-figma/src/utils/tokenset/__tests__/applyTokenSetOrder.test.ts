import { applyTokenSetOrder } from '../applyTokenSetOrder';
import type { AnyTokenList } from '@/types/tokens';

describe('applyTokenSetOrder', () => {
  it('should be able to sort a token set map', () => {
    const tokenSets: Record<string, AnyTokenList> = {
      dark: [],
      light: [],
      global: [],
    };

    const sortedTokenSets = applyTokenSetOrder(tokenSets, ['global', 'light', 'dark']);
    expect(Object.keys(sortedTokenSets)).toEqual(['global', 'light', 'dark']);
  });
});
