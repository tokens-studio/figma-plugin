import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

// Preserve numeric values for appropriate token types
const numericTokenTypes = [
  TokenTypes.FONT_SIZES,
  TokenTypes.LINE_HEIGHTS,
  TokenTypes.LETTER_SPACING,
  TokenTypes.PARAGRAPH_SPACING,
];

const getFinalValue = (styleValue: any, tokenType: TokenTypes, valueTransformer?: (value: any) => string | number) => {
  const transformedValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
  return numericTokenTypes.includes(tokenType) && typeof styleValue === 'number'
    ? styleValue
    : transformedValue;
};

export function processTextStyleProperty(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[],
  tokens: any,
  tokenType: TokenTypes,
  defaultNamePrefix: string,
  idx: number,
  valueTransformer?: (value: any) => string | number,
): StyleToCreateToken {
  // Check if the style has a bound variable for this property
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;
  if (boundVariables?.[propertyKey]?.id) {
    const variable = localVariables.find((v) => v.id === boundVariables[propertyKey]?.id);
    if (variable) {
      const normalizedName = variable.name.replace(/\//g, '.');

      if (tokens) {
        // Look for an existing token with this name
        const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
          if (found) return found;
          const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
            && token !== null
            && 'name' in token
            && token.name === normalizedName) : null;
          return foundToken || null;
        }, null);

        // If an existing token is found, use it
        if (existingToken) {
          return {
            name: existingToken.name,
            value: typeof existingToken.value === 'string' ? existingToken.value : String(existingToken.value),
            type: tokenType,
          };
        }
      }

      // If no existing token is found but variable exists, create a token with the variable's resolved value
      const styleValue = style[propertyKey as keyof TextStyle];
      const finalValue = getFinalValue(styleValue, tokenType, valueTransformer);

      return {
        name: normalizedName,
        value: finalValue,
        type: tokenType,
      };
    }
  }

  // If no variable or existing token is found, create a new token
  const styleValue = style[propertyKey as keyof TextStyle];
  const finalValue = getFinalValue(styleValue, tokenType, valueTransformer);

  let tokenName = defaultNamePrefix;
  if (idx !== undefined) {
    if (tokenType === TokenTypes.FONT_WEIGHTS) {
      tokenName = `${defaultNamePrefix}-${idx}`;
    } else if (tokenType !== TokenTypes.FONT_FAMILIES) {
      tokenName = `${defaultNamePrefix}.${idx}`;
    }
  }

  return {
    name: tokenName,
    value: finalValue,
    type: tokenType,
  };
}
