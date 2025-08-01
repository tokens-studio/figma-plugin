import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { convertBoxShadowTypeToFigma, convertBoxShadowTypeFromFigma } from '../boxShadow';

describe('boxShadow transforms with Glass effect', () => {
  describe('convertBoxShadowTypeToFigma', () => {
    it('should convert glass to BACKGROUND_BLUR', () => {
      expect(convertBoxShadowTypeToFigma('glass')).toBe('BACKGROUND_BLUR');
    });

    it('should convert innerShadow to INNER_SHADOW', () => {
      expect(convertBoxShadowTypeToFigma('innerShadow')).toBe('INNER_SHADOW');
    });

    it('should convert default to DROP_SHADOW', () => {
      expect(convertBoxShadowTypeToFigma('dropShadow')).toBe('DROP_SHADOW');
      expect(convertBoxShadowTypeToFigma('unknown')).toBe('DROP_SHADOW');
    });
  });

  describe('convertBoxShadowTypeFromFigma', () => {
    it('should convert BACKGROUND_BLUR to glass', () => {
      expect(convertBoxShadowTypeFromFigma('BACKGROUND_BLUR')).toBe(BoxShadowTypes.GLASS);
    });

    it('should convert INNER_SHADOW to innerShadow', () => {
      expect(convertBoxShadowTypeFromFigma('INNER_SHADOW')).toBe(BoxShadowTypes.INNER_SHADOW);
    });

    it('should convert default to dropShadow', () => {
      expect(convertBoxShadowTypeFromFigma('DROP_SHADOW')).toBe(BoxShadowTypes.DROP_SHADOW);
      expect(convertBoxShadowTypeFromFigma('UNKNOWN')).toBe(BoxShadowTypes.DROP_SHADOW);
    });
  });
});