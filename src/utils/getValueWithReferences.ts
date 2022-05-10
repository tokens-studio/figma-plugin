import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
import { TransformerOptions } from './types';

function getSimpleValue(resolvedValue: string | number, rawValue: string | number, options: TransformerOptions) {
  let value = resolvedValue;
  if (typeof rawValue === 'string' && resolvedValue.toString() !== rawValue) {
    if (options.resolveReferences === false) {
      value = rawValue;
    }
    if (options.resolveReferences === 'math') {
      const singleAliasRegEx = /^{[^}]*}$|^\$[^$]*$/;
      const oneOrMoreAliasRegEx = /{[^}]*}|\$[\w.-]*/g;
      const aliasRegEx = typeof resolvedValue === 'number' ? singleAliasRegEx : oneOrMoreAliasRegEx;
      if (aliasRegEx.test(rawValue)) {
        value = rawValue;
      }
    }
  }
  return value as string; // TODO: remove `as string` when SingleGenericToken supports value as `string|number`
}

function getComplexValue<T extends TokenTypograpyValue | TokenBoxshadowValue>(
  resolvedValue: T,
  rawValue: T,
  options: TransformerOptions,
) {
  type IndexedValueType = Record<string, string | number>;
  return Object.entries(resolvedValue).reduce((acc, [key, val]) => {
    const rawVal = (rawValue as IndexedValueType)[key];
    acc[key] = getSimpleValue(val, rawVal, options);
    return acc;
  }, {} as IndexedValueType) as T;
}

export function getValueWithReferences(token: SingleToken, options: TransformerOptions) {
  if (token.rawValue === undefined) {
    return token.value;
  }

  if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW) {
    if (Array.isArray(token.value)) {
      const rawValue = token.rawValue as TokenBoxshadowValue[];
      return token.value.map((shadow, index) => getComplexValue(shadow, rawValue[index], options));
    }
    return getComplexValue(token.value, token.rawValue as TokenTypograpyValue | TokenBoxshadowValue, options);
  }

  return getSimpleValue(token.value, token.rawValue, options);
}
