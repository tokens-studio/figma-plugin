import { SettingsState } from '../app/store/models/settings';
import { transformValue } from '@/plugin/helpers';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { VariableToken } from '@/plugin/updateVariables';
import { ThemeObject } from '@/types';

export function mapTokensToVariableInfo(
  token: ResolveTokenValuesResult,
  theme: ThemeObject,
  settings: SettingsState,
  baseFontSize?: string,
) {
  // Use the provided baseFontSize (theme-specific) or fall back to settings.baseFontSize
  const effectiveBaseFontSize = baseFontSize || settings?.baseFontSize;

  return {
    ...token,
    value: (typeof token.value === 'string' || typeof token.value === 'number') ? transformValue(String(token.value), token.type, effectiveBaseFontSize, true) : token.value,
    path: token.name.split('.').join('/'),
    variableId: theme.$figmaVariableReferences?.[token.name] ?? '',
  } as VariableToken;
}
