export function convertFontFamilyToFigma(value: string, shouldOutputForVariables = false) {
  const stringValue = value.toString();
  try {
    if (shouldOutputForVariables) {
      const fontFamilies = stringValue.split(',');
      return fontFamilies[0].trim().replace(/['"]/g, '');
    }
    return stringValue;
  } catch (e) {
    console.error('font family err', stringValue, e);
    return stringValue;
  }
}
