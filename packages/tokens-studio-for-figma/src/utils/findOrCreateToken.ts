import { StyleToCreateToken } from '@/types/payloads';
import { TokenTypes, ExportNumberVariablesTokenTypes } from '@/constants/TokenTypes';
import { normalizeVariableName } from './normalizeVariableName';

export function findOrCreateToken(
  style: TextStyle,
  propertyKey: string,
  value: string | number,
  tokenArray: StyleToCreateToken[],
  tokenType: TokenTypes,
  localVariables: Variable[],
): StyleToCreateToken | undefined {
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;

  // Always check for existing token by value first (to preserve existing naming conventions)
  const stringValue = String(value);
  const existingTokenByValue = tokenArray.find((token) => String(token.value) === stringValue);
  if (existingTokenByValue) {
    return existingTokenByValue;
  }

  // Check for bound variables
  if (boundVariables?.[propertyKey]?.id) {
    const variable = localVariables.find((v) => v.id === boundVariables[propertyKey]?.id);
    if (variable) {
      const normalizedName = normalizeVariableName(variable.name);

      // Look for existing token by variable name
      const existingTokenByName = tokenArray.find((token) => token.name === normalizedName);
      if (existingTokenByName) {
        return existingTokenByName;
      }

      // Create new token with variable name and resolved value
      // Preserve numeric values for appropriate token types
      const finalValue = ExportNumberVariablesTokenTypes.includes(tokenType) && typeof value === 'number'
        ? value
        : String(value);

      const newToken = {
        name: normalizedName,
        value: finalValue,
        type: tokenType,
      };
      tokenArray.push(newToken);
      return newToken;
    }
  }

  // No bound variable or variable not found - look for existing token by value
  const existingToken = tokenArray.find((token) => String(token.value) === stringValue);
  if (existingToken) {
    return existingToken;
  }

  // Create new token with default naming
  // Preserve numeric values for appropriate token types
  const finalValue = ExportNumberVariablesTokenTypes.includes(tokenType) && typeof value === 'number'
    ? value
    : stringValue;

  // Generate unique token name based on existing tokens count
  const existingTokensCount = tokenArray.length;
  const newToken = {
    name: `${tokenType.toLowerCase()}.${existingTokensCount}`,
    value: finalValue,
    type: tokenType,
  };
  tokenArray.push(newToken);
  return newToken;
}
