import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { isPartOfInstance } from '@/utils/is/isPartOfInstance';
import { transformValue } from './helpers';

export async function applyPositionTokenOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies tokens for X & Y position
  if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && !isPartOfInstance(node.id)) {
    if (typeof values.x !== 'undefined' && isPrimitiveValue(values.x)) {
      const x = transformValue(String(values.x), 'dimension', baseFontSize);
      node.x = x;
    }
    if (typeof values.y !== 'undefined' && isPrimitiveValue(values.y)) {
      const y = transformValue(String(values.y), 'dimension', baseFontSize);
      node.y = y;
    }
  }
}
