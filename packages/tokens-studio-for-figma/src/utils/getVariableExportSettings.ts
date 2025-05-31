import { VariableExportSettingsProperty } from '@/figmaStorage';

export async function getVariableExportSettings(): Promise<Record<string, boolean>> {
  const variableExportSettings = await VariableExportSettingsProperty.read();
  if (variableExportSettings) {
    return variableExportSettings;
  }
  return {};
}
