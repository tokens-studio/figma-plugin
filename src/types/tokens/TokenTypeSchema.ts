import { TokenTypes } from '@/constants/TokenTypes';

interface StringSchemaType { type: 'string' }
export interface ObjectSchemaType {
  type: 'object'
  properties: Record<string, StringSchemaType | ObjectSchemaType>
}

export type TokenTypeSchema = {
  label: string;
  property: string;
  type: TokenTypes;
  explainer?: string;
  help?: string;
  isPro?: boolean;
  schemas: {
    value: ObjectSchemaType;
  }
};
