import type { Properties } from '@/constants/Properties';
import type { TokenTypes } from '@/constants/TokenTypes';
import { NodeTokenRefValue } from './NodeTokenRefValue';

export type NodeTokenRefMap = Partial<
Record<TokenTypes, NodeTokenRefValue>
& Record<Properties, NodeTokenRefValue>
>;
