import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { isPrimitiveValue } from '@/utils/is';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { transformValue } from './helpers';

export async function applyBorderRadiusValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if (
    node.type !== 'CONNECTOR' // need to exclude these layers as their cornerRadius in not editable
    && node.type !== 'SHAPE_WITH_TEXT' // need to exclude these layers as their cornerRadius in not editable
  ) {
    if (
      typeof values.borderRadius !== 'undefined'
      && typeof data.borderRadius !== 'undefined'
      && isPrimitiveValue(values.borderRadius)
    ) {
      const individualBorderRadius = String(values.borderRadius).split(' ');
      switch (individualBorderRadius.length) {
        case 1:
          if ('cornerRadius' in node) {
            if (
              !(
                (await tryApplyVariableId(node, 'topLeftRadius', data.borderRadius))
                && (await tryApplyVariableId(node, 'topRightRadius', data.borderRadius))
                && (await tryApplyVariableId(node, 'bottomRightRadius', data.borderRadius))
                && (await tryApplyVariableId(node, 'bottomLeftRadius', data.borderRadius))
              )
            ) {
              node.cornerRadius = transformValue(String(values.borderRadius), 'borderRadius', baseFontSize);
            }
          }
          break;
        case 2:
          if ('topLeftRadius' in node) {
            node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
            node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
            node.bottomRightRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
            node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
          }
          break;
        case 3:
          if ('topLeftRadius' in node) {
            node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
            node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
            node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius', baseFontSize);
            node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
          }
          break;
        case 4:
          if ('topLeftRadius' in node) {
            node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
            node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
            node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius', baseFontSize);
            node.bottomLeftRadius = transformValue(String(individualBorderRadius[3]), 'borderRadius', baseFontSize);
          }
          break;
        default:
          break;
      }
    }
    if (
      'topLeftRadius' in node
      && typeof values.borderRadiusTopLeft !== 'undefined'
      && typeof data.borderRadiusTopLeft !== 'undefined'
      && isPrimitiveValue(values.borderRadiusTopLeft)
    ) {
      if (!(await tryApplyVariableId(node, 'topLeftRadius', data.borderRadiusTopLeft))) {
        node.topLeftRadius = transformValue(String(values.borderRadiusTopLeft), 'borderRadius', baseFontSize);
      }
    }
    if (
      'topRightRadius' in node
      && typeof values.borderRadiusTopRight !== 'undefined'
      && typeof data.borderRadiusTopRight !== 'undefined'
      && isPrimitiveValue(values.borderRadiusTopRight)
    ) {
      if (!(await tryApplyVariableId(node, 'topRightRadius', data.borderRadiusTopRight))) {
        node.topRightRadius = transformValue(String(values.borderRadiusTopRight), 'borderRadius', baseFontSize);
      }
    }
    if (
      'bottomRightRadius' in node
      && typeof values.borderRadiusBottomRight !== 'undefined'
      && typeof data.borderRadiusBottomRight !== 'undefined'
      && isPrimitiveValue(values.borderRadiusBottomRight)
    ) {
      if (!(await tryApplyVariableId(node, 'bottomRightRadius', data.borderRadiusBottomRight))) {
        node.bottomRightRadius = transformValue(String(values.borderRadiusBottomRight), 'borderRadius', baseFontSize);
      }
    }
    if (
      'bottomLeftRadius' in node
      && typeof values.borderRadiusBottomLeft !== 'undefined'
      && typeof data.borderRadiusBottomLeft !== 'undefined'
      && isPrimitiveValue(values.borderRadiusBottomLeft)
    ) {
      if (!(await tryApplyVariableId(node, 'bottomLeftRadius', data.borderRadiusBottomLeft))) {
        node.bottomLeftRadius = transformValue(String(values.borderRadiusBottomLeft), 'borderRadius', baseFontSize);
      }
    }
  }
}
