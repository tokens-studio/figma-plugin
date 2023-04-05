import { convertTypographyNumberToFigma } from './generic';

export function convertLetterSpacingToFigma(inputValue: string, baseFontSize: string): LetterSpacing | null {
  let letterSpacing: LetterSpacing | null = null;
  const value = inputValue.toString();
  const numbers = /^-?\d+(\.\d+)?$/;
  if (value.trim().slice(-1) === '%' && value.trim().slice(0, -1).match(numbers)) {
    letterSpacing = {
      unit: 'PERCENT',
      value: Number(value.slice(0, -1)),
    };
  } else if (value.match(numbers) || value.endsWith('px')) {
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
