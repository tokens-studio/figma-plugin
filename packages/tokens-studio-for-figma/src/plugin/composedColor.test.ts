import {
  buildComposedColorValue,
  canLinkOpacity,
  ComposedColorTokenInfo,
  composedColorToTokenValue,
  findOpaqueRoot,
  flatColorValue,
  getComposedColorCandidates,
  isVariableComposedColor,
  parseComposedColorReference,
} from './composedColor';

const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id });

describe('parseComposedColorReference', () => {
  it.each([
    ['rgba({colors.red}, 0.5)', {
      mode: 'replace', colorExpression: '{colors.red}', colorReference: 'colors.red', opacityLiteral: 0.5,
    }],
    ['rgba({colors.red}, 50%)', {
      mode: 'replace', colorExpression: '{colors.red}', colorReference: 'colors.red', opacityLiteral: 0.5,
    }],
    ['rgba($colors.red, $opacity.50)', {
      mode: 'replace', colorExpression: '$colors.red', colorReference: 'colors.red', opacityReference: 'opacity.50',
    }],
    ['rgba(#ff0000, {opacity.50})', {
      mode: 'replace', colorExpression: '#ff0000', colorHexLiteral: '#ff0000', opacityReference: 'opacity.50',
    }],
    ['rgba(255, 0, 0, {opacity.50})', { mode: 'replace', colorExpression: '', opacityReference: 'opacity.50' }],
    ['combine_alpha({color.base}, {opacity.hover}, "source")', {
      mode: 'source', colorExpression: '{color.base}', colorReference: 'color.base', opacityReference: 'opacity.hover',
    }],
    ['combine_alpha({color.base}, 40%, "replace")', {
      mode: 'replace', colorExpression: '{color.base}', colorReference: 'color.base', opacityLiteral: 0.4,
    }],
    ['combine_alpha({color.base}, 40, "multiply")', {
      mode: 'multiply', colorExpression: '{color.base}', colorReference: 'color.base', opacityLiteral: 1,
    }],
    ['set_alpha({color.translucent}, 0.4)', {
      mode: 'replace', colorExpression: '{color.translucent}', colorReference: 'color.translucent', opacityLiteral: 0.4,
    }],
    ['ts_alpha_srgb({color.base}, 0.4)', {
      mode: 'replace', colorExpression: '{color.base}', colorReference: 'color.base', opacityLiteral: 0.4,
    }],
    ['{color.base}.with_alpha(0.4)', {
      mode: 'replace', colorExpression: '{color.base}', colorReference: 'color.base', opacityLiteral: 0.4,
    }],
    ['combine_alpha(set_alpha({color.base}, 0.5), {opacity.hover}, "replace")', {
      mode: 'replace', colorExpression: 'set_alpha({color.base}, 0.5)', opacityReference: 'opacity.hover',
    }],
  ])('parses %s', (input, expected) => {
    expect(parseComposedColorReference(input)).toEqual(expected);
  });

  it.each([
    '{colors.red}',
    '#ff0000',
    'rgba(255, 0, 0, 0.5)',
    'rgba(#ff0000, 0.5)',
    'set_alpha(#ff0000, 0.5)',
    'rgba({colors.red} * 2, 0.5)',
    'rgba({colors.red}, {opacity.50} * 2)',
    'hsla(0, 100%, 50%, {opacity.50})',
    'combine_alpha({color.base}, {opacity.hover})',
    'combine_alpha({color.base}, {opacity.hover}, source)',
    'combine_alpha({color.base}, {opacity.hover}, "overlay")',
    'combine_alpha(lighten({color.base}, 0.1), {opacity.hover}, "source")',
    'combine_alpha(combine_alpha({color.base}, 0.5, "multiply"), {opacity.hover}, "replace")',
    'mix({color.base}, {color.other}, 0.5)',
    undefined,
  ])('ignores %s', (input) => {
    expect(parseComposedColorReference(input)).toBeNull();
  });
});

