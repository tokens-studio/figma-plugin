import { TokenTypes } from '@/constants/TokenTypes';
import { isSingleCompositionToken } from '../isSingleCompositionToken';

describe('isSingleCompositionToken', () => {
  it('should validate correct values', () => {
    expect(isSingleCompositionToken({
      type: TokenTypes.COMPOSITION,
      value: {
        fontFamily: 'Roboto',
      },
    })).toBe(true);
  });

  it('should return false for incorrect values', () => {
    expect(isSingleCompositionToken(100)).toBe(false);
    expect(isSingleCompositionToken('value')).toBe(false);
    expect(isSingleCompositionToken({
      type: TokenTypes.COMPOSITION,
      value: {
        fontFamily: 'Roboto',
        value: 'value',
      },
    })).toBe(false);
    expect(isSingleCompositionToken({
      type: TokenTypes.COMPOSITION,
      fontFamily: 'Roboto',
    })).toBe(false);
    expect(isSingleCompositionToken({
      value: {
        fontFamily: 'Roboto',
        value: 'value',
      },
    })).toBe(false);
  });
});
