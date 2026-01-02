# Phase 2 Complete & Phase 3 Handover

**Date:** 2026-01-02  
**Status:** Phase 2 complete, Phase 3 ready to start  
**Goal:** Create extended collections when pushing themes to Figma

---

## Summary of Phase 2 Completion

### What Was Accomplished

Phase 2 refactored `pullVariables.ts` to be **collection-driven** instead of variable-driven, enabling proper import of extended collections with override values.

**Key changes:**
1. Iterate over selected collections (not all variables)
2. Use `getCollectionVariableIds(collection)` to get variable IDs (includes inherited)
3. Use `valuesByModeForCollectionAsync()` for extended collections to get effective values with overrides
4. Store `$figmaParentCollectionId` in themes for extended collections
5. Variable references populated correctly for inherited variables

### Files Modified in Phase 2

- `src/plugin/pullVariables.ts` - Main refactor (collection-driven)
- `src/plugin/pullVariables.test.ts` - Added 3 new tests, updated mocks
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts` - Removed debug logging
- `src/app/components/ImportVariablesDialog.tsx` - Removed debug logging

### Current Test Status

- ✅ All 1554 tests pass
- ✅ Build successful
- ✅ 13 tests in `pullVariables.test.ts` (10 existing + 3 new for extended collections)

---

## Phase 3 Goal

**Create extended collections from themes when pushing to Figma**

When a user has themes defined with `$extendsThemeId` pointing to a parent theme, pushing to Figma should:
1. Create the parent collection first
2. Create the child collection using `parentCollection.extend(childName)`
3. Store `$figmaParentCollectionId` on the child theme

---

## Technical Implementation Guide

### 1. Topological Sort for Theme Dependencies

Themes must be created in dependency order (parents before children).

**Create a new helper function:**
```typescript
// src/plugin/resolveThemeDependencies.ts

/**
 * Topologically sorts themes so that parent themes are processed before children.
 * Throws an error if a cycle is detected.
 * 
 * @param themes - Array of theme objects
 * @returns Sorted array of themes (parents first)
 */
export function resolveThemeDependencies(themes: ThemeObjectsList): ThemeObjectsList {
  const themeMap = new Map(themes.map(t => [t.id, t]));
  const sorted: ThemeObjectsList = [];
  const visited = new Set<string>();
  const inStack = new Set<string>(); // For cycle detection
  
  function visit(themeId: string) {
    if (inStack.has(themeId)) {
      throw new Error(`Circular dependency detected in themes: ${themeId}`);
    }
    if (visited.has(themeId)) return;
    
    const theme = themeMap.get(themeId);
    if (!theme) return;
    
    inStack.add(themeId);
    
    // Visit parent first (if exists)
    if (theme.$extendsThemeId) {
      visit(theme.$extendsThemeId);
    }
    
    inStack.delete(themeId);
    visited.add(themeId);
    sorted.push(theme);
  }
  
  for (const theme of themes) {
    visit(theme.id);
  }
  
  return sorted;
}
```

### 2. Update `createNecessaryVariableCollections.ts`

The current implementation creates collections without considering inheritance. We need to:

**Current flow:**
```typescript
for each theme:
  - find or create collection by name
  - add/update mode
```

**New flow:**
```typescript
// Phase A: Sort themes by dependencies
const sortedThemes = resolveThemeDependencies(collectionsToCreateOrUpdate);

// Phase B: Process in order
for each theme in sortedThemes:
  if theme.$extendsThemeId:
    // Find parent theme and its collection
    const parentTheme = themes.find(t => t.id === theme.$extendsThemeId);
    const parentCollection = collections.find(c => c.id === parentTheme.$figmaCollectionId);
    
    // Create extended collection using .extend()
    const childCollection = parentCollection.extend(collectionName);
    
    // Store parent collection ID on theme
    theme.$figmaParentCollectionId = parentCollection.id;
  else:
    // Create regular collection (existing logic)
    const collection = figma.variables.createVariableCollection(name);
