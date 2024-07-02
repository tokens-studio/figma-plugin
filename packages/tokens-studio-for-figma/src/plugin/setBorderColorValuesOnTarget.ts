import { trySetStyleId } from '@/utils/trySetStyleId';
import { paintStyleMatchesColorToken } from './figmaUtils/styleMatchers';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import { ColorPaintType, tryApplyColorVariableId } from '@/utils/tryApplyColorVariableId';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

type Props = {
  data: string;
  value: string;
  node: BaseNode;
};

export async function setBorderColorValuesOnTarget({
  data, value, node,
}: Props) {
  if ('strokes' in node) {
    if (!(await tryApplyColorVariableId(node, data, ColorPaintType.STROKES))) {
      const resolvedToken = defaultTokenValueRetriever.get(data);
      let matchingStyleId = resolvedToken?.styleId;
      if (resolvedToken && !matchingStyleId) {
        // Local style not found - look for matching non-local style:
        const styleIdBackupKey = 'strokeStyleId_original';
        const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'strokes');
        if (nonLocalStyle) {
          if (paintStyleMatchesColorToken(nonLocalStyle, value)) {
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

      if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'stroke', matchingStyleId)))) {
        setColorValuesOnTarget({
          target: node, token: data, key: 'strokes', givenValue: value,
        });
      }
    }
  }
}
