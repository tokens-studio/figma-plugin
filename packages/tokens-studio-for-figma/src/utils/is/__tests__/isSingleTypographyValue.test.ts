import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { isSingleTypographyValue } from '../isSingleTypographyValue';

describe('isSingleTypographyValue', () => {
  it('should validate correct values', () => {
    expect(isSingleTypographyValue('value')).toBe(true);
    expect(isSingleTypographyValue({
      fontFamily: 'Roboto',
    })).toBe(true);
  });

  it('should return false for incorrect values', () => {
    expect(isSingleTypographyValue(null)).toBe(false);
    expect(isSingleTypographyValue(undefined)).toBe(false);
    expect(isSingleTypographyValue(100)).toBe(false);
    expect(isSingleTypographyValue({
      type: BoxShadowTypes.DROP_SHADOW,
      blur: 10,
      spread: 10,
      x: 0,
      y: 5,
      color: '#000000',
    })).toBe(false);
  });
});
