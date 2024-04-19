import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { SingleToken } from '@/types/tokens';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';

const typographyTokenValue: ResolvedTypographyObject = {
  fontFamily: 'Baskerville',
  fontSize: '24',
  fontWeight: 'Bold',
  lineHeight: 'AUTO',
  letterSpacing: '0',
  paragraphSpacing: '0',
  paragraphIndent: '0',
  textDecoration: 'NONE',
  textCase: 'NONE',
};

const typographyToken: SingleToken = {
  name: 'text.large',
  type: TokenTypes.TYPOGRAPHY,
  value: typographyTokenValue,
  resolvedValueWithReferences: typographyTokenValue,
};

const typographyTokenWithReferences: SingleToken = {
  name: 'text.largeWithReferences',
  type: TokenTypes.TYPOGRAPHY,
  value: {
    ...typographyTokenValue,
    fontSize: '32px',
    lineHeight: '36px',
    letterSpacing: '4px',
  },
  resolvedValueWithReferences: {
    ...typographyTokenValue,
    fontSize: '{fontSize.large}',
    lineHeight: '{lineHeight.large}',
    letterSpacing: '{letterSpacing.large}',
  },
};

const fontSizeLarge: SingleToken = {
  name: 'fontSize.large',
  type: TokenTypes.NUMBER,
  value: '32px',
};

const lineHeightLarge: SingleToken = {
  name: 'lineHeight.large',
  type: TokenTypes.NUMBER,
  value: '36px',
};

const letterSpacingLarge: SingleToken = {
  name: 'letterSpacing.large',
  type: TokenTypes.NUMBER,
  value: '4px',
};

const numericalWeightToken: SingleToken = {
  name: 'fontWeight.bold',
  type: TokenTypes.FONT_WEIGHTS,
  value: '700',
};

const typographyTokenWithNumericalWeight: SingleToken = {
  name: 'type.withNumericalWeight',
  type: TokenTypes.TYPOGRAPHY,
  value: { fontWeight: '700' },
  resolvedValueWithReferences: { fontWeight: '700' },
};

const typographyTokenWithNumericalWeightReference: SingleToken = {
  name: 'type.withNumericalWeightReference',
  type: TokenTypes.TYPOGRAPHY,
  value: { fontWeight: '700' },
  resolvedValueWithReferences: { fontWeight: '{fontWeight.bold}' },
};

// @ts-expect-error - intentionally missing value
const tokenWithoutValue: SingleToken = {
  name: 'type.withoutvalue',
  type: TokenTypes.TYPOGRAPHY,
};

const tokenWithStringValue: SingleToken = {
  name: 'type.withoutvalue',
  type: TokenTypes.TYPOGRAPHY,
  value: 'large',
};

const tokens: SingleToken[] = [typographyToken, typographyTokenWithReferences, fontSizeLarge, lineHeightLarge, letterSpacingLarge, numericalWeightToken, tokenWithoutValue, tokenWithStringValue, typographyTokenWithNumericalWeight, typographyTokenWithNumericalWeightReference];

describe('setTextValuesOnTarget', () => {
  let textNodeMock;
  const loadFontAsyncSpy = jest.spyOn(figma, 'loadFontAsync');

  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens,
    });
    textNodeMock = {
      description: '',
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      textCase: 'NONE',
      textDecoration: 'NONE',
      fontSize: 99,
      paragraphSpacing: 99,
      paragraphIndent: 99,
      letterSpacing: 99,
      lineHeight: 99,
    };
  });

  it('sets text properties if those are given', async () => {
    await setTextValuesOnTarget(textNodeMock, 'text.large');
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { family: 'Baskerville', style: 'Bold' } });
  });

  it('sets the right properties if references are given and they can be found', async () => {
    loadFontAsyncSpy.mockImplementationOnce(() => (
      Promise.reject()
    ));
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, 'text.largeWithReferences');
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      fontName: { ...textNodeMock.fontName, family: 'Baskerville', style: 'Bold' },
      fontSize: 32,
      lineHeight: {
        unit: 'PIXELS',
        value: 36,
      },
      letterSpacing: {
        unit: 'PIXELS',
        value: 4,
      },
    });
  });

  it('accepts a numerical fontWeight when created using variables)', async () => {
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, 'type.withNumericalWeightReference');
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, style: '700' } });
  });

  it('converts a numerical fontWeight and sets to the node', async () => {
    loadFontAsyncSpy.mockImplementationOnce(() => (
      Promise.reject()
    ));

    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, 'type.withNumericalWeight');
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, style: 'Bold' } });
  });

  it('can\'t set number fontWeight to the node if there is no matching fontWeight', async () => {
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.reject()
    ));
    await setTextValuesOnTarget(textNodeMock, 'type.withNumericalWeight');
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName } });
  });

  it('it throws error, when there is no value in token', async () => {
    await setTextValuesOnTarget(textNodeMock, 'type.withoutvalue');
    expect(textNodeMock).toEqual({
      ...textNodeMock,
    });
  });

  it('it does nothing when the type of value is string', async () => {
    await setTextValuesOnTarget(textNodeMock, 'text.withStringValue');
    expect(textNodeMock).toEqual({
      ...textNodeMock,
    });
  });
});
