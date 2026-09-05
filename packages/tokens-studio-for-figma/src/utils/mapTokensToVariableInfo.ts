import { SettingsState } from '../app/store/models/settings';
import { transformValue } from '@/plugin/helpers';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { VariableToken } from '@/plugin/updateVariables';
import { ThemeObject } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';

export function mapTokensToVariableInfo(
  token: ResolveTokenValuesResult,
  theme: ThemeObject,
  settings: SettingsState,
  baseFontSize?: string,
) {
  // Use the provided baseFontSize (theme-specific) or fall back to settings.baseFontSize
  const effectiveBaseFontSize = baseFontSize || settings?.baseFontSize;

  // Duration/cubicBezier flow through TIMING/EASING setters that expect the
  // raw DTCG shape ("200ms", [x1,y1,x2,y2]); pre-transforming to ms/joined
  // numbers would double-convert. Pass their value through unchanged.
  const skipTransform = token.type === TokenTypes.DURATION || token.type === TokenTypes.CUBIC_BEZIER;

  return {
    ...token,
    value: (!skipTransform && (typeof token.value === 'string' || typeof token.value === 'number'))
      ? transformValue(String(token.value), token.type, effectiveBaseFontSize, true)
      : token.value,
    path: token.name.split('.').join('/'),
    variableId: theme.$figmaVariableReferences?.[token.name] ?? '',
  } as VariableToken;
}
