# Phase 1 Validation Guide

This guide explains how to validate the Phase 1 implementation of Extended Variable Collections support.

## Quick Validation Checklist

- [ ] All tests pass (28 total for Phase 0 + Phase 1)
- [ ] Build succeeds without errors
- [ ] Handler populates extended collection fields
- [ ] UI displays inheritance relationships
- [ ] No breaking changes to existing functionality
- [ ] Changeset exists

---

## Automated Validation (2 minutes)

### 1. Run All Related Tests

**Command:**
```bash
cd packages/tokens-studio-for-figma
yarn test --testPathPattern="(extendedCollection|themeObject|getAvailableVariableCollections)" --no-coverage
```

**Expected Result:**
```
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
```

**What this validates:**
- Phase 0 helpers still work (14 tests)
- Phase 0 schema still validates (10 tests)
- Phase 1 handler detects extended collections (3 tests)
- Existing selectors not broken (1 test)

---

### 2. Verify Build

**Command:**
```bash
cd packages/tokens-studio-for-figma
yarn build:dev
```

**Expected Result:**
```
webpack 5.88.2 compiled successfully in ~11s
```

**What this validates:**
- TypeScript types compile correctly
- No import errors
- UI component renders properly

---

### 3. Check Changeset

**Command:**
```bash
cat ../../.changeset/lazy-chefs-run.md
```

**Expected Content:**
```markdown
---
"@tokens-studio/figma-plugin": patch
---

Display extended variable collection relationships in UI - Phase 1
```

---

## Manual Testing in Figma (5 minutes)

### Prerequisites

You need a Figma file with:
- At least one **base** variable collection
- At least one **extended** variable collection (created via `collection.extend()`)

**If you don't have extended collections yet:**

1. Open Figma Dev Console (Cmd+Option+I on Mac / Ctrl+Shift+I on Windows)
2. Run this script to create test collections:

```javascript
(async () => {
  // Create base collection
  const base = figma.variables.createVariableCollection('Base');
  base.addMode('Light');
  base.addMode('Dark');
  
  // Create a variable in base
  const colorVar = figma.variables.createVariable('Primary Color', base, 'COLOR');
  const lightMode = base.modes.find(m => m.name === 'Light').modeId;
  const darkMode = base.modes.find(m => m.name === 'Dark').modeId;
  colorVar.setValueForMode(lightMode, { r: 0, g: 0, b: 1, a: 1 }); // Blue
  colorVar.setValueForMode(darkMode, { r: 1, g: 1, b: 1, a: 1 }); // White
  
  // Create extended collection (if supported)
  if (typeof base.extend === 'function') {
    const brandA = base.extend('Brand A');
    console.log('Created extended collection:', brandA.name);
    console.log('Parent ID:', brandA.parentVariableCollectionId);
  } else {
    console.log('Extended collections not supported on this account');
  }
  
  console.log('Test collections created!');
})();
```

---

### Test Steps

#### Step 1: Build and Load Plugin

```bash
cd packages/tokens-studio-for-figma
yarn build:dev
```

1. In Figma: **Plugins → Development → Import plugin from manifest**
2. Select: `packages/tokens-studio-for-figma/manifest.json`
3. Click **"Import variables"** or navigate to the import dialog

---

#### Step 2: Verify Extended Collection Display

**What to check:**

1. **Open the Import Variables Dialog**
   - Click on "Import variables" in the plugin

2. **Look for extended collections**
   - Base collections should show: `Base`
   - Extended collections should show: `Brand A (extends Base)`

3. **Verify parent name resolution**
   - The parent name should match the actual base collection name
   - If parent is not found, it should show: `(extends parent)`

**Expected Behavior:**

```
☐ Base
  ☐ Light
  ☐ Dark
  
☐ Brand A (extends Base)
  ☐ Light
  ☐ Dark
```

---

#### Step 3: Check Console for Errors

1. Open Figma Dev Console (Cmd+Option+I / Ctrl+Shift+I)
2. Clear console
3. Open the Import Variables dialog
4. Check for errors

