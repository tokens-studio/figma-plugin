import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { matchStyleName } from '@/utils/matchStyleName';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { paintStyleMatchesColorToken } from './figmaUtils/styleMatchers';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import setColorValuesOnTarget from './setColorValuesOnTarget';

type Props = {
  data: string;
  value: string;
  node: BaseNode;
  stylePathPrefix: string | null;
  stylePathSlice: number;
  styleReferences: Record<string, string>;
  paintStyles: Map<string, EffectStyle | PaintStyle | TextStyle>
};

export async function setBorderColorValuesOnTarget({
  data, value, node, stylePathPrefix = null, stylePathSlice, styleReferences, paintStyles,
}: Props) {
  const pathname = convertTokenNameToPath(data, stylePathPrefix, stylePathSlice);
  let matchingStyleId = matchStyleName(
    data,
    pathname,
    styleReferences,
    paintStyles,
  );

  if (!matchingStyleId) {
    // Local style not found - look for matching non-local style:
    const styleIdBackupKey = 'strokeStyleId_original';
    const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'strokes');
    if (nonLocalStyle) {
      if (paintStyleMatchesColorToken(nonLocalStyle, value)) {
        // Non-local style matches - use this and clear style id backup:
        matchingStyleId = nonLocalStyle.id;
        clearStyleIdBackup(node, styleIdBackupKey);
      } else if (pathname === nonLocalStyle.name) {
        // Non-local style does NOT match, but style name and token path does,
        // so we assume selected token value is an override (e.g. dark theme)
        // Now backup up style id before overwriting with raw token value, so we
        // can re-link the non-local style, when the token value matches again:
        setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
      }
    }
  }

  if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'stroke', matchingStyleId)))) {
    setColorValuesOnTarget(node, { value }, 'strokes');
  }
}
