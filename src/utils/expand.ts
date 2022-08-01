import { SingleToken } from '@/types/tokens';
import { convertToDefaultProperty } from './convertToDefaultProperty';

interface Result {
  [K: string]: {
    type: string;
    value: string | number
  } | Result
}

export function expand(token: SingleToken['value']) {
  return Object.entries(token).reduce<Result>((acc, [key, val]) => {
    if (typeof val === 'string' || typeof val === 'number') {
      acc[key] = {
        value: val,
        type: convertToDefaultProperty(key),
      };
    } else {
      acc[key] = expand(val);
    }

    return acc;
  }, {});
}
