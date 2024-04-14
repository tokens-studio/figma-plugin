import { isPrimitiveValue, isSingleTypographyValue } from '@/utils/is';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { textStyleMatchesTypographyToken } from './figmaUtils/styleMatchers';
import { setTypographyCompositeValuesOnTarget } from './setTypographyCompositeValuesOnTarget';
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
        setTypographyCompositeValuesOnTarget(node, data.typography, baseFontSize);
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
      resolvedValue: valueObject,
      baseFontSize,
    });
  }
}
