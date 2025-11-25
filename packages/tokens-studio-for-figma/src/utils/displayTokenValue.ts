import { convertTypographyNumberToFigma } from '@/plugin/figmaTransforms/generic';
import { SingleToken } from '@/types/tokens';

/**
 * Converts a token value for display purposes, showing pixel equivalents for rem values
 * @param value - The raw token value
 * @param baseFontSize - The base font size to use for rem conversion
 * @returns The formatted display value
 */
export function formatTokenValueForDisplay(value: SingleToken['value'], baseFontSize: string = '16px'): string {
  const valueString = String(value);

  // Check if the value is a rem value
  if (typeof value === 'string' && value.endsWith('rem')) {
    const convertedValue = convertTypographyNumberToFigma(value, baseFontSize);
    return `${value} (${convertedValue}px)`;
  }

  return valueString;
}
