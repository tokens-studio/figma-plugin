import { TokenTypes } from '@/constants/TokenTypes';
import { CompositionTokenValue } from '../CompositionTokenProperty';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleCompositionToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COMPOSITION, CompositionTokenValue, Named, P>;
export type SingleCompositionTokenInJSON = TokenInJSON<TokenTypes.COMPOSITION, CompositionTokenValue | string>;
