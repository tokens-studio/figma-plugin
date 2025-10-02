# Plugin Settings Schema

## Overview

This directory contains the comprehensive enumeration of all plugin settings with their metadata. The schema serves as a single source of truth for all user-editable settings in the Tokens Studio for Figma plugin.

## Purpose

The settings schema was created to:

1. **Document all settings**: Provide a complete list of all plugin settings in one place
2. **Enable dynamic UI rendering**: Support automatic generation of settings UI components
3. **Ensure consistency**: Maintain consistency between Redux state, plugin storage, and UI
4. **Support extensibility**: Make it easy to add new settings without manual updates across multiple files
5. **Enable validation**: Provide runtime validation of setting values

## Files

### `settingsSchema.ts`

The main schema file that exports:

- **`SETTINGS_SCHEMA`**: Complete enumeration of all settings with metadata
- **`SettingMetadata`**: TypeScript interface defining the structure of setting metadata
- **`SettingType`**: Enum of supported setting value types (boolean, string, number, enum, object)
- **`SettingCategory`**: Enum for organizing settings into categories
- **Helper functions**: 
  - `getAllSettingKeys()`: Get all setting keys
  - `getSettingsByCategory(category)`: Get settings filtered by category
  - `getSettingMetadata(key)`: Get metadata for a specific setting
  - `getDefaultSettings()`: Get default values for all settings
  - `validateSetting(key, value)`: Validate a setting value

### `settingsSchema.test.ts`

Comprehensive test suite that ensures:

- All settings from `SettingsState` interface are included
- All settings from `SavedSettings` (plugin-side) are included
- Each setting has complete metadata
- Default values match those in the Redux store
- Helper functions work correctly
- Settings validation works properly
- Settings are properly categorized and organized

## Settings Categories

Settings are organized into the following categories:

1. **General** (`SettingCategory.GENERAL`): Language, session recording
2. **UI** (`SettingCategory.UI`): Window dimensions, empty group visibility
3. **Sync** (`SettingCategory.SYNC`): Update mode, remote sync, auto-update
4. **Tokens** (`SettingCategory.TOKENS`): Token format, type, ID storage, theme behavior
5. **Styles and Variables** (`SettingCategory.STYLES_AND_VARIABLES`): Style/variable naming, references, management
6. **Export** (`SettingCategory.EXPORT`): Variable and style export options
7. **Advanced** (`SettingCategory.ADVANCED`): Deep inspection, font sizes, style updates

## Setting Metadata Structure

Each setting includes the following metadata:

```typescript
{
  key: string;                    // Unique identifier
  label: string;                  // Human-readable label
  description: string;            // Detailed description
  type: SettingType;              // Value type (boolean, string, number, enum, object)
  defaultValue: T;                // Default value
  category: SettingCategory;      // Category for UI organization
  storePath: string;              // Redux store path (settings, uiState, tokenState)
  persistedInPlugin: boolean;     // Whether stored in plugin-side storage
  visibleInUI: boolean;           // Whether shown in UI
  enumValues?: readonly T[];      // For enum types, available options
  enumLabels?: Record<string, string>; // For enum types, option labels
  constraints?: {                 // Optional validation constraints
    min?: number;
    max?: number;
    pattern?: string;
  };
  validate?: (value: T) => boolean; // Optional custom validation
}
```

## Usage Examples

### Getting All Settings in a Category

```typescript
import { getSettingsByCategory, SettingCategory } from '@/config/settingsSchema';

const exportSettings = getSettingsByCategory(SettingCategory.EXPORT);
exportSettings.forEach(setting => {
  console.log(setting.key, setting.label, setting.defaultValue);
});
```

### Validating a Setting Value

```typescript
import { validateSetting } from '@/config/settingsSchema';

const isValid = validateSetting('uiWindow.width', 500);
// Returns true if valid, false otherwise
```

### Getting Default Values

```typescript
import { getDefaultSettings } from '@/config/settingsSchema';

const defaults = getDefaultSettings();
// Returns object with all default values keyed by setting name
```

### Dynamically Rendering Settings UI

```typescript
import { SETTINGS_SCHEMA, SettingType } from '@/config/settingsSchema';

Object.values(SETTINGS_SCHEMA).forEach(setting => {
  if (!setting.visibleInUI) return;
  
  switch (setting.type) {
    case SettingType.BOOLEAN:
      // Render checkbox
      break;
    case SettingType.ENUM:
      // Render dropdown with setting.enumValues
      break;
    case SettingType.STRING:
      // Render text input
      break;
    // ... etc
  }
});
```

## Enumerated Settings

The schema currently includes **31 settings** across all categories:

### Settings State (Redux `settings`)
- Window dimensions (width, height, isMinimized)
- Language
- Session recording
- Update mode, remote, on-change
- Apply variables/styles or raw values
- Token type
- Token ID storage
- Auto-apply theme on drop
- Base font sizes
- Style/variable management options
- Export options (7 boolean flags for variables and styles)
- Inspection and style update options

### UI State (Redux `uiState`)
- Show empty groups

### Token State (Redux `tokenState`)
- Token format (DTCG vs Legacy)

## Adding New Settings

To add a new setting:

1. Add the setting to the appropriate Redux model (`settings.tsx`, `uiState.tsx`, or `tokenState.tsx`)
2. Add the setting metadata to `SETTINGS_SCHEMA` in `settingsSchema.ts`
3. Run tests to ensure the new setting is properly enumerated: `yarn test settingsSchema.test.ts`
4. The new setting will automatically be discovered and available for dynamic rendering

## Testing

Run the test suite to verify all settings are properly enumerated:

```bash
yarn test settingsSchema.test.ts
```

The tests validate:
- Schema completeness (all Redux settings are included)
- Metadata completeness (all required fields present)
- Default value accuracy
- Helper function correctness
- Validation logic
- Category coverage
- Store path mapping

## Future Extensions

The schema is designed to be extensible for:

- **Conditional visibility**: Add `visibleWhen` conditions to show/hide settings based on other settings
- **Setting groups**: Add grouping metadata for better UI organization
- **Search/filter**: Enable searching settings by label, description, or category
- **Settings presets**: Define preset configurations for different use cases
- **Migration support**: Track setting schema versions for migration between plugin versions
- **Permissions**: Add permission levels for enterprise/team features
- **Localization**: Extend labels and descriptions with translation keys

## Related Files

- **Redux Store Models**:
  - `src/app/store/models/settings.tsx` - Main settings state
  - `src/app/store/models/uiState.tsx` - UI state (includes showEmptyGroups)
  - `src/app/store/models/tokenState.tsx` - Token state (includes tokenFormat)
  
- **Plugin Storage**:
  - `src/plugin/notifiers.ts` - Defines `SavedSettings` type for plugin-side storage
  - `src/utils/uiSettings.ts` - Functions for reading/writing plugin settings

- **Constants**:
  - `src/constants/UpdateMode.ts` - Update mode enum
  - `src/constants/ApplyVariablesStyleOrder.ts` - Variables/styles enum
  - `src/plugin/TokenFormatStoreClass.ts` - Token format enum
  - `src/constants/defaultBaseFontSize.ts` - Default font size constant
