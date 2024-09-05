import type { SingleToken } from './tokens';

export interface DeepTokensMap<Named extends boolean> {
  [K: string]: SingleToken<Named> | DeepTokensMap<Named>
}
