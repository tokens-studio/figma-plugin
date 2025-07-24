import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

export function convertTokenTypeToVariableType(type: TokenTypes, value: SingleToken['value']): VariableResolvedDataType {
  // For numerical font weights we want to create a float variable
  if (type === TokenTypes.FONT_WEIGHTS && parseFloat(String(value))) {
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
