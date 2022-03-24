import { TokenTypes } from '@/constants/TokenTypes';

export type SingleGenericToken<T extends TokenTypes, V = string, Named extends boolean = true> = {
  type: T;
  value: V;
  description?: string;
  oldDescription?: string;
  oldValue?: V;
} & (Named extends true ? {
  name: string;
} : {
  name?: string;
});
