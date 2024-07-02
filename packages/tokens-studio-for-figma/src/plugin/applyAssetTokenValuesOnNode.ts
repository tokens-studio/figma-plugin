import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import setImageValuesOnTarget from './setImageValuesOnTarget';

export async function applyAssetTokenValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
) {
  if (values.asset && typeof values.asset === 'string' && 'fills' in node) {
    await setImageValuesOnTarget(node, { value: values.asset });
  }
}
