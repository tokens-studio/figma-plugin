import { TokenTypes } from '@/constants/TokenTypes';
import { DeepKeyTokenMap } from './DeepKeyTokenMap';
import { SingleToken } from './SingleToken';

export type TokenTypeSchema = {
  label: string;
  property: string;
  type: TokenTypes;
  explainer?: string;
  help?: string;
  schema: {
    value?: SingleToken['value']
    options?: {
      description?: string;
    }
  }
  values?: DeepKeyTokenMap,
};
