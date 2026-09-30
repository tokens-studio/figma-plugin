import {
  buildComposedColorValue,
  composedColorToTokenValue,
  isVariableComposedColor,
  parseComposedColorReference,
} from './composedColor';

const colorVariable = { id: 'VariableID:1:1', resolvedType: 'COLOR' } as Variable;
const opacityVariable = { id: 'VariableID:1:2', resolvedType: 'FLOAT' } as Variable;
const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id });

describe('parseComposedColorReference', () => {
  it.each([
    ['rgba({colors.red}, 0.5)', { colorReference: 'colors.red', opacityLiteral: '0.5' }],
    ['rgba({colors.red}, 50%)', { colorReference: 'colors.red', opacityLiteral: '50%' }],
    ['rgba({colors.red},{opacity.50})', { colorReference: 'colors.red', opacityReference: 'opacity.50' }],
    ['rgba($colors.red, $opacity.50)', { colorReference: 'colors.red', opacityReference: 'opacity.50' }],
    ['rgb({colors.red}, 0.5)', { colorReference: 'colors.red', opacityLiteral: '0.5' }],
    ['rgba(#ff0000, {opacity.50})', { opacityReference: 'opacity.50' }],
    ['rgba(255, 0, 0, {opacity.50})', { opacityReference: 'opacity.50' }],
  ])('parses %s', (input, expected) => {
    expect(parseComposedColorReference(input)).toEqual(expected);
  });

  it.each([
    '{colors.red}',
    '#ff0000',
    'rgba(255, 0, 0, 0.5)',
    'rgba(#ff0000, 0.5)',
    'rgba({colors.red} * 2, 0.5)',
    'rgba({colors.red}, {opacity.50} * 2)',
    'hsla(0, 100%, 50%, {opacity.50})',
    undefined,
  ])('ignores %s', (input) => {
    expect(parseComposedColorReference(input)).toBeNull();
  });
});

describe('buildComposedColorValue', () => {
  it('links color and keeps a literal opacity as a percentage', () => {
    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityLiteral: '0.5' },
      resolvedValue: '#ff000080',
      colorVariable,
    })).toEqual({ color: alias('VariableID:1:1'), opacity: 50 });

    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityLiteral: '25%' },
      resolvedValue: '#ff000040',
      colorVariable,
    })).toEqual({ color: alias('VariableID:1:1'), opacity: 25 });
  });

  it('links both color and opacity', () => {
    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityReference: 'opacity.50' },
      resolvedValue: '#ff000080',
      colorVariable,
      opacityVariable,
    })).toEqual({ color: alias('VariableID:1:1'), opacity: alias('VariableID:1:2') });
  });

  it('uses the resolved color when only opacity is linked', () => {
    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityReference: 'opacity.50' },
      resolvedValue: '#ff000080',
      opacityVariable,
    })).toEqual({ color: { r: 1, g: 0, b: 0 }, opacity: alias('VariableID:1:2') });
  });

  it('uses the resolved opacity when the opacity variable is missing', () => {
    const result = buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityReference: 'opacity.50' },
      resolvedValue: '#ff000080',
      colorVariable,
    });
    expect(result?.color).toEqual(alias('VariableID:1:1'));
    expect(result?.opacity).toBe(50);
  });

  it('returns null when nothing can be linked', () => {
    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityLiteral: '0.5' },
      resolvedValue: '#ff000080',
    })).toBeNull();
  });

  it('ignores variables of the wrong type', () => {
    expect(buildComposedColorValue({
      composed: { colorReference: 'colors.red', opacityReference: 'opacity.50' },
      resolvedValue: '#ff000080',
      colorVariable: { ...colorVariable, resolvedType: 'FLOAT' } as Variable,
      opacityVariable: { ...opacityVariable, resolvedType: 'STRING' } as Variable,
    })).toBeNull();
  });
});

describe('composedColorToTokenValue', () => {
  const names: Record<string, string> = { 'VariableID:1:1': 'colors.red', 'VariableID:1:2': 'opacity.50' };
  const getAliasName = (a: VariableAlias) => names[a.id];
  const rgbToHex = ({ r, g, b }: RGB) => `#${[r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;

  it('converts linked color with literal opacity', () => {
    expect(composedColorToTokenValue(
      { color: alias('VariableID:1:1') as VariableAlias, opacity: 50 },
      getAliasName,
      rgbToHex,
    )).toBe('rgba({colors.red}, 0.5)');
  });

  it('converts linked color and opacity', () => {
    expect(composedColorToTokenValue(
      { color: alias('VariableID:1:1') as VariableAlias, opacity: alias('VariableID:1:2') as VariableAlias },
      getAliasName,
      rgbToHex,
    )).toBe('rgba({colors.red}, {opacity.50})');
  });

  it('converts literal color with linked opacity', () => {
    expect(composedColorToTokenValue(
      { color: { r: 1, g: 0, b: 0 }, opacity: alias('VariableID:1:2') as VariableAlias },
      getAliasName,
      rgbToHex,
    )).toBe('rgba(#ff0000, {opacity.50})');
  });

  it('returns null when an alias cannot be resolved', () => {
    expect(composedColorToTokenValue(
      { color: alias('missing') as VariableAlias, opacity: 50 },
      getAliasName,
      rgbToHex,
    )).toBeNull();
  });

  it('round-trips through parse', () => {
    const value = composedColorToTokenValue(
      { color: alias('VariableID:1:1') as VariableAlias, opacity: 33.3 },
      getAliasName,
      rgbToHex,
    );
    const composed = parseComposedColorReference(value)!;
    expect(buildComposedColorValue({ composed, resolvedValue: '#ff000055', colorVariable }))
      .toEqual({ color: alias('VariableID:1:1'), opacity: 33.3 });
  });
});

describe('isVariableComposedColor', () => {
  it('distinguishes composed colors from other values', () => {
    expect(isVariableComposedColor({ color: alias('a'), opacity: 50 })).toBe(true);
    expect(isVariableComposedColor(alias('a'))).toBe(false);
    expect(isVariableComposedColor({
      r: 1, g: 0, b: 0, a: 1,
    })).toBe(false);
  });
});
