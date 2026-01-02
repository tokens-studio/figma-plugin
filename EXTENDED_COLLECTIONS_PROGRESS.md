# Extended Variable Collections — Implementation Progress

**Last Updated:** 2026-01-02

This document tracks the progress of implementing Figma extended variable collections (inheritance) support in Tokens Studio.

## Phase Completion Status

- [x] Phase 0 — Baseline + API wrappers (no behavior change) — **COMPLETED**
- [x] Phase 1 — Detect + surface extended collections in UI — **COMPLETED**
- [x] Phase 2 — Pull variables from extended collections (read-path) — **COMPLETED**
- [x] Phase 3 — Create extended collections from themes (write-path: collections) — **COMPLETED**
- [x] Phase 4 — Update variables for extended themes (write-path: values + overrides) — **COMPLETED**
- [x] Phase 5 — UI: Theme inheritance controls — **COMPLETED**
- [ ] Phase 6 — Enterprise-only behavior verification & finalization

---

## Phase 0 — Baseline + API wrappers

**Status:** Completed  
**Started:** 2025-12-31  
**Completed:** 2025-12-31

### Completed Items

- [x] Add types to `ThemeObject`
  - [x] `$extendsThemeId?: string`
  - [x] `$figmaParentCollectionId?: string`
- [x] Update `themeObjectSchema` with new fields
- [x] Extend `VariableCollectionSelection` type with:
  - [x] `parentCollectionId?: string`
  - [x] `isExtended?: boolean`
- [x] Create runtime helpers (pure functions):
  - [x] `getParentVariableCollectionId(collection): string | undefined`
  - [x] `isExtendedCollection(collection): boolean`
  - [x] `getCollectionVariableIds(collection): string[]`
- [x] Add diagnostics scaffold (gated)
- [x] Unit tests:
  - [x] Schema validation tests (`themeObjectSchema.test.ts`)
  - [x] Helper function tests with mocked collections (`extendedCollectionHelpers.test.ts`)
- [x] Manual verification completed
- [x] Changeset created

### Files Created/Modified

**Created:**
- `src/plugin/extendedCollectionHelpers.ts` - Helper utilities for extended collections
- `src/plugin/extendedCollectionHelpers.test.ts` - Unit tests for helpers
- `src/plugin/extendedCollectionDiagnostics.ts` - Diagnostics utilities
- `src/types/figma-extended-collections.d.ts` - Type augmentations for Figma API
- `src/storage/schemas/themeObjectSchema.test.ts` - Schema validation tests
- `EXTENDED_COLLECTIONS_PROGRESS.md` - This progress tracking document
- `.changeset/tidy-steaks-provide.md` - Changeset for Phase 0

**Modified:**
- `src/types/ThemeObject.ts` - Added `$extendsThemeId` and `$figmaParentCollectionId`
- `src/storage/schemas/themeObjectSchema.ts` - Added validation for new fields
- `src/types/VariableCollectionSelection.ts` - Added `parentCollectionId` and `isExtended`

### Test Results

All tests passing:
- ✅ 14 tests in `extendedCollectionHelpers.test.ts`
- ✅ 10 tests in `themeObjectSchema.test.ts`
- ✅ Build successful with no TypeScript errors

### Notes

- Types are located in `src/types/ThemeObject.ts`
- Schema validation in `src/storage/schemas/themeObjectSchema.ts`
- Variable collection types in `src/types/VariableCollectionSelection.ts`
- Need to create helper utilities module for collection API wrappers

### Blockers

None

---

## Phase 1 — Detect + surface extended collections in UI

**Status:** Partially Complete (UI detection works, import has issues)  
**Started:** 2025-12-31  
**Completed:** 2026-01-02 (with limitations)

### Completed Items

- [x] Update `GET_AVAILABLE_VARIABLE_COLLECTIONS` handler
  - [x] Populate `parentCollectionId` from collection
  - [x] Populate `isExtended` flag
  - [x] Use helper functions from Phase 0
- [x] Update UI collection displays
  - [x] Show "(extends ParentName)" in ImportVariablesDialog
  - [x] Resolve parent collection name for display