**Expected Result:**
- ✅ No errors or warnings
- ✅ Collections load successfully
- ✅ Extended indicator appears

---

#### Step 4: Test Functionality (No Regressions)

**Verify existing features still work:**

1. **Selection works**
   - Click checkboxes to select/deselect collections
   - Click checkboxes to select/deselect modes
   - "Toggle all" button works

2. **Import works**
   - Select a collection (base or extended)
   - Click "Import"
   - Variables are imported as token sets

3. **Options work**
   - "Convert numbers to dimensions" toggles
   - "Use rem for dimension values" toggles

**Expected Result:**
- ✅ All existing functionality works unchanged
- ✅ Extended collections can be selected and imported
- ✅ No errors during import

---

## Unit Test Validation (Detailed)

### Test 1: Extended Collection Detection

**File:** `getAvailableVariableCollections.test.ts`

**What it tests:**
- Handler correctly identifies extended collections
- `parentCollectionId` is populated for extended collections
- `isExtended` flag is set to `true` for extended collections
- Base collections have `isExtended: false`

**Run:**
```bash
yarn test getAvailableVariableCollections --no-coverage
```

**Expected:**
```
✓ should return available variable collections with extended collection info
✓ should handle collections without names
✓ should return empty array if error occurs
```

---

### Test 2: Helper Functions Still Work

**File:** `extendedCollectionHelpers.test.ts`

**What it tests:**
- `getParentVariableCollectionId()` extracts parent ID correctly
- `isExtendedCollection()` identifies extended collections
- `getCollectionVariableIds()` handles getter properties

**Run:**
```bash
yarn test extendedCollectionHelpers --no-coverage
```

**Expected:**
```
14 tests passed
```

---

### Test 3: Schema Validation

**File:** `themeObjectSchema.test.ts`

**What it tests:**
- Themes with `$extendsThemeId` validate
- Themes with `$figmaParentCollectionId` validate
- Round-trip serialization works

**Run:**
```bash
yarn test themeObjectSchema --no-coverage
```

**Expected:**
```
10 tests passed
```

---

## Code Inspection Checklist

### 1. Handler Implementation

**File:** `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts`

**Check:**
- [ ] Imports helper functions from Phase 0
- [ ] Calls `getParentVariableCollectionId(collection)`
- [ ] Calls `isExtendedCollection(collection)`
- [ ] Returns `parentCollectionId` and `isExtended` in response
- [ ] No breaking changes to existing fields

**Key code:**
```typescript
const parentId = getParentVariableCollectionId(collection);

return {
  id: collection.id,
  name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
  modes: collection.modes.map(...),
  parentCollectionId: parentId,
  isExtended: isExtendedCollection(collection),
};
```

---

### 2. UI Component

**File:** `src/app/components/ImportVariablesDialog.tsx`

**Check:**
- [ ] Conditionally renders "(extends ...)" for extended collections
- [ ] Resolves parent name from collections array
- [ ] Fallback to "parent" if name not found
- [ ] Styling uses muted color for inheritance info
- [ ] No breaking changes to layout or functionality

**Key code:**
```tsx
{collection.isExtended && collection.parentCollectionId && (
  <Box as="span" css={{ fontWeight: 'normal', color: '$fgMuted', marginLeft: '$2' }}>
    (extends {collections.find((c) => c.id === collection.parentCollectionId)?.name || 'parent'})
  </Box>
)}
```

---

## Expected UI Screenshots

### Before Phase 1
```
Import variables
──────────────────────────────
☐ Base
  ☐ Light
  ☐ Dark
  
☐ Brand A
  ☐ Light
  ☐ Dark
```

### After Phase 1
```
Import variables
──────────────────────────────
☐ Base
  ☐ Light
  ☐ Dark
  
☐ Brand A (extends Base)
  ☐ Light
  ☐ Dark
```

---

## Debugging Tips

### Issue: Extended collections don't show "(extends ...)"

**Possible causes:**
1. Collections are not actually extended (check `parentVariableCollectionId`)
2. Build is stale (run `yarn build:dev` again)
3. Plugin not reloaded in Figma

