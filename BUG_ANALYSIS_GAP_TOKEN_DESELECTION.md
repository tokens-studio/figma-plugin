# Bug Analysis: Gap Token Deselection Issue

## Problem Summary

When a user **left-clicks** a gap token to deselect it:
- ❌ The gap value disappears from Figma's side panel
- ❌ BUT the token still shows as active in the inspect panel
- ❌ AND the frame's height changes from "hug" to fixed

When a user **right-clicks** and deselects via context menu:
- ✅ Everything works correctly

---

## Root Cause Analysis

### The Critical Difference Between Left-Click and Right-Click

#### **Left-Click Flow** (`MoreButton.tsx` lines 129-139)

```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      handleClick(properties[0]);  // ⚠️ ONLY APPLIES FIRST PROPERTY
    }
  },
  [canEdit, handleEditClick, handleClick, properties],
);
```

**Problem**: Left-click only passes `properties[0]` to `handleClick`, which applies the token to **only the first property** in the properties array.

For spacing tokens, the properties array is (from `usePropertiesForType.ts` lines 8-52):
1. `properties[0]` = **"All" (Properties.spacing)** - NOT itemSpacing!
2. `properties[1]` = **"Gap" (Properties.itemSpacing)** - The actual gap property (inserted at index 0 or 1 based on isMultiValue)
3. `properties[2]` = "Horizontal padding"
4. And so on...

**This means when a user left-clicks a gap token, it attempts to apply/remove Properties.spacing instead of Properties.itemSpacing!**

#### **Right-Click Flow** (via Context Menu in `MoreButtonProperty.tsx`)

```typescript
const handleClick = React.useCallback((e: any) => {
  e.preventDefault();
  onClick(property, isActive);  // ✅ Uses the SPECIFIC property
}, [property, isActive, onClick]);
```

**Key**: Right-click uses the context menu which renders each property individually via `MoreButtonProperty`, allowing the user to select the **exact property** they want to toggle.

---

## The Bug Mechanism

### Step 1: Initial State
- Frame has both `itemSpacing` (gap) and `paddingTop/paddingBottom` (padding) tokens applied
- Frame height is set to "hug"

### Step 2: User Left-Clicks Gap Token to Deselect
1. `handleTokenClick` is called
2. It calls `handleClick(properties[0])` where `properties[0]` might be **the wrong property**
3. The `handleClick` function (lines 114-127):

```typescript
const handleClick = React.useCallback(
  (givenProperties: PropertyObject, isActive = active) => {
    track('Apply Token', { givenProperties });
    const newProps: SelectionValue = {
      [givenProperties.name]: isActive ? 'delete' : token.name,  // ⚠️ Only this property
    };
    if (givenProperties.clear) {
      givenProperties.clear.map((item) => Object.assign(newProps, { [item]: 'delete' }));
    }
    
    setPluginValue(newProps);
  },
  [active, token.name, setPluginValue],
);
```

### Step 3: The Problem with `active` State

The `active` state is calculated by `useGetActiveState` (lines 112):

```typescript
const active = useGetActiveState(activeStateProperties, type, token.name);
```

From `useGetActiveState.ts` (lines 17-24):

```typescript
return (
  uiState.mainNodeSelectionValues[type] === name
  || properties.some((prop) => (
    typeof prop !== 'string'
    && uiState.mainNodeSelectionValues[prop.name] === name
  ))
);
```

**The Issue**: This returns `true` if **ANY** of the properties has this token applied. So if the token is applied to `itemSpacing`, but the user left-clicks and it attempts to remove from a different property (e.g., `paddingTop`), the `active` flag is still `true` because `itemSpacing` is still active.

### Step 4: The "Delete" is Applied to Wrong Property

**Critical Discovery**: `properties[0]` for spacing tokens is `Properties.spacing` (the "All" property), NOT `Properties.itemSpacing`!

