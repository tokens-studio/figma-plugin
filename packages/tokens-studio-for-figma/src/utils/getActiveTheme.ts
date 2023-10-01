import { ActiveThemeProperty } from '@/figmaStorage';

export async function getActiveTheme(): Promise<string | Record<string, string>> {
  const activeTheme = await ActiveThemeProperty.read();
  if (activeTheme) {
    return activeTheme;
  }
  return {};
}
