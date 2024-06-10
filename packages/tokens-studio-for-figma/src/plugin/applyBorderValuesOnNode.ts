import { MapValuesToTokensResult } from '@/types';
import setBorderValuesOnTarget from './setBorderValuesOnTarget';
import { isCompositeBorderValue } from '@/utils/is/isCompositeBorderValue';
import { setBorderColorValuesOnTarget } from './setBorderColorValuesOnTarget';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

export function applyBorderValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies border composite tokens
  if (values.border && isCompositeBorderValue(values.border)) {
    setBorderValuesOnTarget(node, { value: values.border }, baseFontSize);
  }
  if (values.borderTop && isCompositeBorderValue(values.borderTop)) {
    setBorderValuesOnTarget(node, { value: values.borderTop }, baseFontSize, 'top');
  }
  if (values.borderRight && isCompositeBorderValue(values.borderRight)) {
    setBorderValuesOnTarget(node, { value: values.borderRight }, baseFontSize, 'right');
  }
  if (values.borderBottom && isCompositeBorderValue(values.borderBottom)) {
    setBorderValuesOnTarget(node, { value: values.borderBottom }, baseFontSize, 'bottom');
  }
  if (values.borderLeft && isCompositeBorderValue(values.borderLeft)) {
    setBorderValuesOnTarget(node, { value: values.borderLeft }, baseFontSize, 'left');
  }

  // if applied border is just a string, it's the older version where border was just a color. apply color then.
  if (values.border && typeof values.border === 'string' && typeof data.border !== 'undefined') {
    setBorderColorValuesOnTarget({
      node,
      data: data.border,
      value: values.border,
    });
  }

  // Applies border color
  if (typeof values.borderColor !== 'undefined' && typeof values.borderColor === 'string') {
    if ('strokes' in node && data.borderColor) {
      setBorderColorValuesOnTarget({
        node,
        data: data.borderColor,
        value: values.borderColor,
      });
    }
  }
}