- [x] Unit tests
  - [x] Updated tests for handler with extended collections
  - [x] Test coverage for both base and extended collections
- [x] Manual verification completed
- [x] Changeset created
- [x] Added comprehensive debug logging
- [x] Pre-populate collections Map to create theme structure

### Known Issues

- ❌ **Brand A themes created but EMPTY** (0 variable references)
- ❌ Variables in extended collections not being pulled
- ❌ Override values not being read

**Root Cause:** Current architecture is variable-driven, not collection-driven. Variables belong to parent (Base), not child (Brand A). Requires Phase 2 refactor.

### Partial Fixes Applied

1. **Collections Map Pre-Population:** Extended collections now added to map, themes created (but empty)
2. **Debug Logging:** Comprehensive logging added to diagnose import flow

See `PHASE_1_ISSUES_AND_PHASE_2_HANDOVER.md` for complete analysis.

### Files Modified

**Modified:**
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts` - Added extended collection detection
- `src/plugin/asyncMessageHandlers/__tests__/getAvailableVariableCollections.test.ts` - Updated tests
- `src/app/components/ImportVariablesDialog.tsx` - Display inheritance relationships
- `.changeset/lazy-chefs-run.md` - Changeset for Phase 1

### Test Results

All tests passing:
- ✅ 3 tests in `getAvailableVariableCollections.test.ts`
- ✅ All existing tests still pass
- ✅ Build successful with no errors

### UI Changes

**Import Variables Dialog now shows:**
- Base collections: "Base Collection"
- Extended collections: "Brand A Collection (extends Base Collection)"

The parent collection name is resolved dynamically from the collections array.

---

## Phase 2 — Pull variables from extended collections

**Status:** Completed  
**Started:** 2026-01-02  
**Completed:** 2026-01-02

### Completed Items

- [x] Refactored `pullVariables.ts` to be collection-driven
  - Changed from iterating over all variables to iterating over selected collections
  - For each collection, get variable IDs using `getCollectionVariableIds()` (includes inherited)
  - Use `valuesByModeForCollectionAsync()` for extended collections to get effective values
- [x] Extended collections now import with correct override values
- [x] Parent collection ID stored in themes via `$figmaParentCollectionId`
- [x] Variable references populated correctly for inherited variables
- [x] All 1554 existing tests pass (no regressions)
- [x] Added 3 new tests for extended collections:
  - `pulls variables from extended collection with effective values`
  - `stores parent collection ID in themes for extended collections`
  - `creates variable references for inherited variables in extended collections`
- [x] Removed debug logging from Phase 1
- [x] Changeset created

### Files Modified

**Modified:**
- `src/plugin/pullVariables.ts` - Refactored to collection-driven approach
- `src/plugin/pullVariables.test.ts` - Added extended collection tests, updated mocks
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts` - Removed debug logging
- `src/app/components/ImportVariablesDialog.tsx` - Removed debug logging
- `.changeset/curly-mangos-happen.md` - Changeset for Phase 2

### Key Changes in pullVariables.ts

1. **Collection-driven iteration**: Instead of iterating all variables and filtering by collection, we now iterate selected collections and get their variables using `getCollectionVariableIds()`

2. **Effective values for overrides**: For extended collections, we call `valuesByModeForCollectionAsync()` to get values with overrides applied

3. **Theme metadata**: Themes for extended collections now include `$figmaParentCollectionId`

4. **Variable references**: Uses collection's `variableIds` to build `$figmaVariableReferences` (works for both base and extended collections)

### Test Results

All tests passing:
- ✅ 13 tests in `pullVariables.test.ts` (10 existing + 3 new)
- ✅ All 1554 tests pass across the entire codebase

---

## Phase 3 — Create extended collections from themes

**Status:** Completed  
**Started:** 2026-01-02  
**Completed:** 2026-01-02

### Completed Items

- [x] Created `resolveThemeDependencies.ts` - topological sort helper
  - Sorts themes so parents are processed before children
  - Detects and throws on circular dependencies
  - Handles missing parent themes gracefully
