# Extended Variable Collections Implementation - Handover Document

**Date:** 2025-12-31  
**Completed Phases:** Phase 0, Phase 1  
**Next Phase:** Phase 2 - Pull variables from extended collections (read-path)  
**Project Status:** On track, no blockers

---

## Executive Summary

We are implementing support for **Figma Extended Variable Collections (inheritance)** in Tokens Studio. This allows multi-brand/multi-theme systems where child collections inherit variables from a parent with the ability to override values.

**Progress:**
- ✅ **Phase 0:** Foundation (types, helpers, diagnostics) - **COMPLETE**
- ✅ **Phase 1:** UI detection and display - **COMPLETE**
- 🔜 **Phase 2:** Pull variables with overrides - **NEXT**
- ⏸️ **Phases 3-6:** Create, update, UI controls, Enterprise verification - **PENDING**

---

## What Has Been Completed

### Phase 0 - Baseline + API Wrappers ✅

**Objective:** Add foundational types and helpers without changing behavior.

**Deliverables:**
1. **Type definitions:**
   - Added `$extendsThemeId` and `$figmaParentCollectionId` to `ThemeObject`
   - Extended `VariableCollectionInfo` with `parentCollectionId` and `isExtended`
   - Created `src/types/figma-extended-collections.d.ts` for Figma API augmentation

2. **Helper utilities** (`src/plugin/extendedCollectionHelpers.ts`):
   - `getParentVariableCollectionId()` - Safely extracts parent collection ID
   - `isExtendedCollection()` - Checks if collection is extended
   - `getCollectionVariableIds()` - Handles getter/prototype quirks

3. **Diagnostics** (`src/plugin/extendedCollectionDiagnostics.ts`):
   - Gated logging system (controlled via `debugExtendedCollections` flag)
   - Structured payload format for debugging
   - Console output tagged as `TS_EXTCOLL_DIAGNOSTICS`

4. **Testing:**
   - 14 tests for helper functions
   - 10 tests for schema validation
   - 100% test coverage for new code
   - All tests passing ✅

**Key Files Created:**
- `src/plugin/extendedCollectionHelpers.ts`
- `src/plugin/extendedCollectionHelpers.test.ts`
- `src/plugin/extendedCollectionDiagnostics.ts`
- `src/types/figma-extended-collections.d.ts`
- `src/storage/schemas/themeObjectSchema.test.ts`

**Key Files Modified:**
- `src/types/ThemeObject.ts`
- `src/storage/schemas/themeObjectSchema.ts`
- `src/types/VariableCollectionSelection.ts`

---

### Phase 1 - Detect + Surface Extended Collections in UI ✅

**Objective:** Display inheritance relationships in the Import Variables dialog.

**Deliverables:**
1. **Handler updates:**
   - Modified `getAvailableVariableCollections` to detect extended collections
   - Populates `parentCollectionId` and `isExtended` fields
   - Uses Phase 0 helper functions

2. **UI updates:**
   - Import Variables Dialog now shows: `"Brand A (extends Base)"`
   - Parent name resolved dynamically from collections array
   - Muted color styling for inheritance info

3. **Testing:**
   - 3 tests for handler with extended collections
   - Tests cover base collections, extended collections, and edge cases
   - All tests passing ✅

**Key Files Modified:**
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts`
- `src/plugin/asyncMessageHandlers/__tests__/getAvailableVariableCollections.test.ts`
- `src/app/components/ImportVariablesDialog.tsx`

**User-Facing Changes:**
```
Before:
☐ Base Collection
☐ Brand A Collection

