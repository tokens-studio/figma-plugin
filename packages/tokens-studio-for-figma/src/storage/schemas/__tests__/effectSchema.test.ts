import { 
  effectValueSchema, 
  effectArraySchema, 
  effectTokenSchema,
  singleEffectTokenSchema 
} from '../effectSchema';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

describe('Effect Schema', () => {
  describe('effectValueSchema', () => {
    it('should validate shadow effect with all properties', () => {
      const shadowEffect = {
        type: BoxShadowTypes.DROP_SHADOW,
        color: '#000000',
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        blendMode: 'NORMAL'
      };
      expect(effectValueSchema.parse(shadowEffect)).toEqual(shadowEffect);
    });

    it('should validate inner shadow effect', () => {
      const innerShadowEffect = {
        type: BoxShadowTypes.INNER_SHADOW,
        color: 'rgba(0,0,0,0.5)',
        x: '2px',
        y: '2px',
        blur: '4px',
        spread: '1px'
      };
      expect(effectValueSchema.parse(innerShadowEffect)).toEqual(innerShadowEffect);
    });

    it('should validate glass effect with minimal properties', () => {
      const glassEffect = {
        type: BoxShadowTypes.GLASS
      };
      expect(effectValueSchema.parse(glassEffect)).toEqual(glassEffect);
    });

    it('should validate glass effect with blur property', () => {
      const glassEffect = {
        type: BoxShadowTypes.GLASS,
        blur: 10
      };
      expect(effectValueSchema.parse(glassEffect)).toEqual(glassEffect);
    });

    it('should reject glass effect with shadow-specific properties', () => {
      const invalidGlassEffect = {
        type: BoxShadowTypes.GLASS,
        color: '#000000',
        x: 0,
        y: 0
      };
      expect(() => effectValueSchema.parse(invalidGlassEffect)).toThrow();
    });

    it('should reject shadow effect without required properties', () => {
      const invalidShadowEffect = {
        type: BoxShadowTypes.DROP_SHADOW
        // missing color, x, y, blur, spread
      };
      expect(() => effectValueSchema.parse(invalidShadowEffect)).toThrow();
    });
  });

  describe('effectArraySchema', () => {
    it('should validate array of mixed effects', () => {
      const effects = [
        {
          type: BoxShadowTypes.DROP_SHADOW,
          color: '#000000',
          x: 0,
          y: 4,
          blur: 8,
          spread: 0
        },
        {
          type: BoxShadowTypes.GLASS,
          blur: 5
        }
      ];
      expect(effectArraySchema.parse(effects)).toEqual(effects);
    });
  });

  describe('effectTokenSchema', () => {
    it('should validate single effect', () => {
      const effect = {
        type: BoxShadowTypes.GLASS,
        blur: 10
      };
      expect(effectTokenSchema.parse(effect)).toEqual(effect);
    });

    it('should validate array of effects', () => {
      const effects = [
        { type: BoxShadowTypes.DROP_SHADOW, color: '#000', x: 0, y: 0, blur: 4, spread: 0 },
        { type: BoxShadowTypes.GLASS, blur: 8 }
      ];
      expect(effectTokenSchema.parse(effects)).toEqual(effects);
    });

    it('should validate string reference', () => {
      const reference = '{shadow.primary}';
      expect(effectTokenSchema.parse(reference)).toEqual(reference);
    });
  });

  describe('singleEffectTokenSchema', () => {
    it('should validate complete effect token with metadata', () => {
      const token = {
        value: {
          type: BoxShadowTypes.GLASS,
          blur: 12
        },
        type: 'boxShadow',
        description: 'Glass effect for modals'
      };
      expect(singleEffectTokenSchema.parse(token)).toEqual(token);
    });

    it('should validate dollar-prefixed format', () => {
      const token = {
        $value: {
          type: BoxShadowTypes.DROP_SHADOW,
          color: '#000000',
          x: 0,
          y: 4,
          blur: 8,
          spread: 0
        },
        $type: 'boxShadow',
        $description: 'Primary drop shadow'
      };
      expect(singleEffectTokenSchema.parse(token)).toEqual(token);
    });
  });
});