When the user left-clicks to deselect a gap token:
- The system attempts to delete `Properties.spacing` (which applies to ALL padding AND itemSpacing)
- The `removeValuesFromNode` function for `Properties.spacing` (lines 125-133) sets:
  ```typescript
  node.paddingLeft = 0;
  node.paddingRight = 0;
  node.paddingTop = 0;
  node.paddingBottom = 0;
  node.itemSpacing = 0;  // ⚠️ This is why the gap disappears from the side panel!
  ```
- BUT the plugin data for `Properties.itemSpacing` is NOT cleared (only `Properties.spacing` plugin data is removed)
- The plugin data for `Properties.itemSpacing` still exists on the node
- This creates the state inconsistency!

---

## The Complete Bug Sequence (Detailed Timeline)

Let me walk through exactly what happens, step by step:

### Initial State
- User has applied a gap token to a frame via the "Gap" property (`Properties.itemSpacing`)
- Node plugin data: `{ itemSpacing: "gap-token-name" }`
- Node physical value: `node.itemSpacing = 16` (or whatever the token value is)
- Frame has `primaryAxisSizingMode = 'AUTO'` (hug contents)
- Inspect panel shows: ✅ Gap token is active

### User Left-Clicks the Gap Token Button

1. **`handleTokenClick` is called** (MoreButton.tsx, line 129)
   - Gets `properties` array from `usePropertiesForTokenType`
   - For spacing tokens, `properties[0]` is the "All" property (Properties.spacing)

2. **`handleClick(properties[0])` is called** (line 135)
   - `properties[0]` = `{ label: 'All', name: Properties.spacing, clear: [...] }`
   - `active` = `true` (because itemSpacing has the token)

3. **Token removal is initiated** (lines 114-127)
   ```typescript
   const newProps: SelectionValue = {
     [givenProperties.name]: isActive ? 'delete' : token.name,
   };
   // newProps = { spacing: 'delete' }
   ```
   - NOTE: The user wanted to delete `itemSpacing`, but we're deleting `spacing`!

4. **`setPluginValue(newProps)` is called** (line 124)
   - Sends message to plugin: `{ spacing: 'delete' }`

5. **Plugin receives SET_NODE_DATA message**
   - Calls `updatePluginDataAndNodes` with `values: { spacing: 'delete' }`

6. **Plugin data removal** (updatePluginDataAndNodes.ts, line 42)
   ```typescript
   case 'delete':
     await removePluginData({ nodes: [node], key: 'spacing', shouldRemoveValues: true });
   ```
   - Clears plugin data for `spacing` key (but `itemSpacing` plugin data still exists!)
   - Calls `removeValuesFromNode(node, 'spacing')`

7. **Physical values are removed** (removeValuesFromNode.ts, lines 125-133)
   ```typescript
   case 'spacing':
     node.paddingLeft = 0;
     node.paddingRight = 0;
     node.paddingTop = 0;
     node.paddingBottom = 0;
     node.itemSpacing = 0;  // ⚠️ Gap disappears from side panel!
   ```
   - The gap value disappears from Figma's side panel

8. **Node sizing mode changes** 
   - When `itemSpacing` is set to 0, Figma may change auto-layout behavior
   - Frame's `primaryAxisSizingMode` may change from 'AUTO' to 'FIXED'
   - Height changes from "hug" to a fixed value

9. **`setValuesOnNode` is called** (updatePluginDataAndNodes.ts, line 55)
   - Reads remaining plugin data from node
   - Finds: `{ itemSpacing: "gap-token-name" }` (still there!)
   - Sees that `itemSpacing` should have a token applied
   - But the physical value is already 0

10. **State inconsistency created**
    - **Side panel**: Shows `itemSpacing = 0` (gap appears removed)
    - **Plugin data**: Still has `{ itemSpacing: "gap-token-name" }`
    - **Inspect panel**: Reads plugin data, shows gap token as active ✅
    - **Height**: Changed from "hug" to fixed