// Mirrors the Studio test project: values are what Studio's resolver returns.
const tokens: Record<string, ComposedColorTokenInfo> = {
  'color.base': { value: '#3366FF', rawValue: '#3366FF', type: 'color' },
  'color.translucent': { value: '#3366FF80', rawValue: '#3366FF80', type: 'color' },
  'color.derived': { value: '#3366ff80', rawValue: 'set_alpha({color.base}, 0.5)', type: 'color' },
  'color.derived-alias': { value: '#3366ff80', rawValue: '{color.derived}', type: 'color' },
  'opacity.hover': { value: '0.8', rawValue: '0.8', type: 'opacity' },
  'number.hover': { value: '0.8', rawValue: '0.8', type: 'number' },
};
const lookup = (name: string) => tokens[name];
const variables: Record<string, Variable> = {
  'color.base': { id: 'V:base', resolvedType: 'COLOR' } as Variable,
  'color.translucent': { id: 'V:translucent', resolvedType: 'COLOR' } as Variable,
  'color.derived': { id: 'V:derived', resolvedType: 'COLOR' } as Variable,
  'opacity.hover': { id: 'V:hover', resolvedType: 'FLOAT' } as Variable,
  'number.hover': { id: 'V:number', resolvedType: 'FLOAT' } as Variable,
};

// The full export path: parse → candidates → build, as setValuesOnVariable + updateVariablesToReference do
function exportComposed(rawValue: string, resolvedValue: string) {
  const composed = parseComposedColorReference(rawValue)!;
  return buildComposedColorValue({
    composed,
    resolvedValue,
    colorCandidates: getComposedColorCandidates(composed, lookup)
      .map(({ reference, value }) => ({ variable: variables[reference], value })),
    opacityVariable: composed.opacityReference && canLinkOpacity(composed, lookup) ? variables[composed.opacityReference] : undefined,
    opacityReferenceValue: composed.opacityReference ? lookup(composed.opacityReference)?.value : undefined,
  });
}

const blue = { r: 0.2, g: 0.4, b: 1 };

describe('buildComposedColorValue (Studio parity)', () => {
  it.each([
    ['source on opaque', 'combine_alpha({color.base}, {opacity.hover}, "source")', '#3366ffcc', { color: alias('V:base'), opacity: alias('V:hover') }],
    ['source on translucent (dormant opacity)', 'combine_alpha({color.translucent}, {opacity.hover}, "source")', '#3366FF80', { color: alias('V:translucent'), opacity: alias('V:hover') }],
    ['percent literal on opaque', 'combine_alpha({color.base}, 40%, "replace")', '#3366ff66', { color: alias('V:base'), opacity: 40 }],
    ['legacy rgba on opaque', 'rgba({color.base}, 0.4)', '#3366ff66', { color: alias('V:base'), opacity: 40 }],
    ['replace on derived translucent → opaque root', 'combine_alpha({color.derived}, {opacity.hover}, "replace")', '#3366ffcc', { color: alias('V:base'), opacity: alias('V:hover') }],
    ['set_alpha on derived translucent → opaque root', 'set_alpha({color.derived}, 0.4)', '#3366ff66', { color: alias('V:base'), opacity: 40 }],
    ['root through a pure alias', 'set_alpha({color.derived-alias}, 0.4)', '#3366ff66', { color: alias('V:base'), opacity: 40 }],
    ['nested replace base', 'combine_alpha(set_alpha({color.base}, 0.5), {opacity.hover}, "replace")', '#3366ffcc', { color: alias('V:base'), opacity: alias('V:hover') }],
  ])('links %s', (_, rawValue, resolvedValue, expected) => {
    expect(exportComposed(rawValue, resolvedValue)).toEqual(expected);
  });

  it('keeps a translucent hex literal in source mode, with the opacity linked', () => {
    expect(exportComposed('combine_alpha(#3366ff80, {opacity.hover}, "source")', '#3366ff80')).toEqual({
      color: expect.objectContaining({ ...blue, a: expect.closeTo(0.5, 2) }),
      opacity: alias('V:hover'),
    });
  });

  it('keeps only the opacity linked for replace on a literal translucent color', () => {
    const result = exportComposed('combine_alpha({color.translucent}, {opacity.hover}, "replace")', '#3366ffcc');
    expect(result?.opacity).toEqual(alias('V:hover'));
    expect(result?.color).toMatchObject(blue);
  });

  // Figma keeps a translucent linked color's own alpha, so these can't render Studio's value
  it.each([
    ['set_alpha on a literal translucent color', 'set_alpha({color.translucent}, 0.4)', '#3366ff66'],
    ['multiply on translucent', 'combine_alpha({color.translucent}, {opacity.hover}, "multiply")', '#3366ff66'],
    ['screen on translucent', 'combine_alpha({color.translucent}, {opacity.hover}, "screen")', '#3366ffe6'],
    ['multiply on derived translucent', 'combine_alpha({color.derived}, {opacity.hover}, "multiply")', '#3366ff66'],
  ])('falls back to a flat color for %s', (_, rawValue, resolvedValue) => {
    expect(exportComposed(rawValue, resolvedValue)).toBeNull();
  });

  it('uses a linked opacity with the opaque resolved color when no color variable exists', () => {
    const result = buildComposedColorValue({
      composed: parseComposedColorReference('combine_alpha({color.missing}, {opacity.hover}, "replace")')!,
      resolvedValue: '#3366ffcc',
      opacityVariable: variables['opacity.hover'],
      opacityReferenceValue: '0.8',
    });
    expect(result?.opacity).toEqual(alias('V:hover'));
    expect(result?.color).toMatchObject(blue);
  });

  it('writes a flat color when nothing can be linked', () => {
    expect(buildComposedColorValue({
      composed: parseComposedColorReference('set_alpha({color.missing}, 0.4)')!,
      resolvedValue: '#3366ff66',
    })).toBeNull();
  });

  it('does not link a number token as opacity (not on the 0-100 scale)', () => {
    const composed = parseComposedColorReference('combine_alpha({color.base}, {number.hover}, "source")')!;
    expect(canLinkOpacity(composed, lookup)).toBe(false);
    // Its value is still used, as a literal
    expect(exportComposed('combine_alpha({color.base}, {number.hover}, "source")', '#3366ffcc'))
      .toEqual({ color: alias('V:base'), opacity: 80 });
  });

  it('never links a color whose value is unknown', () => {
    expect(buildComposedColorValue({
      composed: parseComposedColorReference('rgba({color.base}, 0.4)')!,
      resolvedValue: '#3366ff66',
      colorCandidates: [{ variable: variables['color.base'], value: undefined }],
    })).toBeNull();
  });

  it('ignores variables of the wrong type', () => {
    expect(buildComposedColorValue({
      composed: parseComposedColorReference('combine_alpha({color.base}, {opacity.hover}, "source")')!,
      resolvedValue: '#3366ffcc',
      colorCandidates: [{ variable: { id: 'V:x', resolvedType: 'FLOAT' } as Variable, value: '#3366FF' }],
      opacityVariable: { id: 'V:y', resolvedType: 'STRING' } as Variable,
      opacityReferenceValue: '0.8',
    })).toBeNull();
  });

  it('accepts Figma variable values', () => {
    expect(buildComposedColorValue({
      composed: parseComposedColorReference('combine_alpha({color.base}, {opacity.hover}, "source")')!,
      resolvedValue: '#3366ffcc',
      colorCandidates: [{
        variable: variables['color.base'],
        value: {
          r: 0.2, g: 0.4, b: 1, a: 1,
        },
      }],
      opacityVariable: variables['opacity.hover'],
      opacityReferenceValue: '80%',
    })).toEqual({ color: alias('V:base'), opacity: alias('V:hover') });
  });
});

