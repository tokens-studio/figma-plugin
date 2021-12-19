import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

export function hasTokens(map: NodeTokenRefMap) {
  return Object.values(map).some((value) => !!value);
}
