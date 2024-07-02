import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import { isSingleBoxShadowValue } from '@/utils/is';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { effectStyleMatchesBoxShadowToken } from './figmaUtils/styleMatchers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

export async function applyShadowValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
  baseFontSize: string,
) {
  if ('effects' in node && typeof values.boxShadow !== 'undefined' && data.boxShadow) {
    const resolvedToken = defaultTokenValueRetriever.get(data.boxShadow);
    if (!resolvedToken) return;
    let matchingStyleId = resolvedToken?.styleId;

    // Note: We should remove "backup style id" logic from here (this part). This was relevant before we had Themes, where style ids could not be saved to a token yet.
    if (!matchingStyleId) {
      if (isSingleBoxShadowValue(values.boxShadow)) {
        const styleIdBackupKey = 'effectStyleId_original';
        const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'effects');
        if (nonLocalStyle) {
          if (effectStyleMatchesBoxShadowToken(nonLocalStyle, values.boxShadow, baseFontSize)) {
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
    }

    if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'effect', matchingStyleId)))) {
      if (isSingleBoxShadowValue(values.boxShadow)) {
        setEffectValuesOnTarget(node, data.boxShadow, baseFontSize);
      }
    }
  }
}
