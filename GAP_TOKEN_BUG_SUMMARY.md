# Gap Token Deselection Bug - Summary

## Quick Reference

**Bug Report**: When a user left-clicks a gap token to deselect it, the token is not properly removed.

**Observable Symptoms**:
1. ❌ Gap value disappears from Figma's side panel
2. ❌ Token remains active in the inspect panel  
3. ❌ Frame's height changes from "hug" to fixed value

**Workaround**: Right-clicking and selecting "Gap" from the context menu works correctly.

---

## Root Cause (One-Line Summary)

**Left-click uses `properties[0]` (the "All" property = `Properties.spacing`) instead of the specific property the user applied (`Properties.itemSpacing`), causing plugin data to remain while physical values are removed.**

---

## Detailed Explanation

### How the Token Was Applied (Correct Flow)
1. User right-clicks token
2. Selects "Gap" from menu
3. Token is applied to `Properties.itemSpacing`
4. Plugin data stored: `{ itemSpacing: "token-name" }`
5. Physical value set: `node.itemSpacing = 16`

### What Happens on Left-Click (Buggy Flow)
1. User left-clicks token (intending to remove `itemSpacing`)
2. Code executes: `handleClick(properties[0])`
3. `properties[0]` = `{ name: 'spacing', label: 'All' }` ⚠️
4. System sends: `{ spacing: 'delete' }` to plugin
5. Plugin removes `Properties.spacing` plugin data (doesn't exist)
6. Plugin calls: `removeValuesFromNode(node, 'spacing')`
7. This sets: `node.itemSpacing = 0` (+ all padding values)
8. **BUT** `Properties.itemSpacing` plugin data is never touched!

### Result: Inconsistent State
- **Plugin data**: `{ itemSpacing: "token-name" }` ← Still exists
- **Physical value**: `node.itemSpacing = 0` ← Removed
- **Side panel**: Shows gap = 0 (appears removed)
- **Inspect panel**: Shows token active (reads plugin data)
- **Height**: Changes from "hug" to fixed (side effect)

---

## Why Right-Click Works

The context menu renders each property individually:
- User clicks "Gap" specifically
- System receives: `{ name: 'itemSpacing' }` ✓
- Plugin removes correct plugin data: `itemSpacing` ✓
- Plugin removes correct physical value: `node.itemSpacing = 0` ✓
- Everything stays consistent ✓

---

## Files Involved

### 1. `/packages/tokens-studio-for-figma/src/app/components/MoreButton/MoreButton.tsx`
**Line 135**: `handleClick(properties[0])` ← Bug location

### 2. `/packages/tokens-studio-for-figma/src/app/hooks/usePropertiesForType.ts`
**Lines 8-52**: Defines properties array where `properties[0]` = "All" (spacing)

### 3. `/packages/tokens-studio-for-figma/src/plugin/removeValuesFromNode.ts`
**Lines 125-133**: Removes all spacing values including `itemSpacing` as side effect

### 4. `/packages/tokens-studio-for-figma/src/plugin/pluginData.ts`
**Lines 117-133**: Handles plugin data removal

### 5. `/packages/tokens-studio-for-figma/src/plugin/updatePluginDataAndNodes.ts`
**Lines 38-62**: Orchestrates the removal process

---

## Recommended Fix (Primary Solution)

**Make left-click context-aware** by detecting which property currently has the token:

```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      // NEW: Find which property actually has the token applied
      const activeProperty = properties.find(prop => 
        typeof prop !== 'string' && 
        mainNodeSelectionValues[prop.name] === token.name
      );
      
      if (activeProperty) {
        // If a specific property is active, toggle it
        handleClick(activeProperty, true);
      } else {
        // If no property is active, apply to first property
        handleClick(properties[0], false);
      }
    }
  },
  [canEdit, handleEditClick, handleClick, properties, mainNodeSelectionValues, token.name],
);
```

---

## Alternative Fixes

### Option 2: Change Property Order
Make `itemSpacing` the first property instead of "All":

```typescript
const spacingProperties = (value?: SingleToken['value']) => {
  const isMultiValue = typeof value === 'string' && value.split(' ').length > 1;
  const properties = [
    { label: 'Gap', name: Properties.itemSpacing, disabled: isMultiValue },  // First!
    {
      label: 'All',
      name: Properties.spacing,
      clear: [/* ... */],
    },
    // ... rest
  ];
  return properties;
};
```

**Pros**: Simple change, most users apply gap tokens
**Cons**: Breaks expectations for "All" being first, may affect other token types

### Option 3: Disable Left-Click for Multi-Property Tokens
Show a message: "Right-click to choose which property to remove"

**Pros**: Prevents the bug entirely
**Cons**: Reduces UX, forces users to right-click

---

## Testing Checklist

### Test Case 1: Left-Click Deselection (Currently Fails)
1. ✅ Create a frame with height set to "hug"
2. ✅ Apply a gap token via right-click → Gap
3. ✅ Verify gap appears in side panel and inspect panel shows token active
4. ✅ Left-click the token to deselect
5. ❌ **CURRENT BUG**: Gap disappears from side panel but still shows active in inspect panel
6. ❌ **CURRENT BUG**: Height changes from "hug" to fixed
7. ✅ **AFTER FIX**: Gap should be removed completely, height should stay "hug"

### Test Case 2: Right-Click Deselection (Baseline - Works)
1. ✅ Same setup as Test Case 1
2. ✅ Right-click the token
3. ✅ Click "Gap" menu item
4. ✅ Gap is removed from both side panel and inspect panel
5. ✅ Height remains "hug"

### Test Case 3: Left-Click Application (Should Work)
1. ✅ Create a frame
2. ✅ Left-click a gap token to apply
3. ✅ Token should be applied to first available property
4. ✅ Verify token appears in both side panel and inspect panel

### Test Case 4: Multiple Properties Applied
1. ✅ Apply gap token to "Gap" (itemSpacing)
2. ✅ Apply same token to "Top" padding
3. ✅ Left-click to deselect
4. ✅ **AFTER FIX**: Should show dialog or menu to choose which property to remove
5. ✅ Or should remove the first active property found

---

## Impact Assessment

**Severity**: HIGH
- **Frequency**: Occurs every time user left-clicks to deselect a gap token
- **User Impact**: Confusing, appears to break the plugin
- **Data Integrity**: Creates inconsistent state
- **Workaround**: Right-click (not discoverable)

**Affected Users**: 
- Anyone using gap/spacing tokens with auto-layout frames
- Particularly frustrating for new users who don't know the right-click workaround

**Business Impact**:
- User frustration and loss of trust
- Potential increase in support requests
- Users may avoid using the token feature entirely

---

## Related Issues

This same bug pattern likely affects other multi-property tokens:
- **Spacing tokens**: gap, padding, etc.
- **Border radius tokens**: all corners vs. individual corners
- **Border width tokens**: all sides vs. individual sides
- **Sizing tokens**: width, height, min/max
- **Color tokens**: fill vs. border

The fix should be applied consistently across all token types with multiple properties.

---

## Documentation

See detailed files:
- `BUG_ANALYSIS_GAP_TOKEN_DESELECTION.md` - Complete technical analysis (526 lines)
- `GAP_TOKEN_BUG_DIAGRAM.md` - Visual diagrams and flow charts

---

## Next Steps

1. ✅ **Analysis Complete** - Root cause identified
2. ⏳ **Implement Fix** - Apply recommended solution
3. ⏳ **Add Tests** - Cover all test cases
4. ⏳ **Code Review** - Ensure fix is correct
5. ⏳ **User Testing** - Verify fix resolves issue
6. ⏳ **Deploy** - Release to users

---

## Contact

For questions about this analysis:
- Review the detailed analysis documents
- Check the specific file locations mentioned
- Trace through the flow diagrams

---

*Last Updated: [Current Date]*
*Analyzed by: Senior Code Reviewer Agent*
