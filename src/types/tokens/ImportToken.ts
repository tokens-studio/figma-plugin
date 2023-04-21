import { SingleToken } from './SingleToken';

export type ImportToken<Named extends boolean = true> = SingleToken<Named, {
  importType?: 'NEW' | 'UPDATE' | 'REMOVE'
}>;
