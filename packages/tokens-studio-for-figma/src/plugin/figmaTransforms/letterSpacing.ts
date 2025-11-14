import { convertTypographyNumberToFigma } from './generic';
import { numberMatchesPercentage } from './numberMatchesPercentage';
import { numberRegex } from '../../constants/numberRegex';

export function convertLetterSpacingToFigma(inputValue: string, baseFontSize: string, shouldOutputForVariables = false): number | LetterSpacing | null {
  let letterSpacing: LetterSpacing | null = null;
  const value = inputValue.toString();
  
  // Handle "none" as 0 to fix the issue where letterSpacing 0 is incorrectly shown as "none"
  // "none" is not a valid CSS letter-spacing value - the default should be 0
  if (value.toLowerCase() === 'none') {
    if (shouldOutputForVariables) {
      return 0;
    }
    letterSpacing = {
      unit: 'PIXELS',
      value: 0,
    };
  } else if (numberMatchesPercentage(value)) {
    letterSpacing = {
      unit: 'PERCENT',
      value: Number(value.slice(0, -1)),
    };
  } else if (value.match(numberRegex) || value.endsWith('px') || value.endsWith('em') || value.endsWith('rem')) {
    if (shouldOutputForVariables) {
      return convertTypographyNumberToFigma(value, baseFontSize);
    }
    letterSpacing = {
      unit: 'PIXELS',
      value: convertTypographyNumberToFigma(value, baseFontSize),
    };
  }
  return letterSpacing;
}

export function convertFigmaToLetterSpacing(inputValue: LetterSpacing): string | number {
  const { unit, value } = inputValue;
  if (unit === 'PERCENT') {
    return `${+value.toFixed(2)}%`;
  }
  return +value.toFixed(2);
}
