# Phase 0 Validation Guide

This guide explains how to validate the Phase 0 implementation of Extended Variable Collections support.

## Quick Validation Checklist

- [ ] All tests pass
- [ ] Build succeeds without errors
- [ ] Types are correctly defined
- [ ] Schema validates new fields
- [ ] Helper functions work correctly
- [ ] No breaking changes to existing functionality
- [ ] Changeset exists

## Detailed Validation Steps

### 1. Run Unit Tests

**Command:**
```bash
cd packages/tokens-studio-for-figma
yarn test --testPathPattern="(extendedCollection|themeObject)" --no-coverage
```

**Expected Result:**
```
Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
```

**What this validates:**
- Helper functions handle API quirks correctly
- Schema validation accepts/rejects appropriate inputs
- Round-trip serialization works with new fields

---

### 2. Verify Build Compiles

**Command:**
```bash
cd packages/tokens-studio-for-figma
yarn build:dev
```

**Expected Result:**
```
webpack 5.88.2 compiled successfully in ~10s
```

**What this validates:**
- TypeScript types are correctly defined
- No compilation errors
- Type augmentations work properly

---

### 3. Run Full Test Suite (Optional but Recommended)

**Command:**
```bash
cd packages/tokens-studio-for-figma
yarn test --no-coverage
```

**Expected Result:**
- All existing tests still pass
- No regressions introduced

**What this validates:**
- No breaking changes to existing functionality
- Schema changes are backward compatible

---

### 4. Verify Type Definitions

**Check the TypeScript compilation for new types:**

```bash
cd packages/tokens-studio-for-figma
npx tsc --noEmit
```

**Expected Result:**
- No TypeScript errors

**Manual check - inspect these files:**

1. `src/types/ThemeObject.ts` - Should have:
   ```typescript
   $extendsThemeId?: string;
   $figmaParentCollectionId?: string;
   ```

2. `src/storage/schemas/themeObjectSchema.ts` - Should validate both fields as optional strings

3. `src/types/VariableCollectionSelection.ts` - Should have:
   ```typescript
   parentCollectionId?: string;
   isExtended?: boolean;
   ```

---

### 5. Verify Changeset Exists

**Command:**
```bash
ls -la .changeset/*.md | grep -v README
```

**Expected Result:**
- At least one changeset file exists (e.g., `tidy-steaks-provide.md`)

**Inspect changeset:**
```bash
cat .changeset/tidy-steaks-provide.md
```

**Should contain:**
```markdown
---
"@tokens-studio/figma-plugin": patch
---

Add foundation for extended variable collections (inheritance) support - Phase 0
```

---

### 6. Test Helper Functions (Interactive)

**Run this in Node REPL to verify helper logic:**

```bash
cd packages/tokens-studio-for-figma
node --loader ts-node/esm
```

```javascript
// Import helpers
import { 
  getParentVariableCollectionId,
  isExtendedCollection,
  getCollectionVariableIds 
} from './src/plugin/extendedCollectionHelpers.ts';

// Test 1: Regular collection (no parent)
const regularCollection = {
  id: 'VariableCollectionId:123',
  name: 'Base',
  modes: [],
  variableIds: ['var1', 'var2']
};

console.log('Regular collection parent:', getParentVariableCollectionId(regularCollection)); // undefined
console.log('Regular collection is extended:', isExtendedCollection(regularCollection)); // false
console.log('Variable IDs:', getCollectionVariableIds(regularCollection)); // ['var1', 'var2']

// Test 2: Extended collection (has parent)
const extendedCollection = {
  id: 'VariableCollectionId:456',
  name: 'Brand A',
  modes: [],
  variableIds: ['var1', 'var2', 'var3'],
  parentVariableCollectionId: 'VariableCollectionId:123'
};

console.log('Extended collection parent:', getParentVariableCollectionId(extendedCollection)); // 'VariableCollectionId:123'
console.log('Extended collection is extended:', isExtendedCollection(extendedCollection)); // true
```

---

### 7. Verify Schema Validation (Interactive)

