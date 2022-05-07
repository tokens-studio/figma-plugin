import { SingleToken } from './SingleToken';

export type ImportToken<Named extends boolean = true> = SingleToken<Named, {
  oldValue?: string;
  oldDescription?: string;
}>;
