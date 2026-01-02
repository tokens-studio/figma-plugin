# Extended Variable Collections — Implementation Progress

**Last Updated:** 2025-12-31

This document tracks the progress of implementing Figma extended variable collections (inheritance) support in Tokens Studio.

## Phase Completion Status

- [x] Phase 0 — Baseline + API wrappers (no behavior change) — **COMPLETED**
- [x] Phase 1 — Detect + surface extended collections in UI — **COMPLETED**
- [ ] Phase 2 — Pull variables from extended collections (read-path)
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

**Status:** Ready to Start  
**Next Developer:** See `PHASE_0_1_HANDOVER.md` for complete handover

### Planned Work

- Refactor `pullVariables` to be collection-driven
- Implement override detection using `valuesByModeForCollectionAsync()`
- Update theme metadata with parent info
- Store `$figmaParentCollectionId` in themes
- Map parent theme via `$extendsThemeId`

### Key Files to Modify

- `src/plugin/pullVariables.ts` - Main refactor
- `src/plugin/pullVariables.test.ts` - Add extended collection tests

### Success Criteria

- Pull reads effective values from extended collections
- Overrides applied automatically
- Parent collection metadata stored
- All existing functionality works
- Comprehensive test coverage

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
