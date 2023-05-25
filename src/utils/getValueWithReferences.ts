import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenBoxshadowValue, TokenTypographyValue } from '@/types/values';
import { TransformerOptions } from './types';

function getSimpleValue(resolvedValue: SingleToken['value'], rawValue: SingleToken['value'], options: TransformerOptions) {
  let value = resolvedValue;
  /*
   * ***************************************************************************
   * TOKEN EXAMPLES WHEN USING --resolveReferences='math'
   * ***************************************************************************
   * {spacing.xs} * 2                 =>  MATH EXPRESSION       => RESOLVE
   * {spacing.xs} * {spacing.scale}   =>  MATH EXPRESSION       => RESOLVE
   *
   * {spacing.xs}                     =>  SINGLE TOKEN          => DON'T RESOLVE
   * {spacing.xs}rem                  =>  SINGLE TOKEN + UNIT   => DON'T RESOLVE
   * {spacing.xs}{spacing.unit}       =>  MULTIPLE TOKENS       => DON'T RESOLVE
   *
   * rgba(255, 0, 0, {opacity.low})   =>  CSS FUNCTION          => DON'T RESOLVE
   * calc({spacing.xl} * 2)           =>  CSS FUNCTION          => DON'T RESOLVE
   * 20% {border-radius.smooth}       =>  CSS LIST VALUE        => DON'T RESOLVE
   * ***************************************************************************
   */

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

function getComplexValue<T extends SingleToken['value']>(
  resolvedValue: T,
  rawValue: T,
  options: TransformerOptions,
) {
  type IndexedValueType = Record<string, string | number>;
  return Object.entries(resolvedValue).reduce((acc, [key, val]) => {
    const rawVal = (rawValue as IndexedValueType)[key];
    // TODO: Remove as SingleToken["value"]
    acc[key] = getSimpleValue(val as SingleToken['value'], rawVal as SingleToken['value'], options);
    return acc;
  }, {} as IndexedValueType) as T;
}

export function getValueWithReferences(token: SingleToken, options: TransformerOptions) {
  if (token.rawValue === undefined) {
    return token.value;
  }

  if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW || token.type === TokenTypes.COMPOSITION || token.type === TokenTypes.BORDER) {
    if (Array.isArray(token.value)) {
      const rawValue = token.rawValue as TokenBoxshadowValue[];
      return token.value.map((shadow, index) => getComplexValue(shadow, rawValue[index], options));
    }
    return getComplexValue(token.value, token.rawValue as TokenTypographyValue | TokenBoxshadowValue, options);
  }

  return getSimpleValue(token.value, token.rawValue, options);
}
