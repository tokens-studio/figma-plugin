/**
 * Comprehensive schema for all plugin settings
 * This file enumerates all user-editable settings with their metadata
 * for use in dynamic UI rendering and validation
 */

import { UpdateMode } from '@/constants/UpdateMode';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';

/**
 * Setting value types supported by the schema
 */
export enum SettingType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  ENUM = 'enum',
  OBJECT = 'object',
}

/**
 * Categories for organizing settings in the UI
 */
export enum SettingCategory {
  GENERAL = 'general',
  UI = 'ui',
  SYNC = 'sync',
  TOKENS = 'tokens',
  STYLES_AND_VARIABLES = 'styles_and_variables',
  EXPORT = 'export',
  ADVANCED = 'advanced',
}

/**
 * Metadata for a single setting
 */
export interface SettingMetadata<T = unknown> {
  /** Unique identifier for the setting */
  key: string;
  /** Human-readable label for the setting */
  label: string;
  /** Detailed description of what the setting does */
  description: string;
  /** The type of value this setting accepts */
  type: SettingType;
  /** Default value for the setting */
  defaultValue: T;
  /** Category for organizing settings in the UI */
  category: SettingCategory;
  /** For enum types, the available options */
  enumValues?: readonly T[];
  /** For enum types, labels for each option */
  enumLabels?: Record<string, string>;
  /** Redux store path (e.g., 'settings', 'uiState', 'tokenState') */
  storePath: 'settings' | 'uiState' | 'tokenState';
  /** Whether this setting is stored in plugin-side storage */
  persistedInPlugin: boolean;
  /** Whether this setting is visible in the UI (some are internal) */
  visibleInUI: boolean;
  /** Validation function (optional) */
  validate?: (value: T) => boolean;
  /** Additional constraints (optional) */
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Type-safe setting definitions
 */
export type SettingDefinitions = {
  [K: string]: SettingMetadata;
};

/**
 * Complete settings schema
 * This is the single source of truth for all plugin settings
 */
export const SETTINGS_SCHEMA: SettingDefinitions = {
  // UI Settings
  'uiWindow.width': {
    key: 'uiWindow.width',
    label: 'Window Width',
    description: 'Width of the plugin window in pixels',
    type: SettingType.NUMBER,
    defaultValue: 400,
    category: SettingCategory.UI,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: false,
    constraints: { min: 300 },
  },
  'uiWindow.height': {
    key: 'uiWindow.height',
    label: 'Window Height',
    description: 'Height of the plugin window in pixels',
    type: SettingType.NUMBER,
    defaultValue: 600,
    category: SettingCategory.UI,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: false,
    constraints: { min: 200 },
  },
  'uiWindow.isMinimized': {
    key: 'uiWindow.isMinimized',
    label: 'Window Minimized',
    description: 'Whether the plugin window is minimized',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.UI,
    storePath: 'settings',
    persistedInPlugin: false,
    visibleInUI: false,
  },

  // General Settings
  language: {
    key: 'language',
    label: 'Language',
    description: 'Interface language for the plugin',
    type: SettingType.ENUM,
    defaultValue: 'en',
    category: SettingCategory.GENERAL,
    enumValues: ['en', 'es', 'fr', 'hi', 'nl', 'zh'] as const,
    enumLabels: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      hi: 'हिन्दी',
      nl: 'Nederlands',
      zh: '中文',
    },
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  sessionRecording: {
    key: 'sessionRecording',
    label: 'Session Recording',
    description: 'Enable session recording for debugging purposes (Sentry)',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Sync Settings
  updateMode: {
    key: 'updateMode',
    label: 'Update Mode',
    description: 'Scope of token updates: page, document, or selection',
    type: SettingType.ENUM,
    defaultValue: UpdateMode.SELECTION,
    category: SettingCategory.SYNC,
    enumValues: [UpdateMode.PAGE, UpdateMode.DOCUMENT, UpdateMode.SELECTION] as const,
    enumLabels: {
      [UpdateMode.PAGE]: 'Page',
      [UpdateMode.DOCUMENT]: 'Document',
      [UpdateMode.SELECTION]: 'Selection',
    },
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  updateRemote: {
    key: 'updateRemote',
    label: 'Update Remote',
    description: 'Whether to push changes to remote storage automatically',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.SYNC,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  updateOnChange: {
    key: 'updateOnChange',
    label: 'Update on Change',
    description: 'Automatically update tokens when changes are detected',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.SYNC,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Token Settings
  applyVariablesStylesOrRawValue: {
    key: 'applyVariablesStylesOrRawValue',
    label: 'Apply Variables/Styles or Raw Values',
    description: 'Choose whether to apply variables/styles or raw values to layers',
    type: SettingType.ENUM,
    defaultValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
    category: SettingCategory.TOKENS,
    enumValues: [
      ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      ApplyVariablesStylesOrRawValues.RAW_VALUES,
    ] as const,
    enumLabels: {
      [ApplyVariablesStylesOrRawValues.VARIABLES_STYLES]: 'Variables & Styles',
      [ApplyVariablesStylesOrRawValues.RAW_VALUES]: 'Raw Values',
    },
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  tokenType: {
    key: 'tokenType',
    label: 'Token Type',
    description: 'Format for storing tokens (object or array)',
    type: SettingType.ENUM,
    defaultValue: 'object',
    category: SettingCategory.TOKENS,
    enumValues: ['object', 'array'] as const,
    enumLabels: {
      object: 'Object',
      array: 'Array',
    },
    storePath: 'settings',
    persistedInPlugin: false,
    visibleInUI: true,
  },
  storeTokenIdInJsonEditor: {
    key: 'storeTokenIdInJsonEditor',
    label: 'Store Token ID in JSON Editor',
    description: 'Include token IDs in the JSON editor view',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.TOKENS,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  tokenFormat: {
    key: 'tokenFormat',
    label: 'Token Format',
    description: 'Token format standard (DTCG or Legacy)',
    type: SettingType.ENUM,
    defaultValue: TokenFormatOptions.Legacy,
    category: SettingCategory.TOKENS,
    enumValues: [TokenFormatOptions.DTCG, TokenFormatOptions.Legacy] as const,
    enumLabels: {
      [TokenFormatOptions.DTCG]: 'DTCG',
      [TokenFormatOptions.Legacy]: 'Legacy',
    },
    storePath: 'tokenState',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  autoApplyThemeOnDrop: {
    key: 'autoApplyThemeOnDrop',
    label: 'Auto Apply Theme on Drop',
    description: 'Automatically apply theme when dropped onto a layer',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.TOKENS,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Styles and Variables Export Settings
  ignoreFirstPartForStyles: {
    key: 'ignoreFirstPartForStyles',
    label: 'Ignore First Part for Styles',
    description: 'Ignore the first part of token names when creating styles',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.STYLES_AND_VARIABLES,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  prefixStylesWithThemeName: {
    key: 'prefixStylesWithThemeName',
    label: 'Prefix Styles with Theme Name',
    description: 'Add theme name as prefix to style names',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.STYLES_AND_VARIABLES,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  renameExistingStylesAndVariables: {
    key: 'renameExistingStylesAndVariables',
    label: 'Rename Existing Styles and Variables',
    description: 'Rename existing styles and variables to match token names',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.STYLES_AND_VARIABLES,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  removeStylesAndVariablesWithoutConnection: {
    key: 'removeStylesAndVariablesWithoutConnection',
    label: 'Remove Styles and Variables without Connection',
    description: 'Delete styles and variables that are not connected to tokens',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.STYLES_AND_VARIABLES,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  createStylesWithVariableReferences: {
    key: 'createStylesWithVariableReferences',
    label: 'Create Styles with Variable References',
    description: 'Create styles that reference variables instead of raw values',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.STYLES_AND_VARIABLES,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Export Options - Variables
  variablesColor: {
    key: 'variablesColor',
    label: 'Export Color Variables',
    description: 'Include color tokens when exporting as variables',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  variablesString: {
    key: 'variablesString',
    label: 'Export String Variables',
    description: 'Include string tokens when exporting as variables',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  variablesNumber: {
    key: 'variablesNumber',
    label: 'Export Number Variables',
    description: 'Include number tokens when exporting as variables',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  variablesBoolean: {
    key: 'variablesBoolean',
    label: 'Export Boolean Variables',
    description: 'Include boolean tokens when exporting as variables',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Export Options - Styles
  stylesColor: {
    key: 'stylesColor',
    label: 'Export Color Styles',
    description: 'Include color tokens when exporting as styles',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  stylesTypography: {
    key: 'stylesTypography',
    label: 'Export Typography Styles',
    description: 'Include typography tokens when exporting as styles',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  stylesEffect: {
    key: 'stylesEffect',
    label: 'Export Effect Styles',
    description: 'Include effect tokens when exporting as styles',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.EXPORT,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // Advanced Settings
  inspectDeep: {
    key: 'inspectDeep',
    label: 'Inspect Deep',
    description: 'Enable deep inspection of nested elements',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  shouldSwapStyles: {
    key: 'shouldSwapStyles',
    label: 'Should Swap Styles',
    description: 'Swap existing styles when applying tokens',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  shouldUpdateStyles: {
    key: 'shouldUpdateStyles',
    label: 'Should Update Styles',
    description: 'Update existing styles when token values change',
    type: SettingType.BOOLEAN,
    defaultValue: false,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  baseFontSize: {
    key: 'baseFontSize',
    label: 'Base Font Size',
    description: 'Base font size for rem calculations',
    type: SettingType.STRING,
    defaultValue: defaultBaseFontSize,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },
  aliasBaseFontSize: {
    key: 'aliasBaseFontSize',
    label: 'Alias Base Font Size',
    description: 'Alias reference for base font size',
    type: SettingType.STRING,
    defaultValue: defaultBaseFontSize,
    category: SettingCategory.ADVANCED,
    storePath: 'settings',
    persistedInPlugin: true,
    visibleInUI: true,
  },

  // UI State Settings (stored in uiState, not settings)
  showEmptyGroups: {
    key: 'showEmptyGroups',
    label: 'Show Empty Groups',
    description: 'Display token groups even when they are empty',
    type: SettingType.BOOLEAN,
    defaultValue: true,
    category: SettingCategory.UI,
    storePath: 'uiState',
    persistedInPlugin: true,
    visibleInUI: true,
  },
} as const;

/**
 * Helper function to get settings by category
 */
export function getSettingsByCategory(category: SettingCategory): SettingMetadata[] {
  return Object.values(SETTINGS_SCHEMA).filter((setting) => setting.category === category);
}

/**
 * Helper function to get all setting keys
 */
export function getAllSettingKeys(): string[] {
  return Object.keys(SETTINGS_SCHEMA);
}

/**
 * Helper function to get setting metadata by key
 */
export function getSettingMetadata(key: string): SettingMetadata | undefined {
  return SETTINGS_SCHEMA[key];
}

/**
 * Helper function to get default values for all settings
 */
export function getDefaultSettings(): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  Object.entries(SETTINGS_SCHEMA).forEach(([key, metadata]) => {
    defaults[key] = metadata.defaultValue;
  });
  return defaults;
}

/**
 * Helper function to validate a setting value
 */
export function validateSetting(key: string, value: unknown): boolean {
  const metadata = SETTINGS_SCHEMA[key];
  if (!metadata) {
    return false;
  }

  // Type validation
  const valueType = typeof value;
  switch (metadata.type) {
    case SettingType.BOOLEAN:
      if (valueType !== 'boolean') return false;
      break;
    case SettingType.STRING:
      if (valueType !== 'string') return false;
      break;
    case SettingType.NUMBER:
      if (valueType !== 'number') return false;
      // Check constraints
      if (metadata.constraints) {
        const numValue = value as number;
        if (metadata.constraints.min !== undefined && numValue < metadata.constraints.min) {
          return false;
        }
        if (metadata.constraints.max !== undefined && numValue > metadata.constraints.max) {
          return false;
        }
      }
      break;
    case SettingType.ENUM:
      if (metadata.enumValues && !metadata.enumValues.includes(value as never)) {
        return false;
      }
      break;
    default:
      break;
  }

  // Custom validation
  if (metadata.validate && !metadata.validate(value)) {
    return false;
  }

  return true;
}

/**
 * Type representing all setting keys
 */
export type SettingKey = keyof typeof SETTINGS_SCHEMA;

/**
 * Type representing all setting values
 */
export type SettingValues = {
  [K in SettingKey]: typeof SETTINGS_SCHEMA[K]['defaultValue'];
};
