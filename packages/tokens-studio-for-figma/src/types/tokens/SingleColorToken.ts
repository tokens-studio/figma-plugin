import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleColorToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.COLOR, (
  string | string[]
), Named, P>;

export type SingleColorTokenInJSON = TokenInJSON<TokenTypes.COLOR, string | string[]>;
