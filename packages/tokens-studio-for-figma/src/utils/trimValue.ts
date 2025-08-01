import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

export function processNumberValue(value: SingleToken['value']): number | string {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    const numericValue = Number(trimmedValue);
    if (!isNaN(numericValue) && isFinite(numericValue) && trimmedValue !== '') {
      if (/^-?\d*\.?\d+$/.test(trimmedValue)) {
        return numericValue;
      }
    }
    return trimmedValue;
  }

  return value as string;
}

export default function trimValue(value: SingleToken['value'], tokenType?: TokenTypes): SingleToken['value'] {
  if (tokenType === TokenTypes.NUMBER) {
    return processNumberValue(value) as SingleToken['value'];
  }

  if (Array.isArray(value)) {
    return value.map((item) => (
      Object.entries(item).reduce<Record<string, string>>((acc, [key, val]) => {
        acc[key] = val.toString().trim();
        return acc;
      }, {})
    )) as SingleToken['value'];
  } if (typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string>>((acc, [key, val]) => {
      acc[key] = val.toString().trim();
      return acc;
    }, {});
  }
  return value.toString().trim();
}
