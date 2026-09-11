import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';
import { isAutoLayout } from '@/utils/isAutoLayout';

function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== 'DOCUMENT' && node.type !== 'PAGE';
}

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
        if (node.parent && isSceneNode(node.parent) && isAutoLayout(node.parent)) {
          if ('layoutSizingHorizontal' in node) {
            (node as SceneNode & { layoutSizingHorizontal: string }).layoutSizingHorizontal = 'FIXED';
          }
          if ('layoutSizingVertical' in node) {
            (node as SceneNode & { layoutSizingVertical: string }).layoutSizingVertical = 'FIXED';
          }
        }
        const size = transformValue(String(values.dimension), 'sizing', baseFontSize);
        node.resize(size, size);
      }
    }
  }
}
