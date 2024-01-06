import { SingleToken } from '@/types/tokens';
import { convertToDefaultProperty } from './convertToDefaultProperty';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

interface BaseResult {
  type: string;
  value: string | number;
}

interface Result {
  [key: string]: BaseResult | Result;
}

export function expand(token: SingleToken['value']) {
  return Object.entries(token).reduce<Result>((acc, [key, val]) => {
    if (typeof val === 'string' || typeof val === 'number') {
      // Temporarily cast to 'any' to bypass TypeScript's static type checking. Our keys can either be value or $value (same for type)
      const resultItem: any = {};
      resultItem[TokenFormat.tokenValueKey] = val;
      resultItem[TokenFormat.tokenTypeKey] = convertToDefaultProperty(key);

      // Now cast back to BaseResult
      acc[key] = resultItem as BaseResult;
    } else {
      acc[key] = expand(val);
    }

    return acc;
  }, {});
}
