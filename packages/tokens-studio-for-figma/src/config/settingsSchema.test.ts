/**
 * Tests for the settings schema
 * Ensures all plugin settings are enumerated and properly configured
 */

import {
  SETTINGS_SCHEMA,
  SettingType,
  SettingCategory,
  getAllSettingKeys,
  getSettingsByCategory,
  getSettingMetadata,
  getDefaultSettings,
  validateSetting,
} from './settingsSchema';
import { UpdateMode } from '@/constants/UpdateMode';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';

describe('settingsSchema', () => {
  describe('Schema Completeness', () => {
    it('should include all settings from SettingsState interface', () => {
      // These are the settings defined in src/app/store/models/settings.tsx
      const expectedSettingsStateKeys = [
        'language',
        'uiWindow.width',
        'uiWindow.height',
        'uiWindow.isMinimized',
        'updateMode',
        'updateRemote',
        'updateOnChange',
        'applyVariablesStylesOrRawValue',
        'tokenType',
        'inspectDeep',
        'shouldSwapStyles',
        'shouldUpdateStyles',
        'baseFontSize',
        'aliasBaseFontSize',
        'sessionRecording',
        'storeTokenIdInJsonEditor',
        'variablesColor',
        'variablesString',
        'variablesNumber',
        'variablesBoolean',
        'stylesColor',
        'stylesTypography',
        'stylesEffect',
        'ignoreFirstPartForStyles',
        'prefixStylesWithThemeName',
        'createStylesWithVariableReferences',
        'renameExistingStylesAndVariables',
        'removeStylesAndVariablesWithoutConnection',
        'autoApplyThemeOnDrop',
      ];

      const allKeys = getAllSettingKeys();
      expectedSettingsStateKeys.forEach((key) => {
        expect(allKeys).toContain(key);
      });
    });

    it('should include settings from SavedSettings (plugin-side storage)', () => {
      // These are additional settings in src/plugin/notifiers.ts SavedSettings type
      const expectedSavedSettingsKeys = [
        'language',
        'sessionRecording',
        'uiWindow.width',
        'uiWindow.height',
        'showEmptyGroups',
        'updateMode',
        'updateRemote',
        'updateOnChange',
        'applyVariablesStylesOrRawValue',
        'shouldUpdateStyles',
        'variablesColor',
        'variablesNumber',
        'variablesString',
        'variablesBoolean',
        'stylesColor',
        'stylesTypography',
        'stylesEffect',
        'ignoreFirstPartForStyles',
        'createStylesWithVariableReferences',
        'prefixStylesWithThemeName',
        'renameExistingStylesAndVariables',
        'removeStylesAndVariablesWithoutConnection',
        'inspectDeep',
        'shouldSwapStyles',
        'baseFontSize',
        'aliasBaseFontSize',
        'storeTokenIdInJsonEditor',
        'tokenFormat',
        'autoApplyThemeOnDrop',
      ];

      const allKeys = getAllSettingKeys();
      expectedSavedSettingsKeys.forEach((key) => {
        expect(allKeys).toContain(key);
      });
    });

    it('should have metadata for every setting key', () => {
      const allKeys = getAllSettingKeys();
      allKeys.forEach((key) => {
        const metadata = getSettingMetadata(key);
        expect(metadata).toBeDefined();
        expect(metadata?.key).toBe(key);
      });
    });
  });

  describe('Setting Metadata Validation', () => {
    it('should have all required fields for each setting', () => {
      Object.entries(SETTINGS_SCHEMA).forEach(([key, metadata]) => {
        expect(metadata.key).toBe(key);
        expect(metadata.label).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.type).toBeDefined();
        expect(metadata.defaultValue).toBeDefined();
        expect(metadata.category).toBeDefined();
        expect(metadata.storePath).toBeDefined();
        expect(typeof metadata.persistedInPlugin).toBe('boolean');
        expect(typeof metadata.visibleInUI).toBe('boolean');
      });
    });

    it('should have enumValues and enumLabels for enum type settings', () => {
      Object.values(SETTINGS_SCHEMA).forEach((metadata) => {
        if (metadata.type === SettingType.ENUM) {
          expect(metadata.enumValues).toBeDefined();
          expect(Array.isArray(metadata.enumValues)).toBe(true);
          expect(metadata.enumValues!.length).toBeGreaterThan(0);
          expect(metadata.enumLabels).toBeDefined();
          expect(typeof metadata.enumLabels).toBe('object');
        }
      });
    });

    it('should have valid store paths', () => {
      const validStorePaths = ['settings', 'uiState', 'tokenState'];
      Object.values(SETTINGS_SCHEMA).forEach((metadata) => {
        expect(validStorePaths).toContain(metadata.storePath);
      });
    });

    it('should have valid categories', () => {
      const validCategories = Object.values(SettingCategory);
      Object.values(SETTINGS_SCHEMA).forEach((metadata) => {
        expect(validCategories).toContain(metadata.category);
      });
    });
  });

  describe('Default Values', () => {
    it('should have correct default values matching the Redux store', () => {
      expect(SETTINGS_SCHEMA['uiWindow.width'].defaultValue).toBe(400);
      expect(SETTINGS_SCHEMA['uiWindow.height'].defaultValue).toBe(600);
      expect(SETTINGS_SCHEMA['uiWindow.isMinimized'].defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.language.defaultValue).toBe('en');
      expect(SETTINGS_SCHEMA.sessionRecording.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.updateMode.defaultValue).toBe(UpdateMode.SELECTION);
      expect(SETTINGS_SCHEMA.updateRemote.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.updateOnChange.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.applyVariablesStylesOrRawValue.defaultValue).toBe(
        ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      );
      expect(SETTINGS_SCHEMA.tokenType.defaultValue).toBe('object');
      expect(SETTINGS_SCHEMA.ignoreFirstPartForStyles.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.prefixStylesWithThemeName.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.renameExistingStylesAndVariables.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.removeStylesAndVariablesWithoutConnection.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.createStylesWithVariableReferences.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.autoApplyThemeOnDrop.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.inspectDeep.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.shouldSwapStyles.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.shouldUpdateStyles.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.baseFontSize.defaultValue).toBe(defaultBaseFontSize);
      expect(SETTINGS_SCHEMA.aliasBaseFontSize.defaultValue).toBe(defaultBaseFontSize);
      expect(SETTINGS_SCHEMA.storeTokenIdInJsonEditor.defaultValue).toBe(false);
      expect(SETTINGS_SCHEMA.variablesColor.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.variablesString.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.variablesNumber.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.variablesBoolean.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.stylesColor.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.stylesTypography.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.stylesEffect.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.showEmptyGroups.defaultValue).toBe(true);
      expect(SETTINGS_SCHEMA.tokenFormat.defaultValue).toBe(TokenFormatOptions.Legacy);
    });

    it('should return all default values from getDefaultSettings', () => {
      const defaults = getDefaultSettings();
      const allKeys = getAllSettingKeys();

      expect(Object.keys(defaults)).toHaveLength(allKeys.length);
      allKeys.forEach((key) => {
        expect(defaults[key]).toEqual(SETTINGS_SCHEMA[key].defaultValue);
      });
    });
  });

  describe('Helper Functions', () => {
    it('should return settings grouped by category', () => {
      const generalSettings = getSettingsByCategory(SettingCategory.GENERAL);
      expect(generalSettings.length).toBeGreaterThan(0);
      generalSettings.forEach((setting) => {
        expect(setting.category).toBe(SettingCategory.GENERAL);
      });

      const uiSettings = getSettingsByCategory(SettingCategory.UI);
      expect(uiSettings.length).toBeGreaterThan(0);
      uiSettings.forEach((setting) => {
        expect(setting.category).toBe(SettingCategory.UI);
      });

      const exportSettings = getSettingsByCategory(SettingCategory.EXPORT);
      expect(exportSettings.length).toBeGreaterThan(0);
      exportSettings.forEach((setting) => {
        expect(setting.category).toBe(SettingCategory.EXPORT);
      });
    });

    it('should retrieve setting metadata by key', () => {
      const languageMeta = getSettingMetadata('language');
      expect(languageMeta).toBeDefined();
      expect(languageMeta?.key).toBe('language');
      expect(languageMeta?.type).toBe(SettingType.ENUM);

      const inspectDeepMeta = getSettingMetadata('inspectDeep');
      expect(inspectDeepMeta).toBeDefined();
      expect(inspectDeepMeta?.key).toBe('inspectDeep');
      expect(inspectDeepMeta?.type).toBe(SettingType.BOOLEAN);
    });

    it('should return undefined for non-existent setting keys', () => {
      const nonExistent = getSettingMetadata('nonExistentSetting');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Setting Validation', () => {
    it('should validate boolean settings correctly', () => {
      expect(validateSetting('inspectDeep', true)).toBe(true);
      expect(validateSetting('inspectDeep', false)).toBe(true);
      expect(validateSetting('inspectDeep', 'true')).toBe(false);
      expect(validateSetting('inspectDeep', 1)).toBe(false);
    });

    it('should validate string settings correctly', () => {
      expect(validateSetting('baseFontSize', '16px')).toBe(true);
      expect(validateSetting('baseFontSize', 16)).toBe(false);
      expect(validateSetting('baseFontSize', true)).toBe(false);
    });

    it('should validate number settings correctly', () => {
      expect(validateSetting('uiWindow.width', 400)).toBe(true);
      expect(validateSetting('uiWindow.width', 500)).toBe(true);
      expect(validateSetting('uiWindow.width', '400')).toBe(false);
    });

    it('should validate number settings with constraints', () => {
      // width minimum is 300
      expect(validateSetting('uiWindow.width', 300)).toBe(true);
      expect(validateSetting('uiWindow.width', 299)).toBe(false);

      // height minimum is 200
      expect(validateSetting('uiWindow.height', 200)).toBe(true);
      expect(validateSetting('uiWindow.height', 199)).toBe(false);
    });

    it('should validate enum settings correctly', () => {
      expect(validateSetting('updateMode', UpdateMode.PAGE)).toBe(true);
      expect(validateSetting('updateMode', UpdateMode.DOCUMENT)).toBe(true);
      expect(validateSetting('updateMode', UpdateMode.SELECTION)).toBe(true);
      expect(validateSetting('updateMode', 'invalid_mode')).toBe(false);

      expect(validateSetting('language', 'en')).toBe(true);
      expect(validateSetting('language', 'fr')).toBe(true);
      expect(validateSetting('language', 'invalid_language')).toBe(false);

      expect(validateSetting('tokenType', 'object')).toBe(true);
      expect(validateSetting('tokenType', 'array')).toBe(true);
      expect(validateSetting('tokenType', 'invalid_type')).toBe(false);
    });

    it('should return false for non-existent settings', () => {
      expect(validateSetting('nonExistentSetting', true)).toBe(false);
    });
  });

  describe('Categories Coverage', () => {
    it('should have settings in all categories', () => {
      const categories = Object.values(SettingCategory);
      categories.forEach((category) => {
        const settings = getSettingsByCategory(category);
        expect(settings.length).toBeGreaterThan(0);
      });
    });

    it('should have appropriate number of settings per category', () => {
      const uiSettings = getSettingsByCategory(SettingCategory.UI);
      expect(uiSettings.length).toBeGreaterThanOrEqual(1);

      const generalSettings = getSettingsByCategory(SettingCategory.GENERAL);
      expect(generalSettings.length).toBeGreaterThanOrEqual(1);

      const syncSettings = getSettingsByCategory(SettingCategory.SYNC);
      expect(syncSettings.length).toBeGreaterThanOrEqual(1);

      const tokenSettings = getSettingsByCategory(SettingCategory.TOKENS);
      expect(tokenSettings.length).toBeGreaterThanOrEqual(1);

      const exportSettings = getSettingsByCategory(SettingCategory.EXPORT);
      expect(exportSettings.length).toBeGreaterThanOrEqual(7); // 4 variables + 3 styles

      const stylesAndVariablesSettings = getSettingsByCategory(SettingCategory.STYLES_AND_VARIABLES);
      expect(stylesAndVariablesSettings.length).toBeGreaterThanOrEqual(1);

      const advancedSettings = getSettingsByCategory(SettingCategory.ADVANCED);
      expect(advancedSettings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Store Path Coverage', () => {
    it('should have settings for each store path', () => {
      const settingsInSettings = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.storePath === 'settings',
      );
      expect(settingsInSettings.length).toBeGreaterThan(0);

      const settingsInUiState = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.storePath === 'uiState',
      );
      expect(settingsInUiState.length).toBeGreaterThan(0);

      const settingsInTokenState = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.storePath === 'tokenState',
      );
      expect(settingsInTokenState.length).toBeGreaterThan(0);
    });

    it('should correctly map showEmptyGroups to uiState', () => {
      const showEmptyGroups = getSettingMetadata('showEmptyGroups');
      expect(showEmptyGroups?.storePath).toBe('uiState');
    });

    it('should correctly map tokenFormat to tokenState', () => {
      const tokenFormat = getSettingMetadata('tokenFormat');
      expect(tokenFormat?.storePath).toBe('tokenState');
    });
  });

  describe('Persistence Coverage', () => {
    it('should mark appropriate settings as persisted in plugin', () => {
      // Settings that should be persisted
      const persistedKeys = [
        'language',
        'sessionRecording',
        'updateMode',
        'updateRemote',
        'updateOnChange',
        'baseFontSize',
        'aliasBaseFontSize',
        'tokenFormat',
        'showEmptyGroups',
      ];

      persistedKeys.forEach((key) => {
        const metadata = getSettingMetadata(key);
        expect(metadata?.persistedInPlugin).toBe(true);
      });
    });

    it('should mark transient settings as not persisted', () => {
      // uiWindow.isMinimized is typically not persisted as it's a runtime state
      const isMinimized = getSettingMetadata('uiWindow.isMinimized');
      expect(isMinimized?.persistedInPlugin).toBe(false);
    });
  });

  describe('UI Visibility', () => {
    it('should mark user-facing settings as visible', () => {
      const visibleKeys = [
        'language',
        'updateMode',
        'updateRemote',
        'updateOnChange',
        'inspectDeep',
        'variablesColor',
        'stylesColor',
      ];

      visibleKeys.forEach((key) => {
        const metadata = getSettingMetadata(key);
        expect(metadata?.visibleInUI).toBe(true);
      });
    });

    it('should mark internal settings as not visible', () => {
      const internalKeys = ['uiWindow.width', 'uiWindow.height', 'uiWindow.isMinimized'];

      internalKeys.forEach((key) => {
        const metadata = getSettingMetadata(key);
        expect(metadata?.visibleInUI).toBe(false);
      });
    });
  });

  describe('Future Extensibility', () => {
    it('should be easy to add new settings', () => {
      // This test ensures the schema structure supports easy additions
      const totalSettings = getAllSettingKeys().length;
      expect(totalSettings).toBeGreaterThan(25); // Current count

      // Verify structure allows for iteration
      const categories = new Set(Object.values(SETTINGS_SCHEMA).map((s) => s.category));
      expect(categories.size).toBeGreaterThanOrEqual(6);
    });

    it('should support querying settings by multiple dimensions', () => {
      // By category
      const exportSettings = getSettingsByCategory(SettingCategory.EXPORT);
      expect(exportSettings.length).toBeGreaterThan(0);

      // By store path
      const settingsStoreSettings = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.storePath === 'settings',
      );
      expect(settingsStoreSettings.length).toBeGreaterThan(0);

      // By visibility
      const visibleSettings = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.visibleInUI === true,
      );
      expect(visibleSettings.length).toBeGreaterThan(0);

      // By persistence
      const persistedSettings = Object.values(SETTINGS_SCHEMA).filter(
        (s) => s.persistedInPlugin === true,
      );
      expect(persistedSettings.length).toBeGreaterThan(0);
    });
  });
});
