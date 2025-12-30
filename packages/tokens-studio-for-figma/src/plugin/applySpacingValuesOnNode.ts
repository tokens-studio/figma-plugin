import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applySpacingValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies spacing type tokens
  if (
    'paddingLeft' in node
    && typeof values.spacing !== 'undefined'
    && typeof data.spacing !== 'undefined'
    && isPrimitiveValue(values.spacing)
  ) {
    const individualSpacing = String(values.spacing).split(' ');
    const spacing = transformValue(String(values.spacing), 'spacing', baseFontSize);
    switch (individualSpacing.length) {
      case 1:
        if (
          !(
            (await tryApplyVariableId(node, 'paddingLeft', data.spacing))
            && (await tryApplyVariableId(node, 'paddingRight', data.spacing))
            && (await tryApplyVariableId(node, 'paddingTop', data.spacing))
            && (await tryApplyVariableId(node, 'paddingBottom', data.spacing))
          )
        ) {
          node.paddingLeft = spacing;
          node.paddingRight = spacing;
          node.paddingTop = spacing;
          node.paddingBottom = spacing;
        }
        break;
      case 2:
        node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
        node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
        node.paddingBottom = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
        node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
        break;
      case 3:
        node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
        node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
        node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing', baseFontSize);
        node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
        break;
      case 4:
        node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
        node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
        node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing', baseFontSize);
        node.paddingLeft = transformValue(String(individualSpacing[3]), 'spacing', baseFontSize);
        break;
      default:
        break;
    }
  }
  if (
    'paddingLeft' in node
    && typeof values.horizontalPadding !== 'undefined'
    && typeof data.horizontalPadding !== 'undefined'
    && isPrimitiveValue(values.horizontalPadding)
  ) {
    if (
      !(
        (await tryApplyVariableId(node, 'paddingLeft', data.horizontalPadding))
        && (await tryApplyVariableId(node, 'paddingRight', data.horizontalPadding))
      )
    ) {
      const horizontalPadding = transformValue(String(values.horizontalPadding), 'spacing', baseFontSize);
      node.paddingLeft = horizontalPadding;
      node.paddingRight = horizontalPadding;
    }
  }
  if (
    'paddingTop' in node
    && typeof values.verticalPadding !== 'undefined'
    && typeof data.verticalPadding !== 'undefined'
    && isPrimitiveValue(values.verticalPadding)
  ) {
    if (
      !(
        (await tryApplyVariableId(node, 'paddingTop', data.verticalPadding))
        && (await tryApplyVariableId(node, 'paddingBottom', data.verticalPadding))
      )
    ) {
      const verticalPadding = transformValue(String(values.verticalPadding), 'spacing', baseFontSize);
      node.paddingTop = verticalPadding;
      node.paddingBottom = verticalPadding;
    }
  }

  if (
    'itemSpacing' in node
    && typeof values.itemSpacing !== 'undefined'
    && typeof data.itemSpacing !== 'undefined'
    && isPrimitiveValue(values.itemSpacing)
  ) {
    const itemSpacingValue = String(values.itemSpacing);

    if (itemSpacingValue === 'AUTO') {
      // Set alignment to SPACE_BETWEEN for AUTO spacing
      node.primaryAxisAlignItems = 'SPACE_BETWEEN';
      // Don't set itemSpacing when using AUTO
    } else {
      // FIX: When switching from AUTO to a non-AUTO value, reset alignment to MIN
      if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
        node.primaryAxisAlignItems = 'MIN';
      }

      // Apply the actual spacing value
      if (!(await tryApplyVariableId(node, 'itemSpacing', data.itemSpacing))) {
        node.itemSpacing = transformValue(itemSpacingValue, 'spacing', baseFontSize);
      }
    }
  }

  if (
    'counterAxisSpacing' in node
    && typeof values.counterAxisSpacing !== 'undefined'
    && typeof data.counterAxisSpacing !== 'undefined'
    && isPrimitiveValue(values.counterAxisSpacing)
  ) {
    if (!(await tryApplyVariableId(node, 'counterAxisSpacing', data.counterAxisSpacing))) {
      node.counterAxisSpacing = transformValue(String(values.counterAxisSpacing), 'spacing', baseFontSize);
    }
  }

  if (
    'paddingTop' in node
    && typeof values.paddingTop !== 'undefined'
    && typeof data.paddingTop !== 'undefined'
    && isPrimitiveValue(values.paddingTop)
  ) {
    if (!(await tryApplyVariableId(node, 'paddingTop', data.paddingTop))) {
      node.paddingTop = transformValue(String(values.paddingTop), 'spacing', baseFontSize);
    }
  }
  if (
    'paddingRight' in node
    && typeof values.paddingRight !== 'undefined'
    && typeof data.paddingRight !== 'undefined'
    && isPrimitiveValue(values.paddingRight)
  ) {
    if (!(await tryApplyVariableId(node, 'paddingRight', data.paddingRight))) {
      node.paddingRight = transformValue(String(values.paddingRight), 'spacing', baseFontSize);
    }
  }

  if (
    'paddingBottom' in node
    && typeof values.paddingBottom !== 'undefined'
    && typeof data.paddingBottom !== 'undefined'
    && isPrimitiveValue(values.paddingBottom)
  ) {
    if (!(await tryApplyVariableId(node, 'paddingBottom', data.paddingBottom))) {
      node.paddingBottom = transformValue(String(values.paddingBottom), 'spacing', baseFontSize);
    }
  }

  if (
    'paddingLeft' in node
    && typeof values.paddingLeft !== 'undefined'
    && typeof data.paddingLeft !== 'undefined'
    && isPrimitiveValue(values.paddingLeft)
  ) {
    if (!(await tryApplyVariableId(node, 'paddingLeft', data.paddingLeft))) {
      node.paddingLeft = transformValue(String(values.paddingLeft), 'spacing', baseFontSize);
    }
  }
}
