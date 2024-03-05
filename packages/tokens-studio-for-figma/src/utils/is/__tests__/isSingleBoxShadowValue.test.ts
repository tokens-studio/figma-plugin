import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { isSingleBoxShadowValue } from '../isSingleBoxShadowValue';

describe('isSingleBoxShadowValue', () => {
  it('should validate correct values', () => {
    expect(isSingleBoxShadowValue('value')).toBe(true);
    expect(isSingleBoxShadowValue({
      type: BoxShadowTypes.DROP_SHADOW,
      blur: 10,
      spread: 10,
      x: 0,
      y: 5,
      color: '#000000',
    })).toBe(true);
    expect(isSingleBoxShadowValue([{
      type: BoxShadowTypes.DROP_SHADOW,
      blur: 10,
      spread: 10,
      x: 0,
      y: 5,
      color: '#000000',
    }])).toBe(true);
  });

  it('should return false for incorrect values', () => {
    expect(isSingleBoxShadowValue(null)).toBe(false);
    expect(isSingleBoxShadowValue(undefined)).toBe(false);
    expect(isSingleBoxShadowValue(100)).toBe(false);
    expect(isSingleBoxShadowValue({
      fontFamily: 'Roboto',
    })).toBe(false);
  });
});
