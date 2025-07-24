import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applyOpacityValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies opacity tokens to control layer opacity
  if (
    'opacity' in node
    && typeof values.opacity !== 'undefined'
    && typeof data.opacity !== 'undefined'
    && isPrimitiveValue(values.opacity)
    && !(await tryApplyVariableId(node, 'opacity', data.opacity))
  ) {
    node.opacity = transformValue(String(values.opacity), 'opacity', baseFontSize);
  }
}