### Result
- ❌ Gap value: Removed (appears gone in side panel)
- ❌ Gap plugin data: Still present (shows active in inspect panel)
- ❌ Height: Changed from "hug" to fixed
- ❌ User confusion: "Why is the token still active?"

### Why Right-Click Works

When user right-clicks and selects "Gap":
1. Context menu shows each property individually
2. User clicks "Gap" → `handleClick` receives `{ label: 'Gap', name: Properties.itemSpacing }`
3. System correctly deletes `itemSpacing` plugin data
4. `removeValuesFromNode(node, 'itemSpacing')` only affects `itemSpacing` (line 167)
5. Everything stays consistent ✅

### Step 6: Height Changes from "Hug" to Fixed

In `applySpacingValuesOnNode.ts` (lines 95-118), when processing `itemSpacing`:

```typescript
if (
  'itemSpacing' in node
  && typeof values.itemSpacing !== 'undefined'
  && typeof data.itemSpacing !== 'undefined'
  && isPrimitiveValue(values.itemSpacing)
) {
  const itemSpacingValue = String(values.itemSpacing);
  
  if (itemSpacingValue === 'AUTO') {
    node.primaryAxisAlignItems = 'SPACE_BETWEEN';
  } else {
    if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
      node.primaryAxisAlignItems = 'MIN';
    }
    if (!(await tryApplyVariableId(node, 'itemSpacing', data.itemSpacing))) {
      node.itemSpacing = transformValue(itemSpacingValue, 'spacing', baseFontSize);
    }
  }
}
```

**The Height Problem**: When the system tries to reconcile the state:
1. The `itemSpacing` token is still in the node's plugin data (not removed)
2. But the system thinks it needs to re-apply it
3. Setting `itemSpacing` on a node in Figma can trigger a change from auto-layout "hug" mode to fixed height, especially if the layout engine needs to recalculate the frame dimensions
4. In `removeValuesFromNode.ts` (lines 166-170), setting `node.itemSpacing = 0` doesn't restore the "hug" mode - it just sets the value to 0

---

## Why Right-Click Works

When using the right-click context menu:
1. Each property is rendered as a separate menu item via `MoreButtonProperty`
2. The user explicitly selects **which property** to toggle
3. The correct property is passed to `handleClick`
4. The `isActive` state is calculated **per property** in `MoreButtonProperty.tsx` (lines 21-23):

```typescript
const isActive = React.useMemo(() => (
  mainNodeSelectionValues[property.name] === value
), [value, property, mainNodeSelectionValues]);
```

5. This ensures the correct property is toggled

---

## Secondary Issue: Plugin Data Not Cleared Properly

Even when the correct property is targeted, there's a timing issue:

1. `updatePluginDataAndNodes` processes deletions (line 42):
   ```typescript
   await removePluginData({ nodes: [node], key: key as Properties, shouldRemoveValues: true });
   ```

2. This calls `removeValuesFromNode` to set `itemSpacing = 0` (lines 166-169 of `removeValuesFromNode.ts`)

3. But then `setValuesOnNode` is called (line 55-62), which might re-apply values based on remaining plugin data

4. If the plugin data wasn't fully cleared, or if there are other tokens referencing the same property, the value gets re-applied

---

## The Inspect Panel Issue

The inspect panel shows tokens as "active" based on `mainNodeSelectionValues`, which is updated by `sendSelectionChange()` after the operation completes.

The issue is:
1. `sendSelectionChange()` is called in `setNodeData.ts` (line 30)
2. It reads the current plugin data from the nodes via `sendPluginValues`
3. If the plugin data wasn't properly cleared for `itemSpacing`, it will still show as active
4. This creates the UI/state inconsistency

---

## Root Causes Summary

### Primary Root Cause
**Left-click uses `properties[0]` which is the "All" property (`Properties.spacing`), not the specific property the user intends to toggle** (`Properties.itemSpacing`).

When a user applies a gap token, they typically:
1. Right-click the token
2. Select "Gap" from the menu
3. This applies the token to `Properties.itemSpacing`

