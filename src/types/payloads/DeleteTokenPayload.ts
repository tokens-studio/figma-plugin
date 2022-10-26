import { TokenTypes } from '@/constants/TokenTypes';

export type DeleteTokenPayload = {
  parent: string;
  path: string;
  type?: TokenTypes;
};
