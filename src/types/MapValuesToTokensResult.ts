import type { SingleToken } from './tokens';

export type MapValuesToTokensResult = Record<string, string | number | SingleToken['value'] | {
  property: string
  value?: SingleToken['value'];
}[]>;
