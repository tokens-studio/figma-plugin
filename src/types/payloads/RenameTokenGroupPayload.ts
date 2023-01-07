import { TokenTypes } from '@/constants/TokenTypes';

export type RenameTokenGroupPayload = {
  parent: string;
  oldName: string;
  newName: string;
  type?: TokenTypes;
};
