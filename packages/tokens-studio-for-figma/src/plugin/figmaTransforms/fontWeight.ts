export function convertFontWeightToFigma(value: string, shouldOutputForVariables = false): string[] {
  if (shouldOutputForVariables) {
    // Studio's server resolver returns fontWeights as an array-shaped string
    // (e.g. '["Bold","Regular"]'). Strip surrounding brackets and take the first
    // entry so we don't end up writing the raw JSON literal to the variable.
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inner = trimmed.slice(1, -1);
      const first = inner.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '').trim() ?? '';
      return [first.length > 0 ? first : value];
    }
    return [value];
  }

  switch (value) {
    case '100':
      return ['Thin', 'Hairline'];
    case '200':
      return ['ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light'];
    case '300':
      return ['Light'];
    case '400':
      return ['Regular', 'Normal'];
    case '500':
      return ['Medium'];
    case '600':
      return ['SemiBold', 'Semibold', 'Semi Bold', 'DemiBold', 'Demi Bold'];
    case '700':
      return ['Bold'];
    case '800':
      return ['ExtraBold', 'Extra Bold', 'UltraBold', 'Ultra Bold'];
    case '900':
      return ['Black', 'Heavy'];
    default:
      return [value];
  }
}
