# Visual Diagram: Gap Token Deselection Bug

## The Flow Comparison

### ✅ RIGHT-CLICK FLOW (Works Correctly)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Right-Clicks Gap Token                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Context Menu Shows All Properties:                          │
│    - All (spacing)                                              │
│    - ✓ Gap (itemSpacing) ← User applied token to this         │
│    - Horizontal padding                                         │
│    - Vertical padding                                           │
│    - etc.                                                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User Clicks "Gap" Menu Item                                 │
│    MoreButtonProperty calculates: isActive = true              │
│    (checks: mainNodeSelectionValues['itemSpacing'] === token)  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. handleClick({ name: 'itemSpacing' }, true)                  │
│    Creates: { itemSpacing: 'delete' }                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Plugin Receives: { itemSpacing: 'delete' }                  │
│    - Removes plugin data for 'itemSpacing' ✓                   │
│    - Calls removeValuesFromNode(node, 'itemSpacing')           │
│    - Sets node.itemSpacing = 0 ✓                               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESULT: ✅ CONSISTENT STATE                                 │
│    - Plugin data: REMOVED ✓                                    │
│    - Physical value: 0 ✓                                       │
│    - Side panel: Shows gap removed ✓                           │
│    - Inspect panel: Shows token inactive ✓                     │
│    - Height: Remains "hug" (or changes predictably) ✓          │
└─────────────────────────────────────────────────────────────────┘
```

---

### ❌ LEFT-CLICK FLOW (Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Left-Clicks Gap Token                                  │
│    (Intends to remove itemSpacing)                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. handleTokenClick() is Called                                │
│    Gets properties array:                                       │
│    - properties[0] = { name: 'spacing', label: 'All' } ⚠️      │
│    - properties[1] = { name: 'itemSpacing', label: 'Gap' }     │
│    - properties[2] = { name: 'horizontalPadding', ... }        │
│    - etc.                                                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Code Executes: handleClick(properties[0])                   │
│    ⚠️ Uses properties[0] = 'spacing', NOT 'itemSpacing'!       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. useGetActiveState() Returns: active = true                  │
│    (Because 'itemSpacing' has the token, even though we're     │
│     trying to remove 'spacing')                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. handleClick({ name: 'spacing' }, true)                      │
│    Creates: { spacing: 'delete' }                              │
│    ⚠️ WRONG PROPERTY!                                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Plugin Receives: { spacing: 'delete' }                      │
│    - Tries to remove plugin data for 'spacing'                 │
│      (Doesn't exist - no effect)                               │
│    - Calls removeValuesFromNode(node, 'spacing')               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. removeValuesFromNode(node, 'spacing') Executes:             │
│    case 'spacing':                                              │
│      node.paddingLeft = 0;                                      │
│      node.paddingRight = 0;                                     │
│      node.paddingTop = 0;                                       │
│      node.paddingBottom = 0;                                    │
│      node.itemSpacing = 0;  ⚠️ SIDE EFFECT!                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. RESULT: ❌ INCONSISTENT STATE                               │
│    - Plugin data for 'itemSpacing': STILL EXISTS ❌            │
│    - Physical value: node.itemSpacing = 0 ❌                   │
│    - Side panel: Shows gap = 0 (appears removed) ❌            │
│    - Inspect panel: Shows token ACTIVE ❌                      │
│    - Height: Changes from "hug" to FIXED ❌                    │
│                                                                 │
│    USER SEES:                                                   │
│    "I removed the gap, but it still shows as active!?"         │
│    "Why did my frame height change to fixed!?"                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Comparison

### Before User Action

```
┌─────────────────────────┐
│ Figma Node              │
├─────────────────────────┤
│ Plugin Data:            │
│   itemSpacing: "token"  │
│                         │
│ Physical Properties:    │
│   itemSpacing: 16       │
│   primaryAxis: 'AUTO'   │
│   (hug contents)        │
└─────────────────────────┘

┌─────────────────────────┐
│ UI State                │
├─────────────────────────┤
│ Side Panel:             │
│   Gap: 16px             │
│                         │
│ Inspect Panel:          │
│   ✓ Gap token active    │
└─────────────────────────┘
```

### After Left-Click (❌ Broken State)

```
┌─────────────────────────┐
│ Figma Node              │
├─────────────────────────┤
│ Plugin Data:            │
│   itemSpacing: "token"  │  ← ❌ STILL THERE!
│                         │
│ Physical Properties:    │
│   itemSpacing: 0        │  ← ❌ REMOVED
│   primaryAxis: 'FIXED'  │  ← ❌ CHANGED!
│   height: 120 (fixed)   │
└─────────────────────────┘

