import { SingleToken } from './SingleToken';

export interface DeepKeyTokenMap extends Record<string, DeepKeyTokenMap | SingleToken> {
}
