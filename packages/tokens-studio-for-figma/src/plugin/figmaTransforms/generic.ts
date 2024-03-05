import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';

export function convertNumberToFigma(value: string) {
  return parseInt(value, 10);
}

export function fakeZeroForFigma(value: number) {
  return Number(value) === 0 ? 0.001 : value;
}

export function convertTypographyNumberToFigma(value: string, baseFontSize: string) {
  if (typeof value === 'string' && (value.endsWith('em') || value.endsWith('rem'))) {
    if (!isNaN(parseFloat(baseFontSize))) {
      return parseFloat(value) * parseFloat(baseFontSize);
    }
    return parseFloat(value) * parseFloat(defaultBaseFontSize);
  }
  return parseFloat(value);
}
