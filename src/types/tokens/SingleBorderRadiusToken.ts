import { TokenTypes } from '@/constants/TokenTypes';
import { SingleGenericToken } from './SingleGenericToken';

export type SingleBorderRadiusToken<Named extends boolean = true> = SingleGenericToken<TokenTypes.BORDER_RADIUS, string, Named>;
