import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { normalizeShadowValue } from './normalizeShadowValue';

describe('normalizeShadowValue', () => {
  it('maps offsetX/offsetY to x/y', () => {
    expect(normalizeShadowValue({
      offsetX: '{dimension.0}', offsetY: 4, blur: 8, spread: 0, color: '#000', type: BoxShadowTypes.DROP_SHADOW,
    })).toEqual({
      x: '{dimension.0}', y: 4, blur: 8, spread: 0, color: '#000', type: BoxShadowTypes.DROP_SHADOW,
    });
  });

  it('maps inset to a shadow type', () => {
    expect(normalizeShadowValue({ x: 0, y: 0, inset: true })).toEqual({ x: 0, y: 0, type: BoxShadowTypes.INNER_SHADOW });
    expect(normalizeShadowValue({ x: 0, y: 0, inset: false })).toEqual({ x: 0, y: 0, type: BoxShadowTypes.DROP_SHADOW });
  });

  it('keeps an explicit type and x/y over the DTCG keys', () => {
    expect(normalizeShadowValue({
      x: 1, y: 2, offsetX: 5, offsetY: 6, type: BoxShadowTypes.DROP_SHADOW, inset: true,
    })).toEqual({ x: 1, y: 2, type: BoxShadowTypes.DROP_SHADOW });
  });

  it('normalizes every shadow in an array', () => {
    expect(normalizeShadowValue([{ offsetX: 1, offsetY: 2 }, { x: 3, y: 4 }])).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
  });

  it('returns references, undefined and plugin-format values unchanged', () => {
    const value = { x: 0, y: 0 };
    expect(normalizeShadowValue(value)).toBe(value);
    expect(normalizeShadowValue('{shadow.base}')).toBe('{shadow.base}');
    expect(normalizeShadowValue(undefined)).toBeUndefined();
  });
});
