import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applyNumberTokenValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if (typeof values.number !== 'undefined' && typeof data.number !== 'undefined' && isPrimitiveValue(values.number)) {
    if ('itemSpacing' in node) {
      if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
        node.primaryAxisAlignItems = 'MIN';
      }

      if (!(await tryApplyVariableId(node, 'itemSpacing', data.number))) {
        node.itemSpacing = transformValue(String(values.number), 'spacing', baseFontSize);
      }
    } else if ('resize' in node) {
      if (
        !(
          (await tryApplyVariableId(node, 'width', data.number))
          && (await tryApplyVariableId(node, 'height', data.number))
        )
      ) {
        const size = transformValue(String(values.number), 'sizing', baseFontSize);
        node.resize(size, size);
      }
    }
  }
}
