import { SingleToken } from '../tokens';
import { TokenTypes } from '@/constants/TokenTypes';

export type VariableToCreateToken = {
  name: string
  value: SingleToken['value']
  oldValue?: SingleToken['value']
  type: TokenTypes
  parent: string, // collection name - is there a type for this?
  description?: string
  oldDescription?: string
  $extensions?: SingleToken['$extensions']
};

export type SetTokensFromVariablesPayload = Record<string, VariableToCreateToken[]>;
