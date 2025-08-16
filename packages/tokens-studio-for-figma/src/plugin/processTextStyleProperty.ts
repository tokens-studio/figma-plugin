import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function processTextStyleProperty(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[],
  tokens: any,
  tokenType: TokenTypes,
  defaultNamePrefix: string,
  idx: number,
  valueTransformer?: (value: any) => string,
): StyleToCreateToken {
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;
  let boundVariableId = boundVariables?.[propertyKey]?.id;

  if (!boundVariableId && propertyKey === 'fontStyle') {
    boundVariableId = boundVariables?.fontWeight?.id;
  }

  if (boundVariableId) {
    const variable = localVariables.find((v) => v.id === boundVariableId);
    if (variable && tokens) {
      const normalizedName = variable.name.replace(/\//g, '.');

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

      let tokenValue: string;
      const firstModeValue = Object.values(variable.valuesByMode)[0];

      if (typeof firstModeValue === 'object' && 'type' in firstModeValue && firstModeValue.type === 'VARIABLE_ALIAS') {
        const aliasVariable = figma.variables.getVariableById(firstModeValue.id);
        if (aliasVariable) {
          tokenValue = `{${aliasVariable.name.replace(/\//g, '.')}}`;
        } else {
          const styleValue = style[propertyKey as keyof TextStyle];
          if (styleValue === undefined || styleValue === null) {
            tokenValue = `{${variable.name.replace(/\//g, '.')}}`;
          } else {
            tokenValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
          }
        }
      } else if (firstModeValue === undefined || firstModeValue === null) {
        tokenValue = `{${variable.name.replace(/\//g, '.')}}`;
      } else {
        tokenValue = valueTransformer ? valueTransformer(firstModeValue) : String(firstModeValue);
      }

      return {
        name: normalizedName,
        value: tokenValue,
        type: tokenType,
      };
    }
  }

  let styleValue = style[propertyKey as keyof TextStyle];

  if (styleValue === undefined) {
    if (propertyKey === 'fontStyle' || propertyKey === 'fontWeight') {
      styleValue = style.fontName?.style;
    } else if (propertyKey === 'fontFamily') {
      styleValue = style.fontName?.family;
    }
  }

  if (styleValue === undefined || styleValue === null) {
    return {
      name: `${defaultNamePrefix}.undefined`,
      value: 'undefined',
      type: tokenType,
    };
  }

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
