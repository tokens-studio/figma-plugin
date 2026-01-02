# Phase 1 Issues & Phase 2 Handover

**Date:** 2026-01-02  
**Status:** Phase 1 partially complete, Phase 2 required for full functionality  
**Current Issue:** Extended collections don't import properly

---

## Current State Summary

### ✅ What Works (Phase 1 Complete)
- Extended collections are **detected** correctly
- UI shows **"(extends Parent)"** label in Import Variables dialog  
- `parentCollectionId` and `isExtended` fields populate correctly
- All 28 tests pass

### ❌ What Doesn't Work (Requires Phase 2)
- **Brand A themes are created but empty** (0 variable references)
- Variables in extended collections aren't being pulled
- Override values not being read

---

## Root Cause Analysis

### The Problem

When you have:
- **Base collection** with variable "Primary Color" 
- **Brand A collection** (extends Base) with overridden "Primary Color" value

The current code structure causes this flow:

```
1. Get all variables → finds "Primary Color"
2. Check variable.variableCollectionId → points to "Base" (not "Brand A")
3. Process variable for "Base" collection only
4. When processing "Brand A" collection:
   - Filter for variables where variableCollectionId === Brand A's ID
   - Find 0 variables (because they all point to Base)
   - Create empty theme with 0 variable references
```

### Why This Happens

**Current Architecture (Variable-Driven):**
```typescript
for (const variable of allVariables) {
  const collection = getCollectionByIdAsync(variable.variableCollectionId);
  // ↑ This always points to the OWNER collection (parent)
  // Extended collections never get their variables
}
```

**What's Needed (Collection-Driven - Phase 2):**
```typescript
for (const collection of selectedCollections) {
  const variableIds = collection.variableIds; // Includes inherited!
  for (const varId of variableIds) {
    const variable = await getVariableByIdAsync(varId);
    const effectiveValues = await variable.valuesByModeForCollectionAsync(collection);
    // ↑ This returns Brand A's overridden values!
  }
}
```

---

## Debug Logs Analysis

From the console output, we confirmed:

### 1. Collection Detection ✅
```
=== EXTENDED COLLECTIONS DEBUG ===
Collection: "Brand A"
  parentVariableCollectionId: VariableCollectionId:3:152
  isExtended: true
  ← Detection works!
```

### 2. Variable Ownership Issue ❌
```
📦 Found collection for variable "Primary Color": Base ID: VariableCollectionId:3:152
← Variable belongs to Base, not Brand A
```

### 3. Collections Map Pre-Population ✅ (Fixed)
```
🔧 Pre-populating collections Map with selected collections...
  ✅ Pre-populated: "Base" (VariableCollectionId:3:152)
  ✅ Pre-populated: "Brand A" (VariableCollectionId:3:154)
← Both collections now in the map
```

### 4. Theme Creation Issue ❌
```
🎨 Processing collection: "Brand A"
    📋 Processing mode: "Light"
      🔍 Found 0 variables with variableCollectionId === VariableCollectionId:3:154
      🎯 Creating theme: "brand a-light" with 0 variable references
← Theme created but empty
```

---

## Changes Made in This Session

### 1. Added Debug Logging
**Files modified:**
- `src/plugin/asyncMessageHandlers/getAvailableVariableCollections.ts`
- `src/app/components/ImportVariablesDialog.tsx`
- `src/plugin/pullVariables.ts`

**What it shows:**
- Collection detection and parent relationships
- Variable ownership
- Collections Map contents
- Theme creation process
- Final output being sent to UI

### 2. Pre-Populate Collections Map (Partial Fix)
**File:** `src/plugin/pullVariables.ts`

**Change:**
```typescript
// PRE-POPULATE collections Map with selected collections
if (options.selectedCollections) {
  const selectedCollectionIds = Object.keys(options.selectedCollections);
  for (const collectionId of selectedCollectionIds) {
    const collectionData = await figma.variables.getVariableCollectionByIdAsync(collectionId);
    if (collectionData) {
      collections.set(collectionData.name, {
        id: collectionData.id,
        name: collectionData.name,
        modes: collectionData.modes.map((mode) => ({ 
          name: mode.name, 
          modeId: mode.modeId 
        })),
      });
    }
  }
}
```

**Result:**
- ✅ Brand A collection now appears in collections Map
- ✅ Themes are created for Brand A
- ❌ But with 0 variable references (empty)

---

## What Phase 2 Must Do

### Core Refactor Required

**Current flow (Line 49-245 in pullVariables.ts):**
```typescript
// Iterate variables
for (const variable of localVariables) {
  const collection = await getCollectionByIdAsync(variable.variableCollectionId);
  // Process variable.valuesByMode
  // Add to token arrays (colors, numbers, etc.)
}
```

