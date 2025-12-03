import { SelectedExportSetsProperty } from '@/figmaStorage';
import { ExportTokenSet } from '@/types/ExportTokenSet';

export async function getSelectedExportSets(): Promise<ExportTokenSet[]> {
  const selectedExportSets = await SelectedExportSetsProperty.read();
  if (selectedExportSets) {
    return selectedExportSets;
  }
  return [];
}
