import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';
import { isAutoLayout } from '@/utils/isAutoLayout';
import { isPartOfInstance } from '@/utils/is/isPartOfInstance';

// Helper function to check if a node is a SceneNode
function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== 'DOCUMENT' && node.type !== 'PAGE';
}

// Helper function to handle full size (100%) values
function handleFullSizeValue(
  node: BaseNode,
  dimension: 'width' | 'height' | 'both',
  value: string,
  baseFontSize: string,
): boolean {
  if (String(value).trim() !== '100%') {
    return false; // Not a 100% value, let caller handle normally
  }

  // Handle auto layout case: set layoutAlign to STRETCH
  if ('layoutAlign' in node && node.parent && isSceneNode(node.parent) && isAutoLayout(node.parent)) {
    node.layoutAlign = 'STRETCH';
    return true;
  }

  // Handle regular layers: resize based on parent dimensions
  if (node.parent && 'resize' in node) {
    const { parent } = node;

    if (dimension === 'both' && 'width' in parent && 'height' in parent) {
      node.resize(parent.width, parent.height);
      return true;
    }

    if (dimension === 'width' && 'width' in parent) {
      node.resize(parent.width, node.height);
      return true;
    }

    if (dimension === 'height' && 'height' in parent) {
      node.resize(node.width, parent.height);
      return true;
    }
  }

  // Fallback: treat as regular sizing token
  if ('resize' in node) {
    const transformedValue = transformValue(value, 'sizing', baseFontSize);
    if (dimension === 'both') {
      node.resize(transformedValue, transformedValue);
    } else if (dimension === 'width') {
      node.resize(transformedValue, node.height);
    } else if (dimension === 'height') {
      node.resize(node.width, transformedValue);
    }
    return true;
  }

  return false;
}

export async function applySizingValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // SIZING: BOTH
  // When given just `size` we apply it to width and height
  if (
    'resize' in node
    && typeof values.sizing !== 'undefined'
    && typeof data.sizing !== 'undefined'
    && isPrimitiveValue(values.sizing)
    && !(
      (await tryApplyVariableId(node, 'width', data.sizing))
      && (await tryApplyVariableId(node, 'height', data.sizing))
    )
  ) {
    const sizingValue = String(values.sizing);
    // Try to handle as 100% value first
    if (!handleFullSizeValue(node, 'both', sizingValue, baseFontSize)) {
      // Regular sizing handling for non-100% values
      const transformedSize = transformValue(sizingValue, 'sizing', baseFontSize);
      node.resize(transformedSize, transformedSize);
    }
  }

  // SIZING: WIDTH
  if (
    'resize' in node
    && typeof values.width !== 'undefined'
    && typeof data.width !== 'undefined'
    && isPrimitiveValue(values.width)
    && !(await tryApplyVariableId(node, 'width', data.width))
  ) {
    const widthValue = String(values.width);
    // Try to handle as 100% value first
    if (!handleFullSizeValue(node, 'width', widthValue, baseFontSize)) {
      // Regular width handling for non-100% values
      const transformedWidth = transformValue(widthValue, 'sizing', baseFontSize);
      node.resize(transformedWidth, node.height);
    }
  }

  // SIZING: HEIGHT
  if (
    'resize' in node
    && typeof values.height !== 'undefined'
    && typeof data.height !== 'undefined'
    && isPrimitiveValue(values.height)
    && !(await tryApplyVariableId(node, 'height', data.height))
  ) {
    const heightValue = String(values.height);
    // Try to handle as 100% value first
    if (!handleFullSizeValue(node, 'height', heightValue, baseFontSize)) {
      // Regular height handling for non-100% values
      const transformedHeight = transformValue(heightValue, 'sizing', baseFontSize);
      node.resize(node.width, transformedHeight);
    }
  }

  // min width, max width, min height, max height only are applicable to autolayout frames or their direct children
  if (
    node.type !== 'DOCUMENT'
    && node.type !== 'PAGE'
    && !isPartOfInstance(node.id)
    && ((isSceneNode(node) && isAutoLayout(node))
      || (node.parent && isSceneNode(node.parent) && isAutoLayout(node.parent)))
  ) {
    // SIZING: MIN WIDTH
    if (
      'minWidth' in node
      && typeof values.minWidth !== 'undefined'
      && typeof data.minWidth !== 'undefined'
      && isPrimitiveValue(values.minWidth)
      && !(await tryApplyVariableId(node, 'minWidth', data.minWidth))
    ) {
      node.minWidth = transformValue(String(values.minWidth), 'sizing', baseFontSize);
    }

    // SIZING: MAX WIDTH
    if (
      'maxWidth' in node
      && typeof values.maxWidth !== 'undefined'
      && typeof data.maxWidth !== 'undefined'
      && isPrimitiveValue(values.maxWidth)
      && !(await tryApplyVariableId(node, 'maxWidth', data.maxWidth))
    ) {
      node.maxWidth = transformValue(String(values.maxWidth), 'sizing', baseFontSize);
    }

    // SIZING: MIN HEIGHT
    if (
      'minHeight' in node
      && typeof values.minHeight !== 'undefined'
      && typeof data.minHeight !== 'undefined'
      && isPrimitiveValue(values.minHeight)
      && !(await tryApplyVariableId(node, 'minHeight', data.minHeight))
    ) {
      node.minHeight = transformValue(String(values.minHeight), 'sizing', baseFontSize);
    }

    // SIZING: MAX HEIGHT
    if (
      'maxHeight' in node
      && typeof values.maxHeight !== 'undefined'
      && typeof data.maxHeight !== 'undefined'
      && isPrimitiveValue(values.maxHeight)
      && !(await tryApplyVariableId(node, 'maxHeight', data.maxHeight))
    ) {
      node.maxHeight = transformValue(String(values.maxHeight), 'sizing', baseFontSize);
    }
  }
}
