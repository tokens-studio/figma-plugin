import { SettingsState } from '../app/store/models/settings';
import { transformValue } from '@/plugin/helpers';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { VariableToken } from '@/plugin/updateVariables';
import { ThemeObject } from '@/types';
import { convertTokenNameToPath } from './convertTokenNameToPath';

export function mapTokensToVariableInfo(token: ResolveTokenValuesResult, theme: ThemeObject, settings: SettingsState) {
  const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
  const path = convertTokenNameToPath(token.name, null, slice);

  return {
    ...token,
    value: typeof token.value === 'string' ? transformValue(token.value, token.type, settings?.baseFontSize) : token.value,
    path,
    variableId: theme.$figmaVariableReferences?.[token.name] ?? '',
  } as VariableToken;
}
