import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function processTextStyleProperty(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[] | Map<string, Variable>,
  tokens: any,
  tokenType: TokenTypes,
  defaultNamePrefix: string,
  idx: number,
  valueTransformer?: (value: any) => string,
): StyleToCreateToken {
  // Check if the style has a bound variable for this property
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;
  if (boundVariables?.[propertyKey]?.id) {
    const variable = localVariables instanceof Map
      ? localVariables.get(boundVariables[propertyKey]?.id!)
      : localVariables.find((v) => v.id === boundVariables[propertyKey]?.id);

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

        if (existingToken) {
          return {
            name: existingToken.name,
            value: typeof existingToken.value === 'string' ? existingToken.value : String(existingToken.value),
            type: tokenType,
          };
        }
      }

      // If no existing token found, create a token from the variable
      const styleValue = style[propertyKey as keyof TextStyle];
      const transformedValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);

      return {
        name: normalizedName,
        value: transformedValue,
        type: tokenType,
      };
    }
  }

  // If no variable or existing token is found, create a new token
  const styleValue = style[propertyKey as keyof TextStyle];
  const transformedValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);

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
    value: transformedValue,
    type: tokenType,
  };
}
