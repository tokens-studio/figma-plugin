import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, VariableScope } from '@/types/tokens';

export function convertTokenTypeToVariableType(type: TokenTypes, value: SingleToken['value'], scopes?: VariableScope[]): VariableResolvedDataType {
  // For numerical font weights we want to create a float variable
  if (type === TokenTypes.FONT_WEIGHTS && parseFloat(String(value))) {
    return 'FLOAT';
  }

  // If the token is a string token but has a font weight scope, we want to create a float variable if the value is a number
  if (scopes && scopes.includes('FONT_WEIGHT') && parseFloat(String(value))) {
    return 'FLOAT';
  }

  switch (type) {
    case TokenTypes.COLOR:
      return 'COLOR';
    case TokenTypes.BOOLEAN:
      return 'BOOLEAN';
    case TokenTypes.FONT_FAMILIES:
    case TokenTypes.FONT_WEIGHTS:
    case TokenTypes.TEXT:
      return 'STRING';
    default:
      return 'FLOAT';
  }
}
