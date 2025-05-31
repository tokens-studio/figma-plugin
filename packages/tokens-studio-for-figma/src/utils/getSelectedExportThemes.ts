import { SelectedExportThemesProperty } from '@/figmaStorage';

export async function getSelectedExportThemes(): Promise<string[]> {
  const selectedExportThemes = await SelectedExportThemesProperty.read();
  if (selectedExportThemes) {
    return selectedExportThemes;
  }
  return [];
}