```

### 3. Key Files to Modify

**Primary:**
- `src/plugin/createNecessaryVariableCollections.ts` - Main changes

**Create:**
- `src/plugin/resolveThemeDependencies.ts` - Topological sort helper
- `src/plugin/resolveThemeDependencies.test.ts` - Tests for dependency resolution

**Modify (minor):**
- May need to update callers to handle async theme metadata updates

---

## API Reference

### Creating Extended Collections

```typescript
// Create a regular collection
const baseCollection = figma.variables.createVariableCollection('Base');

// Create an extended (child) collection
// Note: .extend() is a method on VariableCollection
const childCollection = baseCollection.extend('Brand A');

// The child collection now has:
// - Same modes as parent (with different mode IDs)
// - Access to all parent's variables via collection.variableIds
// - parentVariableCollectionId pointing to base
```

### Mode ID Mapping

**Important:** Extended collections have **different mode IDs** but **same mode names**.

```
Base collection:
  - Light mode: modeId = "3:4"
  - Dark mode: modeId = "3:5"

Brand A collection (extends Base):
  - Light mode: modeId = "VariableCollectionId:3:154/3:7"  (different!)
  - Dark mode: modeId = "VariableCollectionId:3:154/3:8"  (different!)
```

Use mode **names** for mapping, not IDs.

### Detecting Extended Collections

```typescript
import { isExtendedCollection, getParentVariableCollectionId } from './extendedCollectionHelpers';

if (isExtendedCollection(collection)) {
  const parentId = getParentVariableCollectionId(collection);
  // parentId = "VariableCollectionId:3:152"
}
```

---

## Test Strategy

### Unit Tests to Add

**1. Topological Sort Tests (`resolveThemeDependencies.test.ts`):**
```typescript
it('sorts themes with no dependencies', () => {
  const themes = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
  const sorted = resolveThemeDependencies(themes);
  expect(sorted).toHaveLength(2);
});

it('sorts parent before child', () => {
  const themes = [
    { id: 'child', name: 'Child', $extendsThemeId: 'parent' },
    { id: 'parent', name: 'Parent' },
  ];
  const sorted = resolveThemeDependencies(themes);
  expect(sorted[0].id).toBe('parent');
  expect(sorted[1].id).toBe('child');
});

it('handles multi-level inheritance', () => {
  const themes = [
    { id: 'grandchild', name: 'Grandchild', $extendsThemeId: 'child' },
    { id: 'child', name: 'Child', $extendsThemeId: 'parent' },
    { id: 'parent', name: 'Parent' },
  ];
  const sorted = resolveThemeDependencies(themes);
  expect(sorted[0].id).toBe('parent');
  expect(sorted[1].id).toBe('child');
  expect(sorted[2].id).toBe('grandchild');
});

it('throws on circular dependency', () => {
  const themes = [
    { id: 'a', name: 'A', $extendsThemeId: 'b' },
    { id: 'b', name: 'B', $extendsThemeId: 'a' },
  ];
  expect(() => resolveThemeDependencies(themes)).toThrow(/circular/i);
});
```

**2. Collection Creation Tests (`createNecessaryVariableCollections.test.ts`):**
```typescript
it('creates base collections first, then extended', async () => {
  // Mock themes with parent-child relationship
  // Verify .extend() is called for child themes
  // Verify $figmaParentCollectionId is stored
});

it('uses existing parent collection for extended theme', async () => {
  // When parent collection already exists in Figma
  // Child should be created using parentCollection.extend()
});