When they left-click to deselect:
1. The code uses `properties[0]` which is `Properties.spacing` (the "All" property)
2. This removes `Properties.spacing` plugin data (which doesn't exist)
3. BUT it calls `removeValuesFromNode(node, 'spacing')` which sets `itemSpacing = 0`
4. The original `Properties.itemSpacing` plugin data remains untouched
5. **Result**: Physical value is removed, but plugin data says token is still active

This creates three observable bugs:
- ❌ Gap disappears from side panel (physical value = 0)
- ❌ Token still shows as active in inspect panel (plugin data still exists)
- ❌ Height changes from "hug" to fixed (side effect of modifying itemSpacing)

### Secondary Root Causes

1. **Ambiguous Active State**: The `useGetActiveState` hook returns `true` if ANY property has the token, making it impossible to know which specific property the user wants to toggle on left-click

2. **No Property Resolution Logic**: There's no logic to determine which property should be toggled when a token can be applied to multiple properties (e.g., spacing tokens can apply to `itemSpacing`, `paddingTop`, `paddingBottom`, `spacing`, etc.)

3. **Side Effects of itemSpacing Modification**: Modifying `itemSpacing` can cause Figma to change the frame's auto-layout mode from "hug" to fixed height, and the current removal logic doesn't account for restoring the original mode

4. **State Synchronization Timing**: The UI state (`mainNodeSelectionValues`) is updated after the plugin data changes, but if the changes were incorrect or incomplete, the state becomes inconsistent

---

## Recommended Fixes

### Fix 1: Disambiguate Left-Click Behavior (Critical)

**Option A - Make Left-Click Context-Aware** (Recommended):
```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      // Determine which property is actually active on the selected node
      const activeProperty = properties.find(prop => 
        mainNodeSelectionValues[prop.name] === token.name
      );
      
      if (activeProperty) {
        // If a property is already active, toggle it off
        handleClick(activeProperty, true);
      } else {
        // If no property is active, apply to the first property
        handleClick(properties[0], false);
      }
    }
  },
  [canEdit, handleEditClick, handleClick, properties, mainNodeSelectionValues, token.name],
);
```

**Option B - Disable Left-Click for Multi-Property Tokens**:
```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      // For tokens with multiple properties, require right-click
      if (properties.length > 1 && active) {
        // Show a tooltip or notification: "Right-click to choose which property to remove"
        return;
      }
      handleClick(properties[0]);
    }
  },
  [canEdit, handleEditClick, handleClick, properties, active],
);
```

### Fix 2: Improve removeValuesFromNode for itemSpacing

Update `removeValuesFromNode.ts` (lines 166-170):
```typescript
case 'itemSpacing':
  if ('itemSpacing' in node && typeof node.itemSpacing !== 'undefined') {
    // Store original primary axis sizing mode
    const originalPrimaryAxisSizingMode = 'primaryAxisSizingMode' in node 
      ? node.primaryAxisSizingMode 
      : undefined;
    
    node.itemSpacing = 0;
    
    // Restore "hug" mode if it was set before
    if (originalPrimaryAxisSizingMode === 'AUTO' && 'primaryAxisSizingMode' in node) {
      node.primaryAxisSizingMode = 'AUTO';
    }
  }
  break;
```

### Fix 3: Improve Active State Calculation

Add a more specific active state check:
```typescript
const activeProperties = React.useMemo(() => {
  return properties.filter((property) => 
    typeof property !== 'string' && 
    mainNodeSelectionValues[property.name] === token.name
  );
}, [properties, mainNodeSelectionValues, token.name]);

const active = activeProperties.length > 0;
```

### Fix 4: Add Validation After Plugin Data Removal

In `updatePluginDataAndNodes.ts`, add validation:
```typescript
switch (value) {
  case 'delete':
    await removePluginData({ nodes: [node], key: key as Properties, shouldRemoveValues: true });
    
    // Verify the data was actually removed
    const remainingData = node.getSharedPluginData(namespace, key);
    if (remainingData && remainingData !== '') {
      console.warn(`Failed to remove plugin data for ${key} on node ${node.id}`);
      // Attempt to clear it again
      node.setSharedPluginData(namespace, key, '');
    }
    break;
}
```

---

## Testing Strategy

### Test Case 1: Left-Click Deselection with Multiple Properties
1. Create a frame with "hug" height
2. Apply a gap token (itemSpacing)
3. Apply a padding token (paddingTop, paddingBottom)
4. Left-click the gap token to deselect
5. **Expected**: Gap token should be removed, height should remain "hug"
6. **Verify**: Inspect panel should not show the gap token as active

### Test Case 2: Right-Click Deselection (Baseline)
1. Same setup as Test Case 1
2. Right-click and select the specific property to remove
3. **Expected**: Should work correctly (baseline behavior)

### Test Case 3: Single Property Token Left-Click
1. Apply a token that only maps to one property
2. Left-click to deselect
3. **Expected**: Should work correctly

### Test Case 4: Multi-Property Token with Partial Application
1. Apply a token to only one of its possible properties
2. Left-click to deselect
3. **Expected**: The correct property should be removed

---

## Impact Assessment

### Severity: **HIGH**
- **User Experience**: Confusing and frustrating behavior
- **Data Integrity**: Causes inconsistent state between UI and actual node data
- **Workaround**: Users must use right-click, but many won't discover this

### Affected Users
- Any user applying tokens to frames with multiple layout properties
- Particularly common with spacing/gap tokens

### Frequency
- **High**: Occurs every time a user left-clicks to deselect a multi-property token

---

## Additional Observations

### Code Quality Issues Identified

1. **Inconsistent Active State Logic**: The `active` state is calculated globally for a token, but should be calculated per-property when a token can apply to multiple properties

2. **Implicit Property Selection**: The code assumes `properties[0]` is the "primary" property, but there's no documentation or guarantee of this

3. **No Undo/Redo Consideration**: When the wrong property is modified, users can't easily undo the operation

4. **Missing Error Handling**: No checks to verify that the property being toggled is actually the one that's active

5. **Coupling Between UI and Plugin Logic**: The `active` state is used to determine whether to add or remove, but this state is based on UI context rather than the actual node state

---

## Files Modified in Fix (Proposed)

1. `/packages/tokens-studio-for-figma/src/app/components/MoreButton/MoreButton.tsx`
   - Update `handleTokenClick` to use context-aware property selection

2. `/packages/tokens-studio-for-figma/src/plugin/removeValuesFromNode.ts`
   - Improve `itemSpacing` removal to preserve auto-layout mode

3. `/packages/tokens-studio-for-figma/src/plugin/updatePluginDataAndNodes.ts`
   - Add validation after plugin data removal

4. `/packages/tokens-studio-for-figma/src/hooks/useGetActiveState.ts`
   - Consider adding a per-property active state hook

---

## Conclusion

The bug is caused by **left-click using `properties[0]` which is the "All" property (`Properties.spacing`)** instead of the specific property that has the token applied (`Properties.itemSpacing`). 

**The exact sequence**:
1. User applies gap token to `Properties.itemSpacing` via right-click menu
2. User left-clicks to deselect → system uses `properties[0]` = `Properties.spacing`
3. System removes `Properties.spacing` plugin data (doesn't exist) but calls `removeValuesFromNode(node, 'spacing')`
4. This sets `itemSpacing = 0` (among all padding values) → gap disappears from side panel
5. BUT `Properties.itemSpacing` plugin data is never removed → inspect panel still shows token as active
6. Setting `itemSpacing = 0` also causes Figma to change the frame's height from "hug" to fixed

**The fix requires**:
- Making left-click behavior context-aware by detecting which property currently has the token applied
- OR requiring users to right-click for multi-property tokens
- OR changing the properties array to prioritize the most commonly used property (e.g., `itemSpacing` for spacing tokens) instead of "All"
