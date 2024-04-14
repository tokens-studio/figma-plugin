import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

export function convertTokenTypeToVariableType(type: TokenTypes, value: SingleToken['value']): VariableResolvedDataType {
  if (type === TokenTypes.FONT_WEIGHTS && typeof value === 'number') {
    console.log('Converting', type, value, parseFloat(value));
    if (parseFloat(value)) {
      return 'FLOAT';
    }
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
