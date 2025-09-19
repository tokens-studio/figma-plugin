import { StyleToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';
import { normalizeVariableName } from './normalizeVariableName';

export function findOrCreateToken(
  style: TextStyle,
  propertyKey: string,
  value: string,
  tokenArray: StyleToCreateToken[],
  tokenType: TokenTypes,
  localVariables: Variable[],
): StyleToCreateToken | undefined {
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;

  // Check for bound variables first
  if (boundVariables?.[propertyKey]?.id) {
    const variable = localVariables.find((v) => v.id === boundVariables[propertyKey]?.id);
    if (variable) {
      const normalizedName = normalizeVariableName(variable.name);

      // Look for existing token
      const existingToken = tokenArray.find((token) => token.name === normalizedName);
      if (existingToken) {
        return existingToken;
      }

      // Create new token with variable name and resolved value
      const newToken = {
        name: normalizedName,
        value,
        type: tokenType,
      };
      tokenArray.push(newToken);
      return newToken;
    }
  }

  // Always create a token (no bound variable or variable not found)
  // Look for existing token by value first
  const existingToken = tokenArray.find((token) => token.value === value);
  if (existingToken) {
    return existingToken;
  }

  // Create new token with default naming
  const newToken = {
    name: `${tokenType.toLowerCase()}.0`,
    value,
    type: tokenType,
  };
  tokenArray.push(newToken);
  return newToken;
}
