import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';
import { isAutoLayout } from '@/utils/isAutoLayout';
import { isPartOfInstance } from '@/utils/is/isPartOfInstance';

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
    // Check if sizing is set to 100% for full width and height behavior
    if (String(values.sizing).trim() === '100%') {
      // Handle full width and height property
      if ('layoutAlign' in node && node.parent && isAutoLayout(node.parent)) {
        // If node is a child of an auto layout parent, set layoutAlign to STRETCH for both dimensions
        node.layoutAlign = 'STRETCH';
      } else if (node.parent && 'width' in node.parent && 'height' in node.parent) {
        // For regular layers, calculate size based on parent's dimensions
        node.resize(node.parent.width, node.parent.height);
      } else {
        // Fallback for nodes without applicable parent
        const size = transformValue(String(values.sizing), 'sizing', baseFontSize);
        node.resize(size, size);
      }
    } else {
      // Regular sizing handling for non-100% values
      const size = transformValue(String(values.sizing), 'sizing', baseFontSize);
      node.resize(size, size);
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
    // Check if width is set to 100% for full width behavior
    if (String(values.width).trim() === '100%') {
      // Handle full width property
      if ('layoutAlign' in node && node.parent && isAutoLayout(node.parent)) {
        // If node is a child of an auto layout parent, set layoutAlign to STRETCH
        node.layoutAlign = 'STRETCH';
      } else if (node.parent && 'width' in node.parent) {
        // For regular layers, calculate width based on parent's width
        node.resize(node.parent.width, node.height);
      } else {
        // Fallback for nodes without applicable parent
        node.resize(transformValue(String(values.width), 'sizing', baseFontSize), node.height);
      }
    } else {
      // Regular width handling for non-100% values
      node.resize(transformValue(String(values.width), 'sizing', baseFontSize), node.height);
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
    // Check if height is set to 100% for full height behavior
    if (String(values.height).trim() === '100%') {
      // Handle full height property
      if ('layoutAlign' in node && node.parent && isAutoLayout(node.parent)) {
        // If node is a child of an auto layout parent, set layoutAlign to STRETCH
        node.layoutAlign = 'STRETCH';
      } else if (node.parent && 'height' in node.parent) {
        // For regular layers, calculate height based on parent's height
        node.resize(node.width, node.parent.height);
      } else {
        // Fallback for nodes without applicable parent
        node.resize(node.width, transformValue(String(values.height), 'sizing', baseFontSize));
      }
    } else {
      // Regular height handling for non-100% values
      node.resize(node.width, transformValue(String(values.height), 'sizing', baseFontSize));
    }
  }

  // min width, max width, min height, max height only are applicable to autolayout frames or their direct children
  if (
    node.type !== 'DOCUMENT'
    && node.type !== 'PAGE'
    && !isPartOfInstance(node.id)
    && (isAutoLayout(node)
      || (node.parent && node.parent.type !== 'DOCUMENT' && node.parent.type !== 'PAGE' && isAutoLayout(node.parent)))
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
