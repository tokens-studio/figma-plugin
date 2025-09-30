import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from './tokenHelpers';
import checkIfTokenCanCreateVariable from './checkIfTokenCanCreateVariable';
import { SettingsState } from '@/app/store/models/settings';

const settings: SettingsState = {
  variablesColor: true,
  variablesNumber: true,
  variablesString: true,
  variablesBoolean: true,
  renameExistingStylesAndVariables: true,
  removeStylesAndVariablesWithoutConnection: true,
};

describe('checkIfTokenCanCreateVariable', () => {
  it('multi value border radius and spacing tokens can\'t create variable', () => {
    const multiValueBorderRadiusToken = {
      name: 'border-radius-multi-value',
      value: '1 2',
      type: TokenTypes.BORDER_RADIUS,
    } as ResolveTokenValuesResult;
    const multiValueSpacingToken = {
      name: 'spacing-multi-value',
      value: '1 2',
      type: TokenTypes.SPACING,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(multiValueBorderRadiusToken, settings)).toBe(false);
    expect(checkIfTokenCanCreateVariable(multiValueSpacingToken, settings)).toBe(false);
  });

  it('gradient colors can\'t create variable', () => {
    const linearGradientColor = {
      name: 'linear-gradient-color',
      value: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;

    const radialGradientColor = {
      name: 'radial-gradient-color',
      value: 'radial-gradient(circle, #ff0000 0%, #0000ff 100%)',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;

    const conicGradientColor = {
      name: 'conic-gradient-color',
      value: 'conic-gradient(from 90deg, #ff0000, #0000ff)',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;

    expect(checkIfTokenCanCreateVariable(linearGradientColor, settings)).toBe(false);
    expect(checkIfTokenCanCreateVariable(radialGradientColor, settings)).toBe(false);
    expect(checkIfTokenCanCreateVariable(conicGradientColor, settings)).toBe(false);
  });

  it('should return false for color token when variablesColor setting is false', () => {
    const colorToken = {
      name: 'color-token',
      value: '#FF0000',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(colorToken, { ...settings, variablesColor: false })).toBe(false);
  });

  it('should return false for number token when variablesNumber setting is false', () => {
    const numberToken = {
      name: 'number-token',
      value: '10',
      type: TokenTypes.NUMBER,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(numberToken, { ...settings, variablesNumber: false })).toBe(false);
  });

  it('should return false for string token when variablesString setting is false', () => {
    const stringToken = {
      name: 'string-token',
      value: 'Hello',
      type: TokenTypes.STRING,
    } as ResolveTokenValuesResult;

    expect(checkIfTokenCanCreateVariable(stringToken, {
      ...settings,
      variablesString: false,
    })).toBe(false);
  });

  it('should return false for boolean token when variablesBoolean setting is false', () => {
    const booleanToken = {
      name: 'boolean-token',
      value: 'true',
      type: TokenTypes.BOOLEAN,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(booleanToken, {
      ...settings,
      variablesBoolean: false,
    })).toBe(false);
  });

  it('should return false for font weights token when variablesNumber setting is false and value is numeric', () => {
    const fontWeightsToken = {
      name: 'font-weights-token',
      value: '400',
      type: TokenTypes.FONT_WEIGHTS,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(fontWeightsToken, {
      ...settings,
      variablesNumber: false,
    })).toBe(false);
  });

  it('should return false for font weights token when variablesString setting is false and value is not numeric', () => {
    const fontWeightsToken = {
      name: 'font-weights-token',
      value: 'bold',
      type: TokenTypes.FONT_WEIGHTS,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(fontWeightsToken, {
      ...settings,
      variablesString: false,
    })).toBe(false);
  });

  it('should return false for line heights token when value is "AUTO"', () => {
    const lineHeightsToken = {
      name: 'line-heights-token',
      value: 'AUTO',
      type: TokenTypes.LINE_HEIGHTS,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(lineHeightsToken, settings)).toBe(false);
  });

  it('should return false for percentage values on non-text tokens', () => {
    const percentageToken = {
      name: 'percentage-token',
      value: '50%',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(percentageToken, settings)).toBe(false);
  });

  it('should return true for valid tokens and settings', () => {
    const validToken = {
      name: 'valid-token',
      value: '10',
      type: TokenTypes.NUMBER,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(validToken, settings)).toBe(true);
  });
});