describe('findOpaqueRoot', () => {
  it('returns an opaque reference itself', () => {
    expect(findOpaqueRoot('{color.base}', lookup)).toEqual({ reference: 'color.base', value: '#3366FF' });
  });

  it('stops at a literal translucent color', () => {
    expect(findOpaqueRoot('{color.translucent}', lookup)).toBeNull();
  });

  it('does not loop on circular references', () => {
    const circular = (name: string) => ({ a: { value: '#ff000080', rawValue: '{b}' }, b: { value: '#ff000080', rawValue: '{a}' } } as any)[name];
    expect(findOpaqueRoot('{a}', circular)).toBeNull();
  });
});

describe('getComposedColorCandidates', () => {
  it('tries the source color itself before its opaque root', () => {
    const composed = parseComposedColorReference('combine_alpha({color.derived}, {opacity.hover}, "source")')!;
    expect(getComposedColorCandidates(composed, lookup).map((c) => c.reference)).toEqual(['color.derived', 'color.base']);
  });
});

describe('flatColorValue', () => {
  it('converts the resolved value to a Figma color', () => {
    expect(flatColorValue('#ff000080')).toMatchObject({
      r: 1, g: 0, b: 0, a: 0.5,
    });
    expect(flatColorValue(undefined)).toBeNull();
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
      { color: alias('VariableID:1:1') as VariableAlias, opacity: 33 },
      getAliasName,
      rgbToHex,
    );
    const composed = parseComposedColorReference(value)!;
    expect(buildComposedColorValue({
      composed,
      resolvedValue: '#ff000054',
      colorCandidates: [{ variable: { id: 'VariableID:1:1', resolvedType: 'COLOR' } as Variable, value: '#ff0000' }],
    })).toEqual({ color: alias('VariableID:1:1'), opacity: 33 });
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
