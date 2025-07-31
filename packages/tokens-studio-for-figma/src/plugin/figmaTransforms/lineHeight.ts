import { convertTypographyNumberToFigma } from './generic';

export function convertLineHeightToFigma(inputValue: string, baseFontSize: string, shouldOutputForVariables = false): number | LineHeight | null {
  let lineHeight: LineHeight | null = null;
  const value = inputValue.toString();
  const numbers = /^-?\d+(\.\d+)?$/; // Matches both negative and positive numbers ending with %
  if (value.match(numbers) || value.endsWith('px') || value.endsWith('em') || value.endsWith('rem')) {
    if (shouldOutputForVariables) {
      return convertTypographyNumberToFigma(value, baseFontSize);
    }
    lineHeight = {
      unit: 'PIXELS',
      value: convertTypographyNumberToFigma(value, baseFontSize),
    };
  } else if (value.trim().slice(-1) === '%' && value.trim().slice(0, -1).match(numbers)) {
    lineHeight = {
      unit: 'PERCENT',
      value: Number(value.slice(0, -1)),
    };
  } else {
    lineHeight = {
      unit: 'AUTO',
    };
  }
  return lineHeight;
}

export function convertFigmaToLineHeight(inputValue: LineHeight): string | number {
  if (inputValue.unit === 'PIXELS') {
    return +inputValue.value.toFixed(2);
  } if (inputValue.unit === 'PERCENT') {
    return `${+inputValue.value.toFixed(2)}%`;
  }
  return 'AUTO';
}
