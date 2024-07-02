import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import setBackgroundBlurOnTarget from './setBackgroundBlurOnTarget';

export async function applyBackgroundBlurValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if ('effects' in node && typeof values.backgroundBlur !== 'undefined' && isPrimitiveValue(values.backgroundBlur)) {
    setBackgroundBlurOnTarget(node, { value: String(values.backgroundBlur) }, baseFontSize);
  }
}
