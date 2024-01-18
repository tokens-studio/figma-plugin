import { TokenTypes } from '@/constants/TokenTypes';
import { TokenTextCaseValue } from '../values';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleTextCaseToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.TEXT_CASE, TokenTextCaseValue, Named, P>;