**New flow (Phase 2):**
```typescript
// Iterate selected collections
for (const collectionId of Object.keys(options.selectedCollections)) {
  const collection = await getCollectionByIdAsync(collectionId);
  const variableIds = collection.variableIds; // Includes inherited!
  
  for (const modeId of selectedModes) {
    const mode = collection.modes.find(m => m.modeId === modeId);
    
    for (const variableId of variableIds) {
      const variable = await getVariableByIdAsync(variableId);
      
      // Get effective values for THIS collection (with overrides)
      const effectiveValues = await variable.valuesByModeForCollectionAsync(collection);
      const value = effectiveValues[modeId];
      
      // Process value and add to token array
      // parent: `${collection.name}/${mode.name}`
    }
  }
}
```

### Key API Methods to Use

**For Extended Collections:**
```typescript
// ❌ Don't use - returns owner collection's values
variable.valuesByMode

// ✅ Use this - returns effective values for target collection
await variable.valuesByModeForCollectionAsync(collection)
```

**Mode ID Mapping:**
```typescript
// Parent mode ID: "3:4"
// Child mode ID: "VariableCollectionId:3:154/3:7"
// Map by mode NAME, not ID!
const childMode = childCollection.modes.find(m => m.name === "Light");
```

**Collection Variable IDs:**
```typescript
// Use helper from Phase 0
import { getCollectionVariableIds } from '../extendedCollectionHelpers';
const variableIds = getCollectionVariableIds(collection);
// This includes inherited variables!
```

---

## Testing Strategy for Phase 2

### Test Scenario

