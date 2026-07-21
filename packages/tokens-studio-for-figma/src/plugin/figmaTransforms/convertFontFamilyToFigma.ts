export function convertFontFamilyToFigma(value: string, shouldOutputForVariables = false) {
  const stringValue = value.toString();
  try {
    if (shouldOutputForVariables) {
      // Studio's server resolver returns fontFamilies as an array-shaped string
      // (e.g. '["Arial","Helvetica"]'). Strip surrounding brackets before splitting
      // so we don't end up with '[Arial' as the "first" family.
      const trimmed = stringValue.trim();
      const withoutBrackets = trimmed.startsWith('[') && trimmed.endsWith(']')
        ? trimmed.slice(1, -1)
        : trimmed;
      const fontFamilies = withoutBrackets.split(',');
      return fontFamilies[0].trim().replace(/['"]/g, '');
    }
    return stringValue;
  } catch (e) {
    console.error('font family err', stringValue, e);
    return stringValue;
  }
}
