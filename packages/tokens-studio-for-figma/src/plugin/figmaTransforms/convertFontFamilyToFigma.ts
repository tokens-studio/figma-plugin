export function convertFontFamilyToFigma(value: string, shouldOutputForVariables = false) {
  if (shouldOutputForVariables) {
    const fontFamilies = value.split(',');
    return fontFamilies[0].trim().replace(/['"]/g, '');
  }
  return value;
}