**Setup:**
1. Base collection with "Primary Color" variable
   - Light mode: Blue (#0000FF)
   - Dark mode: White (#FFFFFF)
2. Brand A collection (extends Base)
   - Override Light mode: Red (#FF0000)
   - Dark mode: Inherited (White)

**Expected Result After Phase 2:**
```
Token Sets Created:
├─ Base/Light
│  └─ Primary Color: #0000FF (blue)
├─ Base/Dark
│  └─ Primary Color: #FFFFFF (white)
├─ Brand A/Light
│  └─ Primary Color: #FF0000 (red) ← Override!
└─ Brand A/Dark
   └─ Primary Color: #FFFFFF (white) ← Inherited
```

**Themes Created:**
```
- base-light → Base/Light token set
- base-dark → Base/Dark token set
- brand a-light → Brand A/Light token set
- brand a-dark → Brand A/Dark token set
```

### Validation Steps

1. **Import both Base and Brand A**
2. **Check token sets created:**
   - Should see: Base/Light, Base/Dark, Brand A/Light, Brand A/Dark
3. **Check token values:**
   - Brand A/Light should have RED (override value)
   - Brand A/Dark should have WHITE (inherited value)
4. **Check themes:**
   - All 4 themes should exist
   - Each theme should reference its token set
   - Themes should have `$figmaParentCollectionId` for Brand A

---

## Files to Modify in Phase 2

### Primary File
**`src/plugin/pullVariables.ts`** - Complete refactor

**Changes needed:**
1. Replace variable iteration loop (lines 49-245) with collection iteration
2. Use `valuesByModeForCollectionAsync()` instead of `valuesByMode`
3. Map mode IDs by name for extended collections
4. Store parent collection metadata in themes

### Supporting Files
**`src/plugin/pullVariables.test.ts`** - Add tests

**New tests needed:**
- Mock extended collections
- Test override value reading
- Test parent metadata storage
- Test mode ID mapping

### Helper Functions (Optional)
Create new helpers if needed:
- `getEffectiveValuesForCollection(variable, collection, modeId)`
- `mapModeByName(parentMode, childCollection)`

---

## Known Issues & Gotchas

### 1. Mode ID Differences
Parent and child collections have **different mode IDs** even for same-named modes.

**Example:**
```
Base/Light: modeId = "3:4"
Brand A/Light: modeId = "VariableCollectionId:3:154/3:7"
```

**Solution:** Always map by mode **name**, not ID.

### 2. Variable References
When creating variable references for themes:

```typescript
$figmaVariableReferences: {
  'primary-color': 'variable-key-123'
}
```

Make sure to use the variable's actual key, not the mode-specific value.

### 3. Empty Token Sets
If a collection/mode has no variables (all inherited with no overrides), you might create empty token sets. Decide if this is acceptable or if empty sets should be skipped.

### 4. Pro User Gating
Theme creation is gated behind `proUser` check (line 264). Make sure extended collection logic works for both pro and free users.

---

## Current Debug Logging

**To see debug output:**
1. Open Figma Dev Console (Cmd+Option+I / Ctrl+Shift+I)
2. Run plugin and open Import Variables
3. Look for these markers:
   - `🔍 DEBUG: getAvailableVariableCollections called`
   - `🔧 Pre-populating collections Map`
   - `🎨 Processing collection`
   - `📤 FINAL OUTPUT`

**Key metrics to check:**
- Collections Map size (should include Brand A)
- Variables found per collection (0 for Brand A currently)
- Themes to create (should show all themes)
- Processed token sets (should show which sets have tokens)

---

## Recommended Next Steps

### Option 1: Complete Phase 2 Properly
**Effort:** 6-8 hours  
**Impact:** Full extended collection support

**Steps:**
1. Refactor `pullVariables.ts` to be collection-driven
2. Implement `valuesByModeForCollectionAsync()` usage
3. Add comprehensive tests
4. Manual testing with real extended collections
5. Remove debug logging
6. Create changeset

### Option 2: Quick Workaround (Limited)
**Effort:** 2 hours  
**Impact:** Partial support (themes created but values from base, not overrides)

**Steps:**
1. For extended collections, use parent collection's variable IDs
2. Read values from base collection
3. Mark themes with parent collection ID
4. Note in docs that override values not supported yet

**Limitations:**
- Brand A themes will have Base values (blue), not override values (red)
- Good enough for structure but not for actual usage

---

## Questions to Resolve

### 1. Empty Themes Visibility
**Question:** Should themes with 0 variable references be created and shown in UI?

**Current behavior:** Themes are created but may not appear in UI if no token sets exist.

**Options:**
- A: Create themes anyway (users can manually add tokens later)
- B: Skip empty themes (cleaner but might confuse users)

### 2. Override Metadata
**Question:** Should tokens have metadata indicating they're overridden?

**Example:**
```json
{
  "name": "primary-color",
  "value": "#FF0000",
  "$extensions": {
    "studio.tokens": {
      "isOverride": true
    }
  }
}
```

**Options:**
- A: Add metadata (helpful for debugging, increases file size)
- B: Skip metadata (simpler, users won't know which are overrides)

### 3. Parent Theme Reference
**Question:** Should child themes store `$extendsThemeId` referencing parent theme?

**Current:** Themes store `$figmaParentCollectionId` (collection-level)

**Proposed:** Also store `$extendsThemeId` pointing to parent theme's ID

**Benefits:** Could enable UI to show theme hierarchy

---

## Success Criteria for Phase 2

- [ ] Import Brand A creates tokens with RED value (override)
- [ ] Import Brand A creates tokens with WHITE value (inherited)
- [ ] Themes have correct `$figmaParentCollectionId`
- [ ] Token sets created: Base/Light, Base/Dark, Brand A/Light, Brand A/Dark
- [ ] All tests pass
- [ ] No regressions for non-extended collections
- [ ] Debug logging removed or gated

---

## Code Snippets for Next Developer

### Get Variables for Extended Collection
```typescript
const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
const variableIds = getCollectionVariableIds(collection); // From Phase 0 helper

for (const variableId of variableIds) {
  const variable = await figma.variables.getVariableByIdAsync(variableId);
  // Process variable...
}
```

### Get Effective Values
```typescript
// For each mode in the selected modes
for (const modeId of selectedModes) {
  const effectiveValues = await variable.valuesByModeForCollectionAsync(collection);
  const value = effectiveValues[modeId];
  
  if (value !== undefined) {
    // Process this value for this mode
  }
}
```

### Map Mode by Name
```typescript
// Find child mode matching parent mode name
const parentModeName = parentCollection.modes.find(m => m.modeId === parentModeId)?.name;
const childMode = childCollection.modes.find(m => m.name === parentModeName);
const childModeId = childMode?.modeId;
```

---

## Resources

### Documentation
- **Implementation Plan:** `developer-knowledgebase/extended-variable-collections.md`
- **Phase 0-1 Handover:** `PHASE_0_1_HANDOVER.md`
- **Progress Tracker:** `EXTENDED_COLLECTIONS_PROGRESS.md`
- **Validation Guides:** `PHASE_0_VALIDATION.md`, `PHASE_1_VALIDATION.md`

### Key Files
- **Main file to refactor:** `src/plugin/pullVariables.ts` (lines 49-245)
- **Tests:** `src/plugin/pullVariables.test.ts`
- **Helpers:** `src/plugin/extendedCollectionHelpers.ts`
- **Type defs:** `src/types/figma-extended-collections.d.ts`

### API Reference
- **Figma Plugin API:** https://www.figma.com/plugin-docs/
- **Extended Collections:** Undocumented, but properties exist in runtime

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-02  
**Status:** Phase 2 required for full functionality
