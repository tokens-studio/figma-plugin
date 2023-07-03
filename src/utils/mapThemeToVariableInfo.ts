import { VariableInfo } from '@/app/components/ManageThemesModal/ThemeVariableManagementEntry';
import { ThemeObject } from '@/types';

export default function mapThemeToVariableInfo(theme: ThemeObject | null) {
  if (!theme) return {};
  return Object.entries(theme?.$figmaVariableReferences ?? {}).reduce<Record<string, VariableInfo>>((acc, [tokenName, variableId]) => {
    acc[tokenName] = {
      id: variableId,
      isResolved: false,
    };
    return acc;
  }, {});
}
