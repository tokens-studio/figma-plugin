import { TokenTypes } from '@/constants/TokenTypes';
import { TokenTypographyValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';
import { TokenInJSON } from '@/utils/convertTokens';

export type SingleTypographyToken<Named extends boolean = true, P = unknown> = SingleGenericToken<
TokenTypes.TYPOGRAPHY,
TokenTypographyValue | string,
Named,
P
>;

export type SingleTypographyTokenInJSON = TokenInJSON<TokenTypes.TYPOGRAPHY, TokenTypographyValue | string>;
