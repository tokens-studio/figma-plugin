import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { processNumberValue } from './processNumberValue';

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
