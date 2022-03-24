import { TokenTypes } from '@/constants/TokenTypes';
import { TokenTypograpyValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleTypographyToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.TYPOGRAPHY, TokenTypograpyValue, Named, P>;
