import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleTextToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.TEXT, string, Named, P>;