┌─────────────────────────┐
│ UI State                │
├─────────────────────────┤
│ Side Panel:             │
│   Gap: 0px              │  ← User sees this
│                         │
│ Inspect Panel:          │
│   ✓ Gap token active    │  ← ❌ INCONSISTENT!
└─────────────────────────┘
```

### After Right-Click (✅ Correct State)

```
┌─────────────────────────┐
│ Figma Node              │
├─────────────────────────┤
│ Plugin Data:            │
│   (empty)               │  ← ✓ REMOVED
│                         │
│ Physical Properties:    │
│   itemSpacing: 0        │  ← ✓ REMOVED
│   primaryAxis: 'AUTO'   │  ← ✓ PRESERVED
│   (hug contents)        │
└─────────────────────────┘

┌─────────────────────────┐
│ UI State                │
├─────────────────────────┤
│ Side Panel:             │
│   Gap: 0px              │  ← ✓ Consistent
│                         │
│ Inspect Panel:          │
│   ○ Gap token inactive  │  ← ✓ Consistent
└─────────────────────────┘
```

---

## The Root Cause in Code

### The Problem Location

**File**: `/packages/tokens-studio-for-figma/src/app/components/MoreButton/MoreButton.tsx`

```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      handleClick(properties[0]);  // ⚠️ BUG: Always uses first property!
      //                                 For spacing tokens, this is 'spacing' not 'itemSpacing'
    }
  },
  [canEdit, handleEditClick, handleClick, properties],
);
```

### What properties[0] Actually Is

**File**: `/packages/tokens-studio-for-figma/src/app/hooks/usePropertiesForType.ts`

```typescript
const spacingProperties = (value?: SingleToken['value']) => {
  const isMultiValue = typeof value === 'string' && value.split(' ').length > 1;
  const gapIndex = isMultiValue ? 1 : 0;
  const properties = [
    {
      label: 'All',                    // ← properties[0]!
      name: Properties.spacing,        // ← NOT itemSpacing!
      clear: [
        Properties.counterAxisSpacing,
        Properties.horizontalPadding,
        Properties.verticalPadding,
        Properties.paddingLeft,
        Properties.paddingRight,
        Properties.paddingTop,
        Properties.paddingBottom,
      ],
    },
    // ... other properties
  ];

  // Gap is inserted at index 0 or 1
  properties.splice(gapIndex, 0, { 
    label: 'Gap', 
    name: Properties.itemSpacing,     // ← This is what user wants!
    disabled: isMultiValue 
  });
  
  return properties;
};
```

### The Side Effect

**File**: `/packages/tokens-studio-for-figma/src/plugin/removeValuesFromNode.ts`

```typescript
case 'spacing':
  if ('paddingLeft' in node && typeof node.paddingLeft !== 'undefined') {
    node.paddingLeft = 0;
    node.paddingRight = 0;
    node.paddingTop = 0;
    node.paddingBottom = 0;
    node.itemSpacing = 0;  // ⚠️ Side effect: Removes gap even though
    //                          we're not removing 'itemSpacing' plugin data!
  }
  break;
```

---

## Why This Is Hard to Notice

1. **The gap visually disappears** (physical value set to 0)
   - User thinks: "It worked!"
   
2. **Only when checking inspect panel** does the bug become apparent
   - Token still shows as active
   - Plugin data still exists
   
3. **Height change from "hug" to fixed** is a secondary symptom
   - Users may not notice immediately
   - May attribute it to Figma's auto-layout quirks

4. **Right-click works correctly**
   - Provides a workaround
   - Users who discover this may not report the left-click bug

---

## Summary

The bug is a classic case of **incorrect property mapping** where:
- User intends to remove: `itemSpacing` 
- Code actually removes: `spacing` (the "All" property)
- Physical value gets cleared: `node.itemSpacing = 0` (side effect)
- Plugin data remains: `{ itemSpacing: "token" }` (not touched)
- Result: Inconsistent state between physical values and plugin data

The fix is to make left-click **context-aware** by detecting which property actually has the token applied, rather than blindly using `properties[0]`.
