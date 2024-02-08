import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { isPartOfInstance } from '@/utils/is/isPartOfInstance';
import { transformValue } from './helpers';
import { rotateNode } from './rotateNode';

export async function applyRotationValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies tokens to control layer rotation
  if (
    node.type !== 'DOCUMENT'
    && node.type !== 'PAGE'
    && typeof values.rotation !== 'undefined'
    && !isPartOfInstance(node.id)
    && isPrimitiveValue(values.rotation)
  ) {
    const rotation = transformValue(String(values.rotation), 'rotation', baseFontSize);
    rotateNode(node, rotation);
  }
}
