import { SettingsState } from '../app/store/models/settings';
import { transformValue } from '@/plugin/helpers';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { VariableToken } from '@/plugin/updateVariables';
import { ThemeObject } from '@/types';

export function mapTokensToVariableInfo(token: ResolveTokenValuesResult, theme: ThemeObject, settings: SettingsState) {
  return {
    ...token,
    value: (typeof token.value === 'string' || typeof token.value === 'number') ? transformValue(token.value, token.type, settings?.baseFontSize, true) : token.value,
    path: token.name.split('.').join('/'),
    variableId: theme.$figmaVariableReferences?.[token.name] ?? '',
  } as VariableToken;
}
