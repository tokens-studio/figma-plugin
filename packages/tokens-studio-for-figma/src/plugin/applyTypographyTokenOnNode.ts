import { isPrimitiveValue, isSingleTypographyValue } from '@/utils/is';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { textStyleMatchesTypographyToken } from './figmaUtils/styleMatchers';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';
import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';

function formatValue(value: any): string | undefined {
  if (isPrimitiveValue(value)) {
    return String(value.startsWith('{') ? value : `{${value}}`);
  }
  return undefined;
}

function buildResolvedValueObject(resolvedToken: any, data: any) {
  return {
    fontFamily: formatValue(
      data.fontFamilies
        || resolvedToken?.rawValue?.fontFamilies
        || resolvedToken?.rawValue?.fontFamily,
    ),
    fontWeight: formatValue(
      data.fontWeights
        || resolvedToken?.rawValue?.fontWeights
        || resolvedToken?.rawValue?.fontWeight,
    ),
    lineHeight: formatValue(
      data.lineHeights
        || resolvedToken?.rawValue?.lineHeights
        || resolvedToken?.rawValue?.lineHeight,
    ),
    fontSize: formatValue(
      data.fontSizes || resolvedToken?.rawValue?.fontSizes || resolvedToken?.rawValue?.fontSize,
    ),
    letterSpacing: formatValue(data.letterSpacing || resolvedToken?.rawValue?.letterSpacing),
    paragraphSpacing: formatValue(data.paragraphSpacing || resolvedToken?.rawValue?.paragraphSpacing),
    paragraphIndent: formatValue(data.paragraphIndent || resolvedToken?.rawValue?.paragraphIndent),
    textCase: formatValue(data.textCase || resolvedToken?.rawValue?.textCase),
    textDecoration: formatValue(data.textDecoration || resolvedToken?.rawValue?.textDecoration),
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
    paragraphSpacing: isPrimitiveValue(values.paragraphSpacing)
      ? String(values.paragraphSpacing)
      : tokenValue.paragraphSpacing,
    paragraphIndent: isPrimitiveValue(values.paragraphIndent)
      ? String(values.paragraphIndent)
      : tokenValue.paragraphIndent,
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
  const resolvedValueObject = buildResolvedValueObject(resolvedToken, data);
  const valueObject = buildValueObject(values, resolvedToken);

  // Apply the typography token and other values together
  await tryApplyTypographyCompositeVariable({
    target: node,
    value: valueObject,
    resolvedValue: resolvedValueObject,
    baseFontSize,
  });
}
