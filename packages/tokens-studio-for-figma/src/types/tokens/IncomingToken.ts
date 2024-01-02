import { TokenTypes } from '@/constants/TokenTypes';
import { ColorModifier } from '../Modifier';

export type IncomingToken<V = string, DTCGSyntax extends boolean = false> = {
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: ColorModifier;
    },
  }
} & (DTCGSyntax extends true ? {
  $type?: TokenTypes | string;
  $value: V;
  $description?: string;
} : {
  type?: TokenTypes | string;
  value: V;
  description?: string;
});
