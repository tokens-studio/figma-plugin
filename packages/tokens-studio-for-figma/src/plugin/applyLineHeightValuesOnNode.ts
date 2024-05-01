import { isPrimitiveValue } from '@/utils/is';
import { transformValue } from './helpers';
import setLineHeightValuesOnTarget from './setLineHeightValuesOnTarget';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';

export async function applyLineHeightValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if ('characters' in node && node.fontName !== figma.mixed) {
    await figma.loadFontAsync(node.fontName);
  }
  if (typeof values.lineHeights !== 'undefined' && isPrimitiveValue(values.lineHeights) && node.type === 'TEXT') {
    const transformedValue = transformValue(String(values.lineHeights), 'lineHeights', baseFontSize) as LineHeight;
    await setLineHeightValuesOnTarget(node, transformedValue);
  }
}
