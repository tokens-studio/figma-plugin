import { TokenTypes } from '@/constants/TokenTypes';

export type DeleteTokenGroupPayload = {
  parent: string;
  path: string;
  type?: TokenTypes;
};
