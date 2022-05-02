import { SingleToken } from './SingleToken';

export type AnyTokenSet<Named extends boolean = true> = Record<string, SingleToken<Named>>;