- [x] Created `resolveThemeDependencies.test.ts` - 11 tests for dependency resolution
- [x] Updated `createNecessaryVariableCollections.ts`
  - Uses topological sort to process parents before children
  - Creates extended collections using `.extend()` method for themes with `$extendsThemeId`
  - Stores `$figmaParentCollectionId` on child themes
  - Falls back to regular collection if `.extend()` not available
  - Handles missing parent collection with warning
- [x] Added 5 new tests for extended collection creation
- [x] All 1570 tests pass (no regressions)
- [x] Build successful
- [x] Changeset created

### Files Created

- `src/plugin/resolveThemeDependencies.ts` - Topological sort for theme dependencies
- `src/plugin/resolveThemeDependencies.test.ts` - Tests for dependency resolver
- `.changeset/bright-birds-dance.md` - Changeset for Phase 3

### Files Modified

- `src/plugin/createNecessaryVariableCollections.ts` - Extended collection creation logic
- `src/plugin/createNecessaryVariableCollections.test.ts` - Added extended collection tests

### Test Results

All tests passing:
- ✅ 11 tests in `resolveThemeDependencies.test.ts`
- ✅ 11 tests in `createNecessaryVariableCollections.test.ts` (6 existing + 5 new)
- ✅ All 1570 tests pass across the entire codebase

---

## Phase 4 — Update variables for extended themes

**Status:** Completed  
**Started:** 2026-01-02  
**Completed:** 2026-01-02

### Completed Items

- [x] Updated `setValuesOnVariable.ts` to handle extended collections:
  - Pre-fetch inherited variables from parent collection
  - Skip variable creation in extended collections (cannot create in child)
  - Find inherited variables correctly (different collectionId)
  - Don't rename inherited variables (they belong to parent)
  - Don't modify description on inherited variables
  - Can still set override values on inherited variables
- [x] Updated `updateVariables.ts` to protect inherited variables:
  - Never delete inherited variables (they belong to parent)
  - Only delete orphaned variables that belong to the child collection
- [x] Added 4 new tests for `setValuesOnVariable.test.ts`:
  - Extended collection variable creation prevention
  - Override value setting on inherited variables
  - Inherited variable rename protection
  - Inherited variable description protection
- [x] Added 2 new tests for `updateVariables.test.ts`:
  - Inherited variable deletion prevention
  - Own variable deletion in extended collections
- [x] All 1576 tests pass (no regressions)
- [x] Build successful
- [x] Changeset created

### Files Modified

- `src/plugin/setValuesOnVariable.ts` - Extended collection handling
- `src/plugin/setValuesOnVariable.test.ts` - New tests for extended collections
- `src/plugin/updateVariables.ts` - Inherited variable protection
- `src/plugin/updateVariables.test.ts` - New tests for extended collections
- `.changeset/swift-foxes-sleep.md` - Changeset for Phase 4

### Key Behavior Changes

1. **No variable creation in extended collections** - Variables must be created in the parent collection first
2. **Override values work** - `setValueForMode()` on inherited variables creates overrides
3. **Inherited variables protected** - Never renamed, never deleted, description not modified
4. **Own variables still managed** - Child collection's own variables can still be deleted if orphaned

### Test Results

All tests passing:
- ✅ 8 tests in `setValuesOnVariable.test.ts` (4 existing + 4 new)
- ✅ 6 tests in `updateVariables.test.ts` (4 existing + 2 new)
- ✅ All 1576 tests pass across the entire codebase

---

## Phase 5 — UI: Theme inheritance controls

**Status:** Completed  
**Started:** 2026-01-02  
**Completed:** 2026-01-02

### Completed Items

- [x] Added "Extends theme" dropdown to CreateOrEditThemeForm
  - Dropdown only shows when editing existing themes
  - Excludes current theme and themes that would create cycles
  - Uses cycle detection to prevent circular inheritance
