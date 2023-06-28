import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '../tokens';

export type UpdateTokenVariablePayload = {
  parent: string;
  name: string;
  type: TokenTypes;
  value: SingleToken['value'] | number | null;
  rawValue?: SingleToken['value'];
};