**Debug:**
```javascript
// In Figma Dev Console
(async () => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  collections.forEach(c => {
    console.log({
      name: c.name,
      id: c.id,
      parentId: c.parentVariableCollectionId,
      hasExtend: typeof c.extend === 'function'
    });
  });
})();
```

---

### Issue: Parent name shows as "parent" instead of actual name

**Possible causes:**
1. Parent collection ID doesn't match any collection in the list
2. Parent collection was deleted

**Debug:**
```javascript
// Check if parent exists
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const extended = collections.find(c => c.parentVariableCollectionId);
const parent = collections.find(c => c.id === extended.parentVariableCollectionId);
console.log('Parent found:', parent?.name);
```

---

### Issue: Tests fail with import errors

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules dist
yarn install --frozen-lockfile
yarn build:dev
yarn test --no-coverage
```

---

## Success Criteria

Phase 1 is validated when:

✅ **All 28 tests pass** (Phase 0 + Phase 1)  
✅ **Build compiles** without errors  
✅ **Handler populates** `parentCollectionId` and `isExtended`  
✅ **UI displays** inheritance relationships correctly  
✅ **Parent names** resolve properly  
✅ **No console errors** when loading dialog  
✅ **Existing functionality** works unchanged  
✅ **Changeset exists** with proper description  

---

## Integration Test Scenarios

### Scenario 1: Base Collection Only

**Setup:**
- Create one base collection

**Expected:**
- Shows collection name only
- No "(extends ...)" text
- `isExtended: false`

---

### Scenario 2: Base + Extended Collection

**Setup:**
- Create base collection "Foundation"
- Create extended collection "Brand A" from "Foundation"

**Expected:**
- Foundation shows: `Foundation`
- Brand A shows: `Brand A (extends Foundation)`
- Both can be selected independently

---

### Scenario 3: Multiple Extended Collections

**Setup:**
- Create base "Foundation"
- Create extended "Brand A" from "Foundation"
- Create extended "Brand B" from "Foundation"

**Expected:**
- Foundation: `Foundation`
- Brand A: `Brand A (extends Foundation)`
- Brand B: `Brand B (extends Foundation)`

---

### Scenario 4: Nested Extended Collections

**Setup:**
- Create base "Foundation"
- Create extended "Brand A" from "Foundation"
- Create extended "Sub Brand" from "Brand A"

**Expected:**
- Foundation: `Foundation`
- Brand A: `Brand A (extends Foundation)`
- Sub Brand: `Sub Brand (extends Brand A)`

---

## Command Summary

Quick copy-paste commands for validation:

```bash
# Run all tests
cd packages/tokens-studio-for-figma
yarn test --testPathPattern="(extendedCollection|themeObject|getAvailableVariableCollections)" --no-coverage

# Build
yarn build:dev

# Check changeset
cat ../../.changeset/lazy-chefs-run.md

# Run full test suite (optional)
yarn test --no-coverage
```

---

## Next Steps After Validation

Once Phase 1 validation is complete:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: Phase 1 - Display extended variable collection relationships in UI"
   ```

2. **Test in Figma** with real extended collections

3. **Proceed to Phase 2** - Pull variables from extended collections

---

## Questions or Issues?

### Common Issues

**Q: Extended collections don't appear in the list**  
A: Extended collections API may not be available on your Figma plan. Check with the Enterprise test script from the implementation plan.

**Q: Parent name shows as "parent" instead of collection name**  
A: The parent collection might have been deleted or the ID doesn't match. Check collection IDs in the console.

**Q: Tests pass but UI doesn't update**  
A: Rebuild the plugin (`yarn build:dev`) and reload in Figma (Plugins → Development → Stop plugin, then re-run).

**Q: Build fails with TypeScript errors**  
A: Ensure Phase 0 type augmentation file exists: `src/types/figma-extended-collections.d.ts`

---

## Validation Complete!

When all checks pass:
- ✅ Phase 1 is ready for production
- ✅ Users can see inheritance relationships
- ✅ Foundation ready for Phase 2 (pull with overrides)

**Phase 1 successfully enhances the UI to display extended variable collection relationships!** 🎉
