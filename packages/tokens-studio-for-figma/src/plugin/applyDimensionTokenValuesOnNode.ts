import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applyDimensionTokenValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if (
    typeof values.dimension !== 'undefined'
    && typeof data.dimension !== 'undefined'
    && isPrimitiveValue(values.dimension)
  ) {
    if ('itemSpacing' in node) {
      if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
        node.primaryAxisAlignItems = 'MIN';
      }

      if (!(await tryApplyVariableId(node, 'itemSpacing', data.dimension))) {
        node.itemSpacing = transformValue(String(values.dimension), 'spacing', baseFontSize);
      }
    } else if ('resize' in node) {
      if (
        !(
          (await tryApplyVariableId(node, 'width', data.dimension))
          && (await tryApplyVariableId(node, 'height', data.dimension))
        )
      ) {
        const size = transformValue(String(values.dimension), 'sizing', baseFontSize);
        node.resize(size, size);
      }
    }
  }
}
