import { isPrimitiveValue, isSingleTypographyValue } from '@/utils/is';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { textStyleMatchesTypographyToken } from './figmaUtils/styleMatchers';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';
import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';

function buildResolvedValueObject(data: any) {
  return {
    fontFamily: isPrimitiveValue(data.fontFamilies) ? String(data.fontFamilies.startsWith('{') ? data.fontFamilies : `{${data.fontFamilies}}`) : undefined,
    fontWeight: isPrimitiveValue(data.fontWeights) ? String(data.fontWeights.startsWith('{') ? data.fontWeights : `{${data.fontWeights}}`) : undefined,
    lineHeight: isPrimitiveValue(data.lineHeights) ? String(data.lineHeights.startsWith('{') ? data.lineHeights : `{${data.lineHeights}}`) : undefined,
    fontSize: isPrimitiveValue(data.fontSizes) ? String(data.fontSizes.startsWith('{') ? data.fontSizes : `{${data.fontSizes}}`) : undefined,
    letterSpacing: isPrimitiveValue(data.letterSpacing) ? String(data.letterSpacing.startsWith('{') ? data.letterSpacing : `{${data.letterSpacing}}`) : undefined,
    paragraphSpacing: isPrimitiveValue(data.paragraphSpacing) ? String(data.paragraphSpacing.startsWith('{') ? data.paragraphSpacing : `{${data.paragraphSpacing}}`) : undefined,
    textCase: isPrimitiveValue(data.textCase) ? String(data.textCase.startsWith('{') ? data.textCase : `{${data.textCase}}`) : undefined,
    textDecoration: isPrimitiveValue(data.textDecoration) ? String(data.textDecoration.startsWith('{') ? data.textDecoration : `{${data.textDecoration}}`) : undefined,
  };
}

function buildValueObject(values: any, resolvedToken: any) {
  const tokenValue = resolvedToken?.value || {};

  return {
    fontFamily: isPrimitiveValue(values.fontFamilies) ? String(values.fontFamilies) : tokenValue.fontFamily,
    fontWeight: isPrimitiveValue(values.fontWeights) ? String(values.fontWeights) : tokenValue.fontWeight,
    lineHeight: isPrimitiveValue(values.lineHeights) ? String(values.lineHeights) : tokenValue.lineHeight,
    fontSize: isPrimitiveValue(values.fontSizes) ? String(values.fontSizes) : tokenValue.fontSize,
    letterSpacing: isPrimitiveValue(values.letterSpacing) ? String(values.letterSpacing) : tokenValue.letterSpacing,
    paragraphSpacing: isPrimitiveValue(values.paragraphSpacing) ? String(values.paragraphSpacing) : tokenValue.paragraphSpacing,
    textCase: isPrimitiveValue(values.textCase) ? String(values.textCase) : tokenValue.textCase,
    textDecoration: isPrimitiveValue(values.textDecoration) ? String(values.textDecoration) : tokenValue.textDecoration,
  };
}

export async function applyTypographyTokenOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if (!(node.type === 'TEXT')) return;

  const resolvedToken = data.typography ? defaultTokenValueRetriever.get(data.typography) : null;
  let matchingStyleId = resolvedToken?.styleId;

  // Backup logic for non-local styles
  if (!matchingStyleId && resolvedToken && isSingleTypographyValue(resolvedToken.value)) {
    const styleIdBackupKey = 'textStyleId_original';
    const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'typography');
    if (nonLocalStyle && textStyleMatchesTypographyToken(nonLocalStyle, resolvedToken.value, baseFontSize)) {
      matchingStyleId = nonLocalStyle.id;
      clearStyleIdBackup(node, styleIdBackupKey);
    } else if (nonLocalStyle && resolvedToken.adjustedTokenName === nonLocalStyle?.name) {
      setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
    }
  }

  // Apply matching style or fallback to applying values
  if (matchingStyleId && (await trySetStyleId(node, 'text', matchingStyleId))) return;

  // Apply typography token directly if no other properties exist
  if (data.typography && resolvedToken && isSingleTypographyValue(resolvedToken.value) && !Object.keys(values).length) {
    setTextValuesOnTarget(node, data.typography, baseFontSize);
    return;
  }

  // Build the resolved value and value objects
  const resolvedValueObject = buildResolvedValueObject(data);
  const valueObject = buildValueObject(values, resolvedToken);

  // Apply the typography token and other values together
  await tryApplyTypographyCompositeVariable({
    target: node,
    value: valueObject,
    resolvedValue: resolvedValueObject,
    baseFontSize,
  });
}