- [x] Updated FormValues type to include `$extendsThemeId`
- [x] Updated ManageThemesModal to handle $extendsThemeId in default values and submission
- [x] Updated saveTheme reducer to persist $extendsThemeId
- [x] Added inheritance indicator in theme list (SingleThemeEntry)
  - Shows "extends ParentName" in blue text for extended themes
- [x] Added translation keys for new UI elements
- [x] Build successful
- [x] Changeset created
- [x] **Fixed critical bug:** Extended collections use different mode ID format (`VariableCollectionId:X/Y`)
  - `setColorValuesOnVariable` now handles missing `valuesByMode[mode]` for extended modes
  - Values are set directly via `setValueForMode` for inherited variables

### Files Modified

- `src/app/components/ManageThemesModal/CreateOrEditThemeForm.tsx` - Added extends dropdown
- `src/app/components/ManageThemesModal/ManageThemesModal.tsx` - Handle $extendsThemeId
- `src/app/components/ManageThemesModal/SingleThemeEntry.tsx` - Display inheritance indicator
- `src/app/store/models/reducers/tokenState/saveTheme.ts` - Persist $extendsThemeId
- `src/i18n/lang/en/tokens.json` - Added translation keys
- `src/plugin/setColorValuesOnVariable.ts` - Fixed for extended collection mode IDs
- `.changeset/happy-lions-glow.md` - Changeset for Phase 5

### UI Changes

**Theme Editor:**
- "Extends theme" dropdown appears below name/group when editing an existing theme
- Dropdown shows all themes except current theme and those that would create cycles
- Selecting a theme sets `$extendsThemeId` on save

**Theme List:**
- Extended themes show "extends ParentName" indicator in blue
- Indicator appears before set/style/variable counts

### Key Technical Discovery

Extended collections in Figma have a different mode ID format:
- Base collection modes: `33:2`, `33:5` (simple format)
- Extended collection modes: `VariableCollectionId:33:5/33:3` (compound format)

The `variable.valuesByMode` object only contains entries for the base collection's mode IDs.
For extended collections, we must call `setValueForMode(extendedModeId, value)` directly without
checking `valuesByMode` first.

### Test Results

- ✅ 8 tests in ManageThemesModal tests pass
- ✅ All 1574 tests pass
- ✅ Build successful

---

## Phase 6 — Enterprise verification

**Status:** Not Started

### Planned Work

- Run verification script on Enterprise device
- Document final behavior
- Update implementation based on findings

---

## Known Issues & Decisions

### API Observations (verified on non-Enterprise)

- `collection.parentVariableCollectionId` exists (prototype property)
- `collection.variableIds` is a getter (not enumerable own property)
- `variable.valuesByModeForCollectionAsync(collection)` needed for effective values
- `variable.setValueForMode(childModeId, value)` creates overrides
- `collection.variableOverrides` exposes override map
- **Extended collection modes have compound format:** `VariableCollectionId:X/Y` with `parentModeId` property
- `collection.removeOverridesForVariable(variableNode)` expects Variable node, not ID
- Calling `variable.remove()` on inherited variable removes from parent (dangerous!)
- Mode IDs differ per collection (use names for mapping)

### Enterprise Unknowns

- Whether `createVariable` in extended collections is allowed on Enterprise plan
- Impacts brand-only variable creation strategy

---

## Testing Strategy

Each phase includes:

1. **Unit tests (Jest)** - Added/updated for functionality
2. **Manual verification** - Steps to verify in Figma plugin
3. **Debug diagnostics** - Structured payload logged to console

### Debug Output Format

```json
{
  "phase": "PHASE_NAME",
  "collections": [...],
  "themes": [...],
  "notes": [...]
}
```

---

## Resources

- [Implementation Plan](./developer-knowledgebase/extended-variable-collections.md)
- [Figma Plugin API Docs](https://www.figma.com/plugin-docs/)
- Related files:
  - `src/types/ThemeObject.ts`
  - `src/storage/schemas/themeObjectSchema.ts`
  - `src/types/VariableCollectionSelection.ts`
  - `src/plugin/pullVariables.ts`
  - `src/plugin/createNecessaryVariableCollections.ts`