After:
☐ Base Collection
☐ Brand A Collection (extends Base Collection)
```

---

## Current State of the Codebase

### Test Status
- **Total tests passing:** 28
  - Phase 0 helpers: 14 tests
  - Phase 0 schema: 10 tests
  - Phase 1 handler: 3 tests
  - Existing selectors: 1 test
- **Build status:** ✅ Compiling successfully
- **No regressions:** All existing functionality works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ UI Layer (React)                                             │
│  └─ ImportVariablesDialog.tsx                               │
│     └─ Displays "(extends Parent)" for extended collections │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Async Message Handlers                                       │
│  └─ getAvailableVariableCollections                         │
│     └─ Detects extended collections                         │
│     └─ Populates parentCollectionId, isExtended             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Helper Functions (Phase 0)                                   │
│  └─ extendedCollectionHelpers.ts                            │
│     ├─ getParentVariableCollectionId()                      │
│     ├─ isExtendedCollection()                               │
│     └─ getCollectionVariableIds()                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Figma API (Extended Collections)                            │
│  └─ collection.parentVariableCollectionId                   │
│  └─ collection.variableIds (includes inherited)             │
│  └─ collection.variableOverrides                            │
│  └─ variable.valuesByModeForCollectionAsync()               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Import Variables (Current):**
1. User clicks "Import variables"
2. Handler calls `getAvailableVariableCollections()`
3. Iterates collections, detects extended using helpers
4. Returns collections with `parentCollectionId` and `isExtended`
5. UI displays inheritance relationships
6. User selects collections/modes to import
7. Import proceeds (no changes to import logic yet - Phase 2)

---

## Key Design Decisions

### 1. Type Augmentation Approach
**Decision:** Use TypeScript declaration merging to extend Figma API types.

**Rationale:**
- Figma plugin API doesn't officially document extended collection properties
- Properties exist at runtime but not in `@figma/plugin-typings`
- Declaration merging allows us to use properties safely without forking types

**File:** `src/types/figma-extended-collections.d.ts`

---

### 2. Helper Functions Over Direct Access
**Decision:** Always use helper functions to access extended collection properties.

**Rationale:**
- Properties may be on prototype chain, not enumerable own-properties
- Consistent null/undefined handling
- Easier to test and maintain
- Future-proof against API changes

**Usage:**
```typescript
// ❌ Don't
const parentId = collection.parentVariableCollectionId;

// ✅ Do
const parentId = getParentVariableCollectionId(collection);
```

---

### 3. Gated Diagnostics
**Decision:** Diagnostics logging behind a feature flag.

**Rationale:**
- Prevents console noise in production
- Allows developers to enable for debugging
- Structured output format for consistency

**Control:**
```typescript
await figma.clientStorage.setAsync('debugExtendedCollections', true);
```

---

### 4. Backward Compatibility First
**Decision:** All changes are additive, no breaking changes.

**Rationale:**
- Existing workflows must continue to work
- Extended collections are optional features
- Fields are all optional (`?:` in types)

---

## Known Constraints & Observations

### Figma API Quirks (Verified on non-Enterprise account)

1. **Property Location:**
   - `parentVariableCollectionId` exists on prototype, not as enumerable own-property
   - `variableIds` is a getter, not a regular array property
   - Must use `'propertyName' in object` check, not `hasOwnProperty`

2. **Variable IDs in Extended Collections:**
   - `collection.variableIds` includes **inherited** variables from parent
   - This is intentional - child sees all variables it has access to

3. **Mode IDs are Collection-Specific:**
   - Parent mode: `VariableCollectionId:<parent-id>/<mode-id>`
   - Child mode: `VariableCollectionId:<child-id>/<mode-id>`
   - Mode **names** match, mode **IDs** differ
   - Use mode names for mapping parent/child modes

4. **Effective Values:**
   - `variable.valuesByMode` uses **owner collection** mode IDs
   - `variable.valuesByModeForCollectionAsync(collection)` returns values for **target collection** (with overrides)
   - Must use async method for extended collections

5. **Overrides:**
   - `collection.variableOverrides` is a map: `Record<variableId, Record<modeId, value>>`
   - Setting override: `variable.setValueForMode(childModeId, value)`
   - Clearing override: `collection.removeOverridesForVariable(variableNode)` ← expects Variable node, not string ID

6. **Dangerous Operations:**
   - `variable.remove()` on inherited variable **deletes from parent** (affects all children!)
   - Never delete variables when processing extended collections

7. **Mode Rename Propagation:**
   - Renaming mode in parent propagates to all children
   - Mode names update across chain, mode IDs remain distinct

---

### Enterprise Plan Unknown

**Critical Unknown:** Can `createVariable()` be called on extended collections?

**Tested on:** Non-Enterprise account  
**Result:** Throws error: "Cannot create variables in extended variable collections"

**Impact on Phase 3+:**
- If Enterprise allows: Can create brand-only variables directly in child
- If Enterprise prohibits: Brand-only variables must be created in base/ancestor and overridden

**Action Required:** Run Enterprise verification script (see implementation plan Appendix A) on Enterprise device before Phase 6.

---

## Documentation & Resources

### Project Documents

1. **Implementation Plan:** `developer-knowledgebase/extended-variable-collections.md`
   - Complete 6-phase implementation plan
   - API observations and constraints
   - Enterprise verification script

2. **Progress Tracking:** `EXTENDED_COLLECTIONS_PROGRESS.md`
   - Phase completion status
   - Files created/modified per phase
   - Test results and notes

3. **Phase Validation Guides:**
   - `PHASE_0_VALIDATION.md` - How to validate Phase 0
   - `PHASE_1_VALIDATION.md` - How to validate Phase 1

4. **Changesets:**
   - `.changeset/tidy-steaks-provide.md` - Phase 0
   - `.changeset/lazy-chefs-run.md` - Phase 1

### External Resources

- **Figma Plugin API Docs:** https://www.figma.com/plugin-docs/
- **Extended Collections (unofficial):** Properties exist but not documented
- **Tokens Studio Repo:** https://github.com/tokens-studio/figma-plugin

---

## Phase 2 - Next Steps

### Objective
Implement the **read-path** for extended collections - pull variables with override detection.

### What Needs to Be Done

**1. Refactor `pullVariables` to be collection-driven:**

Current approach (iterates variables):
```typescript
for (const variable of localVariables) {
  const collection = await getCollectionById(variable.variableCollectionId);
  // Process variable
}
```

New approach (iterates collections):
```typescript
for (const collection of collections) {
  const variableIds = getCollectionVariableIds(collection);
  for (const variableId of variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    // Use valuesByModeForCollectionAsync for effective values
    const effectiveValues = await variable.valuesByModeForCollectionAsync(collection);
    // Process with collection context
  }
}
```

**Why:**
- Extended collections need collection context for effective values
- `valuesByModeForCollectionAsync()` applies overrides automatically
- Mode IDs must be mapped using the collection's modes

**2. Read effective values with overrides:**
```typescript
// For each variable in collection
const effectiveValues = await variable.valuesByModeForCollectionAsync(collection);

