import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';
export declare type SingleOpacityToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.OPACITY, string, Named, P>;
