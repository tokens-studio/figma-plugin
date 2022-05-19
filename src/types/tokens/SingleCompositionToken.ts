import { TokenTypes } from '@/constants/TokenTypes';
import { NodeTokenRefMap } from '../NodeTokenRefMap';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleCompositionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COMPOSITION, NodeTokenRefMap, Named, P>;
