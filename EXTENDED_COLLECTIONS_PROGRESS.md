# Extended Variable Collections — Implementation Progress

**Last Updated:** 2026-01-02

This document tracks the progress of implementing Figma extended variable collections (inheritance) support in Tokens Studio.

## Phase Completion Status

- [x] Phase 0 — Baseline + API wrappers (no behavior change) — **COMPLETED**
- [x] Phase 1 — Detect + surface extended collections in UI — **COMPLETED**
- [x] Phase 2 — Pull variables from extended collections (read-path) — **COMPLETED**
- [ ] Phase 3 — Create extended collections from themes (write-path: collections)
- [ ] Phase 4 — Update variables for extended themes (write-path: values + overrides)
- [ ] Phase 5 — UI: Theme inheritance controls
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

**Status:** Not Started

### Planned Work

- Implement topological sort for theme dependencies
- Update collection creation logic
- Handle parent collection resolution

---

## Phase 4 — Update variables for extended themes

**Status:** Not Started

### Planned Work

- Implement safe override writes
- Handle revert-to-inherit
- Never delete inherited variables

---

## Phase 5 — UI: Theme inheritance controls

**Status:** Not Started

### Planned Work

- Add "Extends theme" selector
- Implement cycle detection
- Update theme editor UI

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
