import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { processNumberValue } from './processNumberValue';

export default function trimValue(value: SingleToken['value'], tokenType?: TokenTypes): SingleToken['value'] {
  if (tokenType === TokenTypes.NUMBER) {
    return processNumberValue(value) as SingleToken['value'];
  }

  // Gradient values are deeply nested (stops array, point objects) and hold
  // numbers that must stay numbers, so they are passed through untouched.
  if (tokenType === TokenTypes.GRADIENT) {
    return typeof value === 'string' ? value.trim() : value;
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
