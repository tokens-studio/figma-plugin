import { ActiveThemeProperty } from '@/figmaStorage';

export async function getActiveTheme(): Promise<string | null> {
  const activeTheme = await ActiveThemeProperty.read();
  if (activeTheme) {
    return activeTheme;
  }
  return null;
}
