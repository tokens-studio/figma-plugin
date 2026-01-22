import { ActiveExportTabProperty } from '@/figmaStorage';

export async function getActiveExportTab(): Promise<'useThemes' | 'useSets' | null> {
  const activeExportTab = await ActiveExportTabProperty.read();
  return activeExportTab;
}
