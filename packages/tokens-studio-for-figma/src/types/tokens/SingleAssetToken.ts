import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleAssetToken<Named extends boolean = true, P = unknown> = SingleGenericToken<TokenTypes.ASSET, string, Named, P>;
