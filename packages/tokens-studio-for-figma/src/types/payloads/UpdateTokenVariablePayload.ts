import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '../tokens';
import { ColorModifier } from '../Modifier';

export type UpdateTokenVariablePayload = {
  parent: string;
  name: string;
  type: TokenTypes;
  value: SingleToken['value'] | number | null;
  rawValue?: SingleToken['value'];
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: ColorModifier
    }
  };
  description?: string;
  initialName?: string;
};
