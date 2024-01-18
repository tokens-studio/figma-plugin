import { TokenTypes } from '@/constants/TokenTypes';

export function convertTokenTypeToVariableType(type: TokenTypes): VariableResolvedDataType {
  switch (type) {
    case TokenTypes.COLOR:
      return 'COLOR';
    case TokenTypes.BOOLEAN:
      return 'BOOLEAN';
    case TokenTypes.TEXT:
      return 'STRING';
    default:
      return 'FLOAT';
  }
}
