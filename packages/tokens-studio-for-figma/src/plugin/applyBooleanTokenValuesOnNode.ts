import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

export async function applyBooleanTokenValuesOnNode(node: BaseNode, data: NodeTokenRefMap, values: MapValuesToTokensResult, baseFontSize: string) {
  if ('visible' in node && typeof values.visibility === 'string' && typeof data.visibility !== 'undefined') {
    if (!(await tryApplyVariableId(node, 'visible', data.visibility))) {
      if (values.visibility === 'true') {
        node.visible = true;
      } else if (values.visibility === 'false') {
        node.visible = false;
      }
    }
  }
}
