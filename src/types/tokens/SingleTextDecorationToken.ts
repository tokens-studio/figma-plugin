import { TokenTypes } from '@/constants/TokenTypes';
import { TokenTextDecorationValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleTextDecorationToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.TEXT_DECORATION, TokenTextDecorationValue, Named>;
