import { ColorPaintType, tryApplyColorVariableId } from '@/utils/tryApplyColorVariableId';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import { paintStyleMatchesColorToken } from './figmaUtils/styleMatchers';
import { trySetStyleId } from '@/utils/trySetStyleId';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MapValuesToTokensResult } from '@/types';

export async function applyColorTokenOnNode(node: BaseNode, data: NodeTokenRefMap, values: MapValuesToTokensResult) {
  const tokenName = data.fill;
  const tokenValue = values.fill;
  if (
    tokenValue
    && typeof tokenValue === 'string'
    && 'fills' in node
    && tokenName
    && !(await tryApplyColorVariableId(node, tokenName, ColorPaintType.FILLS))
  ) {
    const resolvedToken = defaultTokenValueRetriever.get(tokenName);
    let matchingStyleId = resolvedToken?.styleId;

    // Note: We should remove "backup style id" logic from here (this part). This was relevant before we had Themes, where style ids could not be saved to a token yet.
    if (!matchingStyleId) {
      const styleIdBackupKey = 'fillStyleId_original';
      const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'fills');
      if (nonLocalStyle) {
        if (paintStyleMatchesColorToken(nonLocalStyle, resolvedToken?.value)) {
          // Non-local style matches - use this and clear style id backup:
          matchingStyleId = nonLocalStyle.id;
          clearStyleIdBackup(node, styleIdBackupKey);
        } else if (resolvedToken?.adjustedTokenName === nonLocalStyle.name) {
          // Non-local style does NOT match, but style name and token path does,
          // so we assume selected token value is an override (e.g. dark theme)
          // Now backup up style id before overwriting with raw token value, so we
          // can re-link the non-local style, when the token value matches again:
          setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
        }
      }
    }

    if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'fill', matchingStyleId)))) {
      setColorValuesOnTarget({
        target: node, token: tokenName, key: 'fills', givenValue: tokenValue,
      });
    }
  }
}