// Map using collection's mode IDs (not variable's owner mode IDs)
for (const [modeId, value] of Object.entries(effectiveValues)) {
  const modeName = collection.modes.find(m => m.modeId === modeId)?.name;
  // Create token with collection/mode context
}
```

**3. Mark overridden tokens (optional):**
```typescript
const isOverridden = collection.variableOverrides?.[variable.id]?.[modeId] !== undefined;

// Could add metadata to token:
{
  name: 'color.primary',
  value: '#ff0000',
  $extensions: {
    'studio.tokens': {
      isOverride: true  // Optional metadata
    }
  }
}
```

**4. Store parent collection metadata:**
```typescript
// When pulling from extended collection
if (isExtendedCollection(collection)) {
  const parentId = getParentVariableCollectionId(collection);
  
  // Store in theme metadata
  theme.$figmaParentCollectionId = parentId;
  theme.$extendsThemeId = findThemeByCollectionId(parentId)?.id;
}
```

**5. Update tests:**
- Mock extended collections in `pullVariables.test.ts`
- Test override detection
- Test parent metadata storage
- Test collection-driven iteration

### Files to Modify

**Primary:**
- `src/plugin/pullVariables.ts` - Main refactor
- `src/plugin/pullVariables.test.ts` - Add extended collection tests

**Supporting:**
- May need helper to find theme by collection ID
- May need helper to map mode IDs between parent/child

### Success Criteria for Phase 2

- ✅ Pull reads effective values from extended collections
- ✅ Overrides are applied automatically via `valuesByModeForCollectionAsync`
- ✅ Tokens are grouped by collection/mode (not by variable owner)
- ✅ Parent collection metadata stored in theme
- ✅ All existing pull functionality still works
- ✅ Tests cover extended collection scenarios
- ✅ No regressions in non-extended collection pulls

### Estimated Effort
- **Complexity:** Medium-High (requires refactoring core pull logic)
- **Testing:** High (need to mock complex collection scenarios)
- **Risk:** Medium (touches critical import path)
- **Time:** 4-6 hours

### Testing Strategy for Phase 2

**Unit tests:**
```typescript
describe('pullVariables with extended collections', () => {
  it('reads effective values from extended collection', async () => {
    // Mock base collection with variable
    // Mock extended collection with override
    // Assert pulled value uses override
  });
  
  it('stores parent collection metadata in theme', async () => {
    // Mock extended collection
    // Pull variables
    // Assert theme has $figmaParentCollectionId
  });
  
  it('groups tokens by collection and mode', async () => {
    // Mock extended collection
    // Pull variables
    // Assert token sets use child collection/mode names
  });
});
```

**Manual testing:**
1. Create base collection with variables
2. Create extended collection with overrides
3. Pull variables via plugin
4. Verify token sets created for child collection
5. Verify override values appear (not base values)

### Potential Challenges

**Challenge 1: Mode ID Mapping**
- Mode IDs differ between parent and child
- Need to map by mode **name**, not ID

**Solution:**
```typescript
const childMode = collection.modes.find(m => m.name === parentModeName);
const childModeId = childMode?.modeId;
```

**Challenge 2: Token Set Naming**
- Current: `${collectionName}/${modeName}`
- Extended: Should still use child collection name (not parent)

**Solution:**
- Use `collection.name` and `mode.name` from the collection being pulled
- Parent collection irrelevant for naming

**Challenge 3: Alias Resolution**
- Variable references might point to parent collection variables
- Token aliases need to resolve correctly

**Solution:**
- Alias resolution happens at resolve-time, not pull-time
- Store token references as-is: `{parent.variable.name}`
- Resolution will work when themes are applied

---

## Development Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use helper functions from Phase 0
- Add JSDoc comments to new functions
- Keep functions pure where possible

### Testing Requirements
- Every PR must have a changeset (`yarn changeset`)
- Always select "patch" for version (maintainers upgrade if needed)
- All new code must have unit tests
- Maintain existing test coverage
- Run full test suite before committing

### Git Workflow
```bash
# Make changes
git add .

