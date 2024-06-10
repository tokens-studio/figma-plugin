import { isPrimitiveValue, isSingleTypographyValue } from '@/utils/is';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { textStyleMatchesTypographyToken } from './figmaUtils/styleMatchers';
import { setTextValuesOnTarget } from './setTextValuesOnTarget';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';
import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';

export async function applyTypographyTokenOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if (!(node.type === 'TEXT')) return;
  if (values.typography && data.typography) {
    const resolvedToken = defaultTokenValueRetriever.get(data.typography);
    let matchingStyleId = resolvedToken.styleId;

    // Note: We should remove "backup style id" logic from here (this part). This was relevant before we had Themes, where style ids could not be saved to a token yet.
    if (!matchingStyleId && isSingleTypographyValue(resolvedToken.value)) {
      const styleIdBackupKey = 'textStyleId_original';
      const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'typography');
      if (nonLocalStyle) {
        if (textStyleMatchesTypographyToken(nonLocalStyle, resolvedToken.value, baseFontSize)) {
          // Non-local style matches - use this and clear style id backup:
          matchingStyleId = nonLocalStyle.id;
          clearStyleIdBackup(node, styleIdBackupKey);
        } else if (resolvedToken.adjustedTokenName === nonLocalStyle.name) {
          // Non-local style does NOT match, but style name and token path does,
          // so we assume selected token value is an override (e.g. dark theme)
          // Now backup up style id before overwriting with raw token value, so we
          // can re-link the non-local style, when the token value matches again:
          setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
        }
      }
    }

    if (
      node.type === 'TEXT'
      && (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'text', matchingStyleId))))
    ) {
      if (isSingleTypographyValue(resolvedToken.value)) {
        setTextValuesOnTarget(node, data.typography, baseFontSize);
      }
    }
  }
  if (
    values.fontFamilies
    || values.fontWeights
    || values.lineHeights
    || values.fontSizes
    || values.letterSpacing
    || values.paragraphSpacing
    || values.textCase
    || values.textDecoration
  ) {
    const valueObject = {
      fontFamily: isPrimitiveValue(data.fontFamilies) ? String(data.fontFamilies.startsWith('{') ? data.fontFamilies : `{${data.fontFamilies}}`) : undefined,
      fontWeight: isPrimitiveValue(data.fontWeights) ? String(data.fontWeights.startsWith('{') ? data.fontWeights : `{${data.fontWeights}}`) : undefined,
      lineHeight: isPrimitiveValue(data.lineHeights) ? String(data.lineHeights.startsWith('{') ? data.lineHeights : `{${data.lineHeights}}`) : undefined,
      fontSize: isPrimitiveValue(data.fontSizes) ? String(data.fontSizes.startsWith('{') ? data.fontSizes : `{${data.fontSizes}}`) : undefined,
      letterSpacing: isPrimitiveValue(data.letterSpacing) ? String(data.letterSpacing.startsWith('{') ? data.letterSpacing : `{${data.letterSpacing}}`) : undefined,
      paragraphSpacing: isPrimitiveValue(data.paragraphSpacing) ? String(data.paragraphSpacing.startsWith('{') ? data.paragraphSpacing : `{${data.paragraphSpacing}}`) : undefined,
      textCase: isPrimitiveValue(data.textCase) ? String(data.textCase.startsWith('{') ? data.textCase : `{${data.textCase}}`) : undefined,
      textDecoration: isPrimitiveValue(data.textDecoration) ? String(data.textDecoration.startsWith('{') ? data.textDecoration : `{${data.textDecoration}}`) : undefined,
    }
    const resolvedValueObject = {
      fontFamily: isPrimitiveValue(values.fontFamilies) ? String(values.fontFamilies) : undefined,
      fontWeight: isPrimitiveValue(values.fontWeights) ? String(values.fontWeights) : undefined,
      lineHeight: isPrimitiveValue(values.lineHeights) ? String(values.lineHeights) : undefined,
      fontSize: isPrimitiveValue(values.fontSizes) ? String(values.fontSizes) : undefined,
      letterSpacing: isPrimitiveValue(values.letterSpacing) ? String(values.letterSpacing) : undefined,
      paragraphSpacing: isPrimitiveValue(values.paragraphSpacing) ? String(values.paragraphSpacing) : undefined,
      textCase: isPrimitiveValue(values.textCase) ? String(values.textCase) : undefined,
      textDecoration: isPrimitiveValue(values.textDecoration) ? String(values.textDecoration) : undefined,
    };
    await tryApplyTypographyCompositeVariable({
      target: node,
      value: valueObject,
      resolvedValue: resolvedValueObject,
      baseFontSize,
    });
  }
}