**Run this in Node REPL:**

```bash
cd packages/tokens-studio-for-figma
node
```

```javascript
const { themeObjectSchema } = require('./src/storage/schemas/themeObjectSchema.ts');
const { TokenSetStatus } = require('./src/constants/TokenSetStatus.ts');

// Test 1: Theme without extended fields (should pass)
const basicTheme = {
  id: 'theme-1',
  name: 'Light',
  selectedTokenSets: { global: 'enabled' }
};
console.log('Basic theme valid:', themeObjectSchema.safeParse(basicTheme).success); // true

// Test 2: Theme with extended fields (should pass)
const extendedTheme = {
  id: 'theme-2',
  name: 'Brand A Light',
  selectedTokenSets: { global: 'enabled' },
  $extendsThemeId: 'theme-1',
  $figmaParentCollectionId: 'VariableCollectionId:123'
};
console.log('Extended theme valid:', themeObjectSchema.safeParse(extendedTheme).success); // true

// Test 3: Invalid extended field type (should fail)
const invalidTheme = {
  id: 'theme-3',
  name: 'Invalid',
  selectedTokenSets: { global: 'enabled' },
  $extendsThemeId: 123 // should be string
};
console.log('Invalid theme valid:', themeObjectSchema.safeParse(invalidTheme).success); // false
```

---

### 8. Check for Breaking Changes

**Verify backward compatibility:**

```bash
cd packages/tokens-studio-for-figma
# Run tests for existing theme-related functionality
yarn test --testPathPattern="theme" --no-coverage
```

**Expected Result:**
- All theme-related tests still pass
- No failures in theme selectors, storage, or state management

**Key files to check didn't break:**
- `src/selectors/__tests__/themeObjectsSelector.test.ts` ✅
- `src/selectors/__tests__/themeByIdSelector.test.ts`
- `src/selectors/__tests__/themeOptionsSelector.test.ts`

---

### 9. Verify No Runtime Impact (Build Size)

**Check that bundle size hasn't grown significantly:**

```bash
cd packages/tokens-studio-for-figma
yarn build:dev
ls -lh dist/*.js | head -5
```

**What to look for:**
- Bundle sizes should be similar to before (Phase 0 only adds types and small helpers)
- No new large dependencies added

---

### 10. Code Review Checklist

**Manual inspection of code quality:**

- [ ] All new files follow existing code style
- [ ] JSDoc comments are present and clear
- [ ] No console.log statements in production code (except in diagnostics module)
- [ ] Proper TypeScript typing (no `any` types)
- [ ] Test coverage includes edge cases
- [ ] Naming conventions consistent with codebase

**Files to review:**
1. `src/plugin/extendedCollectionHelpers.ts` - Pure functions, well-documented
2. `src/plugin/extendedCollectionDiagnostics.ts` - Gated behind feature flag
3. `src/types/figma-extended-collections.d.ts` - Proper type augmentation
4. Test files - Comprehensive coverage

---

## Manual Testing in Figma Plugin (Phase 0 has NO UI changes)

**Important:** Phase 0 makes no behavioral changes. The plugin should work exactly as before.

### Test Steps:

1. **Build and load the plugin:**
   ```bash
   cd packages/tokens-studio-for-figma
   yarn build:dev
   ```

2. **In Figma:**
   - Plugins → Development → Import plugin from manifest
   - Select `packages/tokens-studio-for-figma/manifest.json`
   - Run the plugin

3. **Verify no regressions:**
   - Open the plugin UI
   - Navigate to all tabs (Tokens, Themes, Settings, etc.)
   - No errors in Figma Dev Console (Cmd+Option+I on Mac)
   - Existing functionality works normally

4. **Check diagnostics flag (optional):**
   - Open Figma Dev Console
   - Run:
     ```javascript
     // Enable diagnostics
     await figma.clientStorage.setAsync('debugExtendedCollections', true);
     
     // Check it was set
     const debug = await figma.clientStorage.getAsync('debugExtendedCollections');
     console.log('Debug enabled:', debug); // Should be true
     ```