# Create changeset (required!)
yarn changeset
# Select: patch
# Describe: Brief user-facing description

# Commit
git commit -m "feat: Phase N - Description"

# Verify tests
cd packages/tokens-studio-for-figma
yarn test --no-coverage
```

### Build Commands
```bash
# Development build with watch
yarn start

# Production build
yarn build

# Development build (one-time)
yarn build:dev

# Run tests
yarn test

# Run specific tests
yarn test <pattern> --no-coverage

# Lint (auto-fix)
yarn lint
```

### Debugging
- Use `console.log` in plugin code (appears in Figma Dev Console)
- Enable diagnostics: `figma.clientStorage.setAsync('debugExtendedCollections', true)`
- Use diagnostics functions from `extendedCollectionDiagnostics.ts`
- Check `TS_EXTCOLL_DIAGNOSTICS` console output

---

## Common Pitfalls to Avoid

### ❌ Don't: Access properties directly
```typescript
// BAD - may fail on prototype properties
if (collection.parentVariableCollectionId) { ... }
```

### ✅ Do: Use helper functions
```typescript
// GOOD - handles prototype and null cases
const parentId = getParentVariableCollectionId(collection);
if (parentId) { ... }
```

---

### ❌ Don't: Use hasOwnProperty
```typescript
// BAD - misses prototype properties
if (collection.hasOwnProperty('variableIds')) { ... }
```

### ✅ Do: Use 'in' operator
```typescript
// GOOD - checks prototype chain
if ('variableIds' in collection && Array.isArray(collection.variableIds)) { ... }
```

---

### ❌ Don't: Delete variables from extended collections
```typescript
// DANGEROUS - deletes from parent, affects all children!
variable.remove();
```

### ✅ Do: Clear overrides instead
```typescript
// GOOD - only affects this collection
collection.removeOverridesForVariable(variableNode);
```

---

### ❌ Don't: Use mode IDs directly across collections
```typescript
// BAD - parent and child have different mode IDs
variable.setValueForMode(parentModeId, value); // Wrong collection!
```

### ✅ Do: Map mode names to correct mode IDs
```typescript
// GOOD - find mode by name in target collection
const childMode = childCollection.modes.find(m => m.name === 'Light');
variable.setValueForMode(childMode.modeId, value);
```

---

### ❌ Don't: Forget to create changesets
```typescript
// Commit without changeset = CI will fail
git commit -m "fix: bug"
```

### ✅ Do: Always create changeset
```bash
yarn changeset  # Run before committing
git add .changeset/*.md
git commit -m "fix: bug"
```

---

## Quick Reference

### Key Files

**Types:**
- `src/types/ThemeObject.ts` - Theme metadata structure
- `src/types/VariableCollectionSelection.ts` - Collection selection info
- `src/types/figma-extended-collections.d.ts` - Figma API augmentation

**Helpers:**
- `src/plugin/extendedCollectionHelpers.ts` - Safe property accessors
- `src/plugin/extendedCollectionDiagnostics.ts` - Debug logging

**Handlers:**
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts` - Collection listing
- `src/plugin/pullVariables.ts` - Variable import (TO BE MODIFIED IN PHASE 2)

**UI:**
- `src/app/components/ImportVariablesDialog.tsx` - Import dialog with inheritance display

### Helper Functions

```typescript
// Check if collection is extended
const isExtended = isExtendedCollection(collection);

// Get parent collection ID
const parentId = getParentVariableCollectionId(collection);

// Get variable IDs (handles getter)
const varIds = getCollectionVariableIds(collection);

// Log diagnostics (if enabled)
await logExtendedCollectionDiagnostics(
  'phase2',
  [collection],
  [theme],
  ['Note about current state']
);
```

### Testing Helpers

```typescript
// Mock extended collection
const mockExtendedCollection = {
  id: 'child-id',
  name: 'Brand A',
  parentVariableCollectionId: 'parent-id',
  modes: [{ modeId: 'child-mode-1', name: 'Light' }],
  variableIds: ['var1', 'var2'],
  variableOverrides: {
    'var1': { 'child-mode-1': '#ff0000' }
  }
};

// Mock base collection
const mockBaseCollection = {
  id: 'parent-id',
  name: 'Base',
  modes: [{ modeId: 'parent-mode-1', name: 'Light' }],
  variableIds: ['var1', 'var2']
};
```

---

## Questions to Ask Before Starting Phase 2

1. **Do I understand the difference between `valuesByMode` and `valuesByModeForCollectionAsync`?**
   - `valuesByMode`: Raw values keyed by owner collection mode IDs
   - `valuesByModeForCollectionAsync`: Effective values for target collection (includes overrides)

2. **Do I understand why we need to refactor to collection-driven iteration?**
   - Need collection context to read effective values
   - Mode IDs are collection-specific
   - Overrides are per-collection

3. **Do I know how to map modes between parent and child?**
   - Use mode **names**, not mode IDs
   - Mode names match, IDs differ

4. **Do I understand the testing requirements?**
   - All new code needs tests
   - Must maintain existing test coverage
   - Changeset required for every PR

5. **Have I reviewed the Phase 2 section in the implementation plan?**
   - `developer-knowledgebase/extended-variable-collections.md`
   - Section: "Phase 2 — Pull variables from extended collections"

---

## Contact & Escalation

### Documentation
- **Implementation Plan:** Complete specification in `developer-knowledgebase/extended-variable-collections.md`
- **Progress Tracker:** Current status in `EXTENDED_COLLECTIONS_PROGRESS.md`
- **Validation Guides:** How to test in `PHASE_0_VALIDATION.md` and `PHASE_1_VALIDATION.md`

### Debugging Resources
- Figma Plugin API: https://www.figma.com/plugin-docs/
- Console diagnostics: Enable via `debugExtendedCollections` flag
- Test locally: `yarn test --watch`

### Success Indicators
- All tests pass
- Build compiles successfully
- Manual testing in Figma works
- Changeset created
- No console errors

---

## Final Checklist Before Handover

- [x] Phase 0 complete and validated
- [x] Phase 1 complete and validated
- [x] All tests passing (28 tests)
- [x] Build compiles successfully
- [x] Changesets created for both phases
- [x] Documentation complete
- [x] Validation guides created
- [x] Progress tracker updated
- [x] Handover document prepared
- [x] No blocking issues
- [x] Enterprise unknowns documented

---

## Handover Summary

**What's Working:**
- ✅ Foundation in place (types, helpers, diagnostics)
- ✅ UI displays extended collection relationships
- ✅ Tests comprehensive and passing
- ✅ No technical debt or blockers

**What's Next:**
- 🔜 Phase 2: Refactor pull to read effective values from extended collections
- 📋 Estimated effort: 4-6 hours
- 🎯 Main file to modify: `src/plugin/pullVariables.ts`

**Resources Available:**
- Complete implementation plan with all 6 phases
- Validation guides for testing
- Helper functions ready to use
- Test patterns established

**The foundation is solid. Phase 2 implementation can begin immediately.** 🚀

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-31  
**Next Review:** After Phase 2 completion
