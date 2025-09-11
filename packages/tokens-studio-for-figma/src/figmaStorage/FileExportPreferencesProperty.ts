import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';

export interface FileExportPreferences extends Record<PropertyKey, unknown> {
  selectedExportThemes?: string[];
  // These export settings from the settings model
  variablesColor?: boolean;
  variablesString?: boolean;
  variablesNumber?: boolean;
  variablesBoolean?: boolean;
  stylesColor?: boolean;
  stylesTypography?: boolean;
  stylesEffect?: boolean;
  ignoreFirstPartForStyles?: boolean;
  prefixStylesWithThemeName?: boolean;
  createStylesWithVariableReferences?: boolean;
  renameExistingStylesAndVariables?: boolean;
  removeStylesAndVariablesWithoutConnection?: boolean;
}

export class FileExportPreferencesProperty {
  private static createStorageProperty(fileKey: string) {
    return new FigmaStorageProperty<FileExportPreferences>(
      FigmaStorageType.SHARED_PLUGIN_DATA,
      `${SharedPluginDataNamespaces.TOKENS}/fileExportPreferences/${fileKey}`,
      (value) => JSON.stringify(value),
      (value) => attemptOrFallback<FileExportPreferences>(() => (
        value ? JSON.parse(value) : {}
      ), {}),
    );
  }

  static async read(fileKey: string): Promise<FileExportPreferences> {
    const storage = this.createStorageProperty(fileKey);
    return await storage.read() || {};
  }

  static async write(fileKey: string, preferences: FileExportPreferences): Promise<void> {
    const storage = this.createStorageProperty(fileKey);
    await storage.write(preferences);
  }

  static async update(fileKey: string, partialPreferences: Partial<FileExportPreferences>): Promise<void> {
    const currentPreferences = await this.read(fileKey);
    const updatedPreferences = { ...currentPreferences, ...partialPreferences };
    await this.write(fileKey, updatedPreferences);
  }
}
