import { TokenTypes } from '@/constants/TokenTypes';
import { TokenCompositionValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleCompositionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COMPOSITION, (
  TokenCompositionValue | TokenCompositionValue[]
), Named, P>;
