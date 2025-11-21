import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

export async function applyBooleanTokenValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
) {
  if (
    'visible' in node
    && typeof values.visibility === 'string'
    && typeof data.visibility !== 'undefined'
    && !(await tryApplyVariableId(node, 'visible', data.visibility))
  ) {
    if (values.visibility === 'true') {
      node.visible = true;
    } else if (values.visibility === 'false') {
      node.visible = false;
    }
  }

  // Apply vertical trim (leadingTrim) to text nodes
  if (
    node.type === 'TEXT'
    && typeof values.verticalTrim === 'string'
    && typeof data.verticalTrim !== 'undefined'
    && !(await tryApplyVariableId(node, 'leadingTrim' as any, data.verticalTrim))
  ) {
    // Load the font before applying leadingTrim
    try {
      if (node.fontName !== figma.mixed) {
        await figma.loadFontAsync(node.fontName);
      }

      if (values.verticalTrim === 'true') {
        node.leadingTrim = 'CAP_HEIGHT';
      } else if (values.verticalTrim === 'false') {
        node.leadingTrim = 'NONE';
      }
    } catch (e) {
      console.error('Error applying vertical trim:', e);
    }
  }
}
