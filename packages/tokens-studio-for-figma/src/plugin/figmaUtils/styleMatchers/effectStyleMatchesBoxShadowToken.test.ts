import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenBoxshadowValue } from '@/types/values';
import { effectStyleMatchesBoxShadowToken } from './effectStyleMatchesBoxShadowToken';

describe('effectStyleMatchesBoxShadowToken', () => {
  // tslint:disable-next-line: no-empty
  const noop: () => void = () => {};
  const dummyFunc: <T>() => T = <T>() => (undefined as unknown) as T;
  const dummyFigmaEffectStyle: EffectStyle = {
    description: '',
    type: 'EFFECT',
    effects: [],
    id: '',
    name: '',
    remove: noop,
    documentationLinks: [],
    remote: false,
    key: '',
    getPublishStatusAsync: () => dummyFunc<Promise<PublishStatus>>(),
    getPluginData: () => dummyFunc<string>(),
    setPluginData: noop,
    getPluginDataKeys: () => dummyFunc<string[]>(),
    getSharedPluginData: () => dummyFunc<string>(),
    setSharedPluginData: noop,
    getSharedPluginDataKeys: () => dummyFunc<string[]>(),
  };

  it('should return false when EffectStyle is undefined', () => {
    const effectToken: TokenBoxshadowValue = {
      color: '',
      type: BoxShadowTypes.DROP_SHADOW,
      x: '',
      y: '',
      blur: '',
      spread: '',
    };
    expect(effectStyleMatchesBoxShadowToken(undefined, effectToken)).toBe(false);
  });

  it('should return false when boxShadowToken is a string', () => {
    expect(effectStyleMatchesBoxShadowToken(dummyFigmaEffectStyle, 'some string')).toBe(false);
  });

  describe('when all effect properties are same', () => {
    it('should match single boxShadowToken against same effect style', () => {
      const x = 3;
      const y = 6;
      const blur = 9;
      const spread = 12;
      const effectToken: TokenBoxshadowValue = {
        color: 'rgba(0,0,0,0.25)',
        type: BoxShadowTypes.DROP_SHADOW,
        x,
        y,
        blur,
        spread,
      };
      const figmaEffectStyle: EffectStyle = {
        ...dummyFigmaEffectStyle,
        effects: [
          {
            type: 'DROP_SHADOW',
            blendMode: 'NORMAL',
            visible: true,
            color: {
              a: 0.25,
              r: 0,
              g: 0,
              b: 0,
            },
            offset: { x, y },
            radius: blur,
            spread,
            showShadowBehindNode: true,
          },
        ],
      };

      expect(effectStyleMatchesBoxShadowToken(figmaEffectStyle, effectToken)).toBe(true);
    });

    it('should match multiple boxShadowToken against same effect style', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const x = 3;
      const y = 6;
      const blur = 9;
      const spread = 12;

      const alterations = [0, 3, 6];

      const effectToken: TokenBoxshadowValue[] = alterations.map((addition) => ({
        color: `rgba(${r + addition}, ${g + addition}, ${b + addition}, ${addition / 100})`,
        type: BoxShadowTypes.DROP_SHADOW,
        x: x + addition,
        y: y + addition,
        blur: blur + addition,
        spread: spread + addition,
      }));
      const figmaEffectStyle: EffectStyle = {
        ...dummyFigmaEffectStyle,
        effects: alterations.map((addition) => ({
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          visible: true,
          color: {
            a: addition / 100,
            r: (r + addition) / 255,
            g: (g + addition) / 255,
            b: (b + addition) / 255,
          },
          offset: { x: x + addition, y: y + addition },
          radius: blur + addition,
          spread: spread + addition,
          showShadowBehindNode: true,
        })),
      };

      expect(effectStyleMatchesBoxShadowToken(figmaEffectStyle, effectToken)).toBe(true);
    });
  });

  describe('when one or more effect properties are not same', () => {
    const x = 3;
    const y = 6;
    const blur = 9;
    const spread = 12;
    const dummyEffectToken: TokenBoxshadowValue = {
      color: 'rgba(0,0,0,0.25)',
      type: BoxShadowTypes.DROP_SHADOW,
      x,
      y,
      blur,
      spread,
      blendMode: 'NORMAL',
    };
    const figmaEffectStyle: EffectStyle = {
      ...dummyFigmaEffectStyle,
      effects: [
        {
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          visible: true,
          color: {
            a: 0.25,
            r: 0,
            g: 0,
            b: 0,
          },
          offset: { x, y },
          radius: blur,
          spread,
          showShadowBehindNode: true,
        },
      ],
    };
    Object.entries(dummyEffectToken).forEach(([property, value]) => {
      it(`should NOT match boxShadowToken against effect style when effect.${property} is different`, () => {
        const typedProperty = property as keyof TokenBoxshadowValue;
        const effectToken: TokenBoxshadowValue = { ...dummyEffectToken };

        if (typedProperty === 'color') {
          effectToken[typedProperty] = 'rgba(100,150,200,0.75)';
        } else if (typedProperty === 'type') {
          effectToken[typedProperty] = BoxShadowTypes.INNER_SHADOW;
        } else if (typedProperty === 'blendMode') {
          effectToken[typedProperty] = 'DARKEN';
        } else {
          effectToken[typedProperty] = (value as number) + 1;
        }

        expect(effectStyleMatchesBoxShadowToken(figmaEffectStyle, effectToken)).toBe(false);
      });
    });
  });

  describe('when number of effect tokens is not equal to effect style effects', () => {
    it('should NOT match boxShadowToken against effect style with more effects', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const a = 0.5;
      const x = 3;
      const y = 6;
      const blur = 9;
      const spread = 12;

      const effectToken: TokenBoxshadowValue[] = [1, 2].map(() => ({
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
        type: BoxShadowTypes.DROP_SHADOW,
        x,
        y,
        blur,
        spread,
      }));
      const figmaEffectStyle: EffectStyle = {
        ...dummyFigmaEffectStyle,
        effects: [1, 2, 3].map(() => ({
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          visible: true,
          color: {
            a,
            r: r / 255,
            g: g / 255,
            b: b / 255,
          },
          offset: { x, y },
          radius: blur,
          spread,
          showShadowBehindNode: true,
        })),
      };

      expect(effectStyleMatchesBoxShadowToken(figmaEffectStyle, effectToken)).toBe(false);
    });

    it('should NOT match boxShadowToken against effect style with less effects', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const a = 0.5;
      const x = 3;
      const y = 6;
      const blur = 9;
      const spread = 12;

      const effectToken: TokenBoxshadowValue[] = [1, 2, 3].map(() => ({
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
        type: BoxShadowTypes.DROP_SHADOW,
        x,
        y,
        blur,
        spread,
      }));
      const figmaEffectStyle: EffectStyle = {
        ...dummyFigmaEffectStyle,
        effects: [1, 2].map(() => ({
          type: 'DROP_SHADOW',
          blendMode: 'NORMAL',
          visible: true,
          color: {
            a,
            r: r / 255,
            g: g / 255,
            b: b / 255,
          },
          offset: { x, y },
          radius: blur,
          spread,
          showShadowBehindNode: true,
        })),
      };

      expect(effectStyleMatchesBoxShadowToken(figmaEffectStyle, effectToken)).toBe(false);
    });
  });
});
