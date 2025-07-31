import { TokenTypes } from '@/constants/TokenTypes';
import { ColorModifier } from '../Modifier';
import { SingleToken } from '../tokens';

export type DuplicateTokenPayload = {
  parent: string;
  type: TokenTypes;
  newName: string;
  value: SingleToken['value'];
  description?: string;
  oldName?: string;
  shouldUpdate?: boolean;
  tokenSets: string[];
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: ColorModifier
    }
  }
};
