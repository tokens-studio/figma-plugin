import { MapValuesToTokensResult } from '@/types';
import setBorderValuesOnTarget from './setBorderValuesOnTarget';
import { isCompositeBorderValue } from '@/utils/is/isCompositeBorderValue';
import { setBorderColorValuesOnTarget } from './setBorderColorValuesOnTarget';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { getReferencedTokenName } from '@/utils/getReferencedTokenName';

const borderSides = [
  ['borderTop', 'top'],
  ['borderRight', 'right'],
  ['borderBottom', 'bottom'],
  ['borderLeft', 'left'],
] as const;

// Returns the name of the token a border token's width references (e.g. `{border.width.sm}`),
// so the width can be bound to that token's variable rather than set as a raw value.
function getBorderWidthTokenName(borderTokenName: string | undefined): string | undefined {
  if (!borderTokenName) return undefined;
  const resolvedValueWithReferences = defaultTokenValueRetriever.get(borderTokenName)?.resolvedValueWithReferences;
  if (resolvedValueWithReferences && typeof resolvedValueWithReferences === 'object' && 'width' in resolvedValueWithReferences) {
    return getReferencedTokenName(resolvedValueWithReferences.width);
  }
  return undefined;
}

export async function applyBorderValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  // Applies border composite tokens
  if (values.border && isCompositeBorderValue(values.border)) {
    await setBorderValuesOnTarget(node, { value: values.border }, baseFontSize);
  }
  for (const [property, side] of borderSides) {
    const value = values[property];
    if (value && isCompositeBorderValue(value)) {
      // eslint-disable-next-line no-await-in-loop
      await setBorderValuesOnTarget(node, { value }, baseFontSize, side, getBorderWidthTokenName(data[property]));
    }
  }

  // if applied border is just a string, it's the older version where border was just a color. apply color then.
  if (values.border && typeof values.border === 'string' && typeof data.border !== 'undefined') {
    await setBorderColorValuesOnTarget({
      node,
      data: data.border,
      value: values.border,
    });
  }

  // Applies border color
  if (typeof values.borderColor !== 'undefined' && typeof values.borderColor === 'string') {
    if ('strokes' in node && data.borderColor) {
      await setBorderColorValuesOnTarget({
        node,
        data: data.borderColor,
        value: values.borderColor,
      });
    }
  }
}
