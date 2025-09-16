import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applyBorderWidthValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies border width tokens
  if (
    'strokeWeight' in node
    && typeof values.borderWidth !== 'undefined'
    && typeof data.borderWidth !== 'undefined'
    && isPrimitiveValue(values.borderWidth)
  ) {
    // Check if node has individual stroke weight properties (like RECTANGLE, FRAME)
    const hasIndividualStrokeWeights = 'strokeTopWeight' in node
      && 'strokeRightWeight' in node
      && 'strokeBottomWeight' in node
      && 'strokeLeftWeight' in node;

    let variableApplied = false;

    if (hasIndividualStrokeWeights) {
      // For nodes with individual stroke weight properties, try to apply to all four sides
      // Have to set it individually as Figma does the same, hence the strokeWeight would never be set
      variableApplied = (
        (await tryApplyVariableId(node, 'strokeTopWeight', data.borderWidth))
        && (await tryApplyVariableId(node, 'strokeRightWeight', data.borderWidth))
        && (await tryApplyVariableId(node, 'strokeBottomWeight', data.borderWidth))
        && (await tryApplyVariableId(node, 'strokeLeftWeight', data.borderWidth))
      );
    } else {
      // For nodes without individual stroke weight properties (like ELLIPSE), apply to strokeWeight directly
      variableApplied = await tryApplyVariableId(node, 'strokeWeight', data.borderWidth);
    }

    if (!variableApplied) {
      node.strokeWeight = transformValue(String(values.borderWidth), 'borderWidth', baseFontSize);
    }
  }

  if (
    'strokeTopWeight' in node
    && typeof values.borderWidthTop !== 'undefined'
    && typeof data.borderWidthTop !== 'undefined'
    && !(await tryApplyVariableId(node, 'strokeTopWeight', data.borderWidthTop))
  ) {
    node.strokeTopWeight = transformValue(String(values.borderWidthTop), 'borderWidthTop', baseFontSize);
  }

  if (
    'strokeRightWeight' in node
    && typeof values.borderWidthRight !== 'undefined'
    && typeof data.borderWidthRight !== 'undefined'
    && !(await tryApplyVariableId(node, 'strokeRightWeight', data.borderWidthRight))
  ) {
    node.strokeRightWeight = transformValue(String(values.borderWidthRight), 'borderWidthRight', baseFontSize);
  }

  if (
    'strokeBottomWeight' in node
    && typeof values.borderWidthBottom !== 'undefined'
    && typeof data.borderWidthBottom !== 'undefined'
    && !(await tryApplyVariableId(node, 'strokeBottomWeight', data.borderWidthBottom))
  ) {
    node.strokeBottomWeight = transformValue(String(values.borderWidthBottom), 'borderWidthBottom', baseFontSize);
  }

  if (
    'strokeLeftWeight' in node
    && typeof values.borderWidthLeft !== 'undefined'
    && typeof data.borderWidthLeft !== 'undefined'
    && !(await tryApplyVariableId(node, 'strokeLeftWeight', data.borderWidthLeft))
  ) {
    node.strokeLeftWeight = transformValue(String(values.borderWidthLeft), 'borderWidthLeft', baseFontSize);
  }
}
