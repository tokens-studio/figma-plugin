import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '../tokens';

export type DuplicateTokenPayload = {
  parent: string;
  type: TokenTypes;
  newName: string;
  value: SingleToken['value'];
  description?: string;
  oldName?: string;
  shouldUpdate?: boolean;
};
