import { SingleToken } from './SingleToken';

export type ImportToken = SingleToken & {
  oldValue?: string;
  oldDescription?: string;
};
