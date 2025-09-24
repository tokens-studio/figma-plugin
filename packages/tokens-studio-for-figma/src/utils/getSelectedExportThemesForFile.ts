import { FileExportPreferencesProperty } from '@/figmaStorage';

export async function getSelectedExportThemesForFile(fileKey: string): Promise<string[]> {
  const preferences = await FileExportPreferencesProperty.read(fileKey);
  return preferences.selectedExportThemes || [];
}

export async function setSelectedExportThemesForFile(fileKey: string, selectedThemes: string[]): Promise<void> {
  await FileExportPreferencesProperty.update(fileKey, {
    selectedExportThemes: selectedThemes,
  });
}
