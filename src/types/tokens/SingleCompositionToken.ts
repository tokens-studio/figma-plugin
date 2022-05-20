import { TokenTypes } from '@/constants/TokenTypes';
import { CompositionTokenValue } from '../CompositionTokenProperty';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleCompositionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COMPOSITION, CompositionTokenValue, Named, P>;
