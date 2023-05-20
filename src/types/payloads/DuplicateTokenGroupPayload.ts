import { TokenTypes } from '@/constants/TokenTypes';

export type DuplicateTokenGroupPayload = {
  parent: string;
  oldName: string;
  newName: string;
  tokenSets: string[];
  type?: TokenTypes;
};
