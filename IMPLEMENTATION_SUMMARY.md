# Export Settings Persistence Implementation

## Overview
This implementation adds persistent storage for the variable export settings in the ManageStylesAndVariables component. When users change the theme/set selection and tab preferences, these settings are now saved to the document's shared plugin data and restored when the plugin is reloaded.

## Changes Made

### 1. Added New Shared Plugin Data Key
- **File**: `packages/tokens-studio-for-figma/src/constants/SharedPluginDataKeys.ts`
- **Change**: Added `exportSettings: 'exportSettings'` key to store export preferences

### 2. Created ExportSettingsProperty
- **File**: `packages/tokens-studio-for-figma/src/figmaStorage/ExportSettingsProperty.ts`
- **Purpose**: Handles reading/writing export settings to shared plugin data
- **Interface**: 
  ```typescript
  interface ExportSettings {
    selectedThemes: string[];
    selectedSets: ExportTokenSet[];
    activeTab: 'useThemes' | 'useSets';
  }
  ```

### 3. Updated Figma Storage Index
- **File**: `packages/tokens-studio-for-figma/src/figmaStorage/index.ts`
- **Change**: Added export for `ExportSettingsProperty`

### 4. Enhanced Startup Function
- **File**: `packages/tokens-studio-for-figma/src/utils/plugin/startup.ts`
- **Change**: Added `ExportSettingsProperty.read()` to load export settings on plugin startup

### 5. Added Redux State Management
- **File**: `packages/tokens-studio-for-figma/src/app/store/models/uiState.tsx`
- **Changes**:
  - Added `ExportSettings` interface to UI state
  - Added `exportSettings` property to UIState
  - Added `setExportSettings` reducer
  - Added effect to save settings to shared plugin data via async message

### 6. Created Export Settings Selector
- **File**: `packages/tokens-studio-for-figma/src/selectors/exportSettingsSelector.ts`
- **Purpose**: Provides access to export settings from Redux state

### 7. Added Async Message Support
- **File**: `packages/tokens-studio-for-figma/src/types/AsyncMessages.ts`
- **Changes**:
  - Added `SET_EXPORT_SETTINGS` message type
  - Added message type definitions and unions

### 8. Created Async Message Handler
- **File**: `packages/tokens-studio-for-figma/src/plugin/asyncMessageHandlers/setExportSettings.ts`
- **Purpose**: Handles saving export settings to shared plugin data when triggered from UI

### 9. Registered Message Handler
- **File**: `packages/tokens-studio-for-figma/src/plugin/controller.ts`
- **Change**: Added handler registration for `SET_EXPORT_SETTINGS`

### 10. Updated Startup Process
- **File**: `packages/tokens-studio-for-figma/src/app/components/AppContainer/startupProcessSteps/savePluginDataFactory.ts`
- **Change**: Added logic to load export settings into Redux store on startup

### 11. Enhanced ManageStylesAndVariables Component
- **File**: `packages/tokens-studio-for-figma/src/app/components/ManageStylesAndVariables/ManageStylesAndVariables.tsx`
- **Changes**:
  - Added Redux integration for export settings
  - Initialize state from stored settings or defaults
  - Save settings to Redux (and shared plugin data) when they change
  - Removed TODO comment about remembering selected themes

## How It Works

1. **On Plugin Startup**:
   - `startup()` function loads export settings from shared plugin data
   - Settings are passed to the UI and loaded into Redux store
   - ManageStylesAndVariables component initializes with stored preferences

2. **When Settings Change**:
   - Component state changes trigger a `useEffect`
   - New settings are dispatched to Redux store via `setExportSettings`
   - Redux effect sends async message to plugin
   - Plugin handler saves settings to shared plugin data

3. **On Plugin Reload**:
   - Process repeats, restoring user's previous selections

## Benefits

- **User Experience**: Export preferences persist across plugin sessions
- **Consistency**: Follows existing patterns for storing plugin data
- **Performance**: Minimal overhead, only saves when settings actually change
- **Maintainability**: Uses established Redux and async message patterns

## Files Modified/Created

### New Files:
- `src/figmaStorage/ExportSettingsProperty.ts`
- `src/selectors/exportSettingsSelector.ts`
- `src/plugin/asyncMessageHandlers/setExportSettings.ts`

### Modified Files:
- `src/constants/SharedPluginDataKeys.ts`
- `src/figmaStorage/index.ts`
- `src/utils/plugin/startup.ts`
- `src/app/store/models/uiState.tsx`
- `src/types/AsyncMessages.ts`
- `src/plugin/asyncMessageHandlers/index.ts`
- `src/plugin/controller.ts`
- `src/app/components/AppContainer/startupProcessSteps/savePluginDataFactory.ts`
- `src/app/components/ManageStylesAndVariables/ManageStylesAndVariables.tsx`
- `src/selectors/index.ts`

The implementation follows the existing codebase patterns and integrates seamlessly with the current architecture.