---

## Validation Checklist Summary

Run these commands in order:

```bash
# 1. Run new tests
cd packages/tokens-studio-for-figma
yarn test --testPathPattern="(extendedCollection|themeObject)" --no-coverage

# 2. Verify build
yarn build:dev

# 3. Run all tests (optional but recommended)
yarn test --no-coverage

# 4. Check changeset
cat ../../.changeset/*.md | grep -v README

# 5. Verify no TypeScript errors
npx tsc --noEmit
```

**All checks should pass ✅**

---

## Expected Test Output

### Helper Tests
```
PASS src/plugin/extendedCollectionHelpers.test.ts
  extendedCollectionHelpers
    getParentVariableCollectionId
      ✓ returns parent collection ID when present as string
      ✓ returns undefined when parentVariableCollectionId is not present
      ✓ returns undefined when parentVariableCollectionId is null
      ✓ returns undefined when parentVariableCollectionId is undefined
      ✓ handles parentVariableCollectionId on prototype
    isExtendedCollection
      ✓ returns true when collection has valid parent ID
      ✓ returns false when collection has no parent ID
      ✓ returns false when parent ID is null
      ✓ returns false when parent ID is empty string
    getCollectionVariableIds
      ✓ returns variable IDs array when present
      ✓ returns empty array when variableIds is not present
      ✓ returns empty array when variableIds is not an array
      ✓ handles variableIds as a getter on prototype
      ✓ returns empty array for inherited variables from extended collection
```

### Schema Tests
```
PASS src/storage/schemas/themeObjectSchema.test.ts
  themeObjectSchema
    ✓ validates a basic theme object without extended fields
    ✓ validates a theme object with all optional fields
    ✓ validates a theme with $extendsThemeId field
    ✓ validates a theme with $figmaParentCollectionId field
    ✓ validates a theme with both extended collection fields
    ✓ rejects a theme without required id field
    ✓ rejects a theme without required name field
    ✓ rejects a theme without selectedTokenSets
    ✓ rejects invalid types for extended fields
    ✓ allows round-trip parsing with extended fields
```

---

## Troubleshooting

### Build fails with TypeScript errors

**Issue:** Property doesn't exist on VariableCollection
**Solution:** Ensure `src/types/figma-extended-collections.d.ts` is in the project

### Tests fail with import errors

**Issue:** `Cannot find module './extendedCollectionHelpers'`
**Solution:** Check that import paths use `./` not `../` for same-directory imports

### Changeset not found

**Issue:** No changeset file exists
**Solution:** Run `yarn changeset` and follow the prompts, selecting "patch" and describing Phase 0 changes

---

## Success Criteria

Phase 0 is complete when:

✅ All 25+ tests pass  
✅ Build compiles without errors  
✅ Types are properly defined and validated  
✅ Helper functions handle edge cases  
✅ Schema accepts new optional fields  
✅ No breaking changes to existing code  
✅ Changeset exists and follows format  
✅ Plugin loads in Figma without errors  
✅ No console errors or warnings  
✅ Documentation is complete  

---

## Next Steps After Validation

Once Phase 0 validation is complete:

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "feat: Phase 0 - Extended variable collections foundation"
   ```

2. **Create PR** with:
   - Link to implementation plan
   - This validation guide
   - Test results
   - Changeset included

3. **Proceed to Phase 1** once merged:
   - Update `getAvailableVariableCollections` handler
   - Surface extended collection info in UI
   - Display inheritance relationships

---

## Questions or Issues?

If validation fails or you encounter issues:

1. Check this document's troubleshooting section
2. Review test output for specific failures
3. Ensure Node.js and Yarn versions match requirements
4. Check that `yarn install` completed successfully
5. Verify you're in the correct directory (`packages/tokens-studio-for-figma`)

**Common commands to reset and retry:**
```bash
# Clean and reinstall
rm -rf node_modules dist
yarn install --frozen-lockfile
yarn build:dev
yarn test --no-coverage
```
