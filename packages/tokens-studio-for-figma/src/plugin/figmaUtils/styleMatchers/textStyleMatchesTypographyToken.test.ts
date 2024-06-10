import { TokenTypographyValue } from '@/types/values';
import { textStyleMatchesTypographyToken } from './textStyleMatchesTypographyToken';

describe('textStyleMatchesTypographyToken', () => {
  // tslint:disable-next-line: no-empty
  const noop: () => void = () => { };
  const dummyFunc: <T>() => T = <T>() => (undefined as unknown) as T;
  const dummyFigmaTextStyle: TextStyle = {
    description: '',
    type: 'TEXT',
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
    fontSize: 24,
    fontName: {
      family: 'Inter',
      style: 'Bold',
    },
    lineHeight: {
      unit: 'AUTO',
    },
    paragraphSpacing: 0,
    paragraphIndent: 0,
    letterSpacing: {
      unit: 'PERCENT',
      value: 0,
    },
    textCase: 'ORIGINAL',
    textDecoration: 'NONE',
  };

  it('should return false when TextStyle is undefined', () => {
    expect(textStyleMatchesTypographyToken(undefined, {})).toBe(false);
  });

  it('should return false when TextStyle is a string', () => {
    expect(textStyleMatchesTypographyToken(dummyFigmaTextStyle, 'some string')).toBe(false);
  });

  describe('when typography properties are same', () => {
    it('should match complete typography token against same text style', () => {
      const fontFamily = 'Inter';
      const fontWeight = 'Regular';
      const fontSize = 9;
      const lineHeight = 'AUTO';
      const letterSpacing = 1;
      const paragraphSpacing = 2;
      const paragraphIndent = 2;
      const textCase = 'ORIGINAL';
      const textDecoration = 'UNDERLINE';
      const typographyToken: TokenTypographyValue = {
        fontFamily,
        fontWeight,
        fontSize: fontSize.toString(),
        lineHeight,
        letterSpacing: `${letterSpacing}%`,
        paragraphSpacing: paragraphSpacing.toString(),
        paragraphIndent: paragraphIndent.toString(),
        textCase: 'none',
        textDecoration,
      };
      const figmaTextStyle: TextStyle = {
        ...dummyFigmaTextStyle,
        fontSize,
        textDecoration,
        fontName: {
          family: fontFamily,
          style: fontWeight,
        },
        letterSpacing: {
          value: letterSpacing,
          unit: 'PERCENT',
        },
        lineHeight: { unit: lineHeight },
        paragraphIndent,
        paragraphSpacing,
        textCase,
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(true);
    });

    it('should return false when textCase if different', () => {
      const fontFamily = 'Inter';
      const fontWeight = 'Regular';
      const fontSize = 9;
      const lineHeight = 'AUTO';
      const letterSpacing = 1;
      const paragraphSpacing = 2;
      const paragraphIndent = 2;
      const textCase = 'UPPER';
      const textDecoration = 'UNDERLINE';
      const typographyToken: TokenTypographyValue = {
        fontFamily,
        fontWeight,
        fontSize: fontSize.toString(),
        lineHeight,
        letterSpacing: `${letterSpacing}%`,
        paragraphSpacing: paragraphSpacing.toString(),
        paragraphIndent: paragraphIndent.toString(),
        textCase: 'none',
        textDecoration,
      };
      const figmaTextStyle: TextStyle = {
        ...dummyFigmaTextStyle,
        fontSize,
        textDecoration,
        fontName: {
          family: fontFamily,
          style: fontWeight,
        },
        letterSpacing: {
          value: letterSpacing,
          unit: 'PERCENT',
        },
        lineHeight: { unit: lineHeight },
        paragraphIndent,
        paragraphSpacing,
        textCase,
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(false);
    });

    it('should return false when textDecoration if different', () => {
      const fontFamily = 'Inter';
      const fontWeight = 'Regular';
      const fontSize = 9;
      const lineHeight = 'AUTO';
      const letterSpacing = 1;
      const paragraphSpacing = 2;
      const paragraphIndent = 2;
      const textCase = 'ORIGINAL';
      const textDecoration = 'UNDERLINE';
      const typographyToken: TokenTypographyValue = {
        fontFamily,
        fontWeight,
        fontSize: fontSize.toString(),
        lineHeight,
        letterSpacing: `${letterSpacing}%`,
        paragraphSpacing: paragraphSpacing.toString(),
        paragraphIndent: paragraphIndent.toString(),
        textCase: 'none',
        textDecoration,
      };
      const figmaTextStyle: TextStyle = {
        ...dummyFigmaTextStyle,
        fontSize,
        textDecoration: 'STRIKETHROUGH',
        fontName: {
          family: fontFamily,
          style: fontWeight,
        },
        letterSpacing: {
          value: letterSpacing,
          unit: 'PERCENT',
        },
        lineHeight: { unit: lineHeight },
        paragraphIndent,
        paragraphSpacing,
        textCase,
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(false);
    });

    it('should match typography token with omitted defaults against same text style', () => {
      const fontFamily = 'Inter';
      const fontWeight = 'Regular';
      const fontSize = 9;
      const letterSpacing = 0;
      const paragraphSpacing = 2;
      const paragraphIndent = 2;
      const textCase = 'ORIGINAL';
      const textDecoration = 'NONE';
      const typographyToken: TokenTypographyValue = {
        fontFamily,
        fontWeight,
        fontSize: fontSize.toString(),
        paragraphSpacing: paragraphSpacing.toString(),
        paragraphIndent: paragraphIndent.toString(),
      };
      const figmaTextStyle: TextStyle = {
        ...dummyFigmaTextStyle,
        fontSize,
        textDecoration,
        fontName: {
          family: fontFamily,
          style: fontWeight,
        },
        letterSpacing: {
          value: letterSpacing,
          unit: 'PERCENT',
        },
        lineHeight: { unit: 'AUTO' },
        paragraphIndent,
        paragraphSpacing,
        textCase,
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(true);
    });

    it('should match typography token when only lineHeight unit is different but value is 0', () => {
      const fontFamily = 'Inter';
      const fontWeight = 'Regular';
      const fontSize = 9;
      const lineHeight = '0px';
      const letterSpacing = 0;
      const paragraphSpacing = 2;
      const paragraphIndent = 2;
      const textCase = 'ORIGINAL';
      const textDecoration = 'NONE';
      const typographyToken: TokenTypographyValue = {
        fontFamily,
        fontWeight,
        fontSize: fontSize.toString(),
        lineHeight,
        paragraphSpacing: paragraphSpacing.toString(),
        paragraphIndent: paragraphIndent.toString(),
      };
      const figmaTextStyle: TextStyle = {
        ...dummyFigmaTextStyle,
        fontSize,
        textDecoration,
        fontName: {
          family: fontFamily,
          style: fontWeight,
        },
        letterSpacing: {
          value: letterSpacing,
          unit: 'PERCENT',
        },
        lineHeight: { unit: 'PERCENT', value: 0 },
        paragraphIndent: 0,
        paragraphSpacing,
        paragraphIndent,
        textCase,
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(true);
    });
  });

  describe('when one or more typography properties are not same', () => {
    const fontFamily = 'Inter';
    const fontWeight = 'Regular';
    const fontSize = 9;
    const lineHeight = 'AUTO';
    const letterSpacing = 1;
    const paragraphSpacing = 2;
    const textCase = 'ORIGINAL';
    const textDecoration = 'NONE';

    const dummyTypographyToken: TokenTypographyValue = {
      fontFamily,
      fontWeight,
      fontSize: fontSize.toString(),
      lineHeight,
      letterSpacing: `${letterSpacing}%`,
      paragraphSpacing: paragraphSpacing.toString(),
      textCase: 'none',
      textDecoration,
    };
    const figmaTextStyle: TextStyle = {
      ...dummyFigmaTextStyle,
      fontSize,
      textDecoration,
      fontName: {
        family: fontFamily,
        style: fontWeight,
      },
      letterSpacing: {
        value: letterSpacing,
        unit: 'PERCENT',
      },
      lineHeight: { unit: lineHeight },
      paragraphIndent: 0,
      paragraphSpacing,
      textCase,
    };
    Object.keys(dummyTypographyToken).forEach((property) => {
      it(`should NOT match typographyToken against text style when typography.${property} is different`, () => {
        const typedProperty = property as keyof TokenTypographyValue;
        const typographyToken: TokenTypographyValue = { ...dummyTypographyToken };

        if (typedProperty === 'fontFamily') {
          typographyToken[typedProperty] = 'Times New Roman';
        } else if (typedProperty === 'fontWeight') {
          typographyToken[typedProperty] = 'Bold';
        } else if (typedProperty === 'fontSize') {
          typographyToken[typedProperty] = (fontSize + 1).toString();
        } else if (typedProperty === 'lineHeight') {
          typographyToken[typedProperty] = '33px';
        } else if (typedProperty === 'letterSpacing') {
          typographyToken[typedProperty] = `${letterSpacing + 1}%`;
        } else if (typedProperty === 'paragraphSpacing') {
          typographyToken[typedProperty] = (paragraphSpacing + 1).toString();
        } else if (typedProperty === 'textCase') {
          typographyToken[typedProperty] = 'uppercase';
        } else if (typedProperty === 'textDecoration') {
          typographyToken[typedProperty] = 'underline';
        }

        expect(textStyleMatchesTypographyToken(figmaTextStyle, typographyToken)).toBe(false);
      });
    });

    it('should NOT match typography token when lineHeight unit is different and value is > 0', () => {
      const lineHeightValue = 33;
      const typographyToken: TokenTypographyValue = { ...dummyTypographyToken, lineHeight: `${lineHeightValue}px` };
      const figmaTextStyleWithLineHeightValue: TextStyle = {
        ...figmaTextStyle,
        lineHeight: { unit: 'PERCENT', value: lineHeightValue },
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyleWithLineHeightValue, typographyToken)).toBe(false);
    });

    it('should NOT match typography token when lineHeight unit is same but value is different', () => {
      const lineHeightValue = 33;
      const typographyToken: TokenTypographyValue = { ...dummyTypographyToken, lineHeight: `${lineHeightValue}px` };
      const figmaTextStyleWithLineHeightValue: TextStyle = {
        ...figmaTextStyle,
        lineHeight: { unit: 'PIXELS', value: lineHeightValue + 1 },
      };

      expect(textStyleMatchesTypographyToken(figmaTextStyleWithLineHeightValue, typographyToken)).toBe(false);
    });
  });
});