it('preserves existing extended collections', async () => {
  // When child collection already exists
  // Should update modes, not recreate
});
```

### Manual Verification Steps

1. **Setup:**
   - Create themes in plugin UI:
     - Base theme (group: "Base", mode: "Light")
     - Base theme (group: "Base", mode: "Dark")
     - Brand A theme (group: "Brand A", mode: "Light", extends: Base/Light)
     - Brand A theme (group: "Brand A", mode: "Dark", extends: Base/Dark)

2. **Push to Figma:**
   - Use "Create variables" or "Sync variables" action
   - Should create:
     - Base collection with Light and Dark modes
     - Brand A collection (extended from Base) with Light and Dark modes

3. **Verify in Figma:**
   - Open Variables panel
   - Brand A collection should show as "extends Base" in Figma UI
   - Brand A should have access to all Base variables

4. **Re-pull and verify:**
   - Pull variables from Figma
   - Themes should have `$figmaParentCollectionId` populated
   - Brand A themes should show "(extends Base)" in UI

---

## Edge Cases to Handle

### 1. Parent Theme Not in Selected Themes

When pushing only child themes without their parent:

**Option A (Recommended):** Require parent to be selected
```typescript
if (theme.$extendsThemeId && !selectedThemes.includes(theme.$extendsThemeId)) {
  // Find parent theme and add to processing list
  // Or throw user-friendly error
}
```

**Option B:** Use existing parent collection if it exists
```typescript
const parentCollection = allCollections.find(c => c.id === parentTheme.$figmaCollectionId);
if (!parentCollection) {
  throw new Error(`Parent collection for "${theme.name}" does not exist. Please sync parent theme first.`);
}
```

### 2. Parent Collection Exists But Theme Doesn't Reference It

When a parent collection exists in Figma but theme doesn't have `$figmaCollectionId`:
- Match by collection name
- Update theme's `$figmaCollectionId` after finding

### 3. Orphaned Child Collections

When parent collection is deleted but child still references it:
- Detect via `parentVariableCollectionId` pointing to non-existent collection
- Either: recreate parent, or create child as standalone (with warning)

### 4. Mode Mismatch Between Parent and Child

Extended collections inherit modes from parent. If theme has different modes:
- Child modes must match parent modes
- Additional modes in child are allowed (added via `addMode`)

---

## Success Criteria for Phase 3

- [ ] `resolveThemeDependencies()` sorts themes correctly
- [ ] Circular dependencies throw clear error message
- [ ] Extended collections created using `.extend()` method
- [ ] `$figmaParentCollectionId` stored on child themes
- [ ] Existing extended collections preserved (not recreated)
- [ ] All existing tests pass (no regressions)
- [ ] New tests for dependency resolution and collection creation
- [ ] Manual verification in Figma confirms parent-child relationship

---

## Files Reference

### Existing Files to Understand

| File | Purpose |
|------|---------|
| `src/plugin/createNecessaryVariableCollections.ts` | Collection creation logic (to modify) |
| `src/plugin/extendedCollectionHelpers.ts` | Helper functions for extended collections |
| `src/types/ThemeObject.ts` | Theme type with `$extendsThemeId` and `$figmaParentCollectionId` |
| `src/types/figma-extended-collections.d.ts` | Type augmentations for Figma API |

### Tests to Reference

| File | Purpose |
|------|---------|
| `src/plugin/pullVariables.test.ts` | Extended collection test patterns |
| `src/plugin/extendedCollectionHelpers.test.ts` | Helper function test patterns |

---

## Figma API Notes

### `.extend()` Method

```typescript
interface VariableCollection {
  /**
   * Creates a new extended variable collection that inherits from this collection.
   * @param name - The name for the new extended collection
   * @returns The newly created extended variable collection
   */
  extend?(name: string): VariableCollection;
}
```

**Important:**
- `.extend()` may not exist on all collections (check `typeof collection.extend === 'function'`)
- The returned collection has `parentVariableCollectionId` set automatically
- Child inherits all variables and modes from parent
- Mode IDs in child are different from parent (use names for mapping)

### Enterprise Limitation (Unknown)

On non-Enterprise accounts, `createVariable` in extended collections throws:
```
"Cannot create variables in extended variable collections"
```

This means brand-only variables must be created in the parent collection. This may or may not be different on Enterprise plans - Phase 6 will verify.

---

## Documentation Links

- **Progress Tracker:** `EXTENDED_COLLECTIONS_PROGRESS.md`
- **Implementation Plan:** `developer-knowledgebase/extended-variable-collections.md`
- **Phase 0-1 Handover:** `PHASE_0_1_HANDOVER.md`
- **Phase 1 Issues & Phase 2 Handover:** `PHASE_1_ISSUES_AND_PHASE_2_HANDOVER.md`
- **Figma Plugin API:** https://www.figma.com/plugin-docs/

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-02  
**Next Phase:** Phase 3 - Create extended collections from themes
