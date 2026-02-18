# Code Review Checklist for Gap Token Bug Fix

## Pre-Implementation Review

Before implementing the fix, verify:

- [ ] Understanding of the root cause is complete
- [ ] All affected files have been identified
- [ ] Impact on other token types has been assessed
- [ ] Test strategy is defined
- [ ] Backward compatibility is considered

---

## Implementation Checklist

### Primary Fix: MoreButton.tsx

**File**: `/packages/tokens-studio-for-figma/src/app/components/MoreButton/MoreButton.tsx`

#### Changes Required:

1. **Import mainNodeSelectionValues selector** (if not already imported)
```typescript
import { mainNodeSelectionValuesSelector } from '@/selectors';
```

2. **Add selector to component**
```typescript
const mainNodeSelectionValues = useSelector(mainNodeSelectionValuesSelector);
```

3. **Update handleTokenClick function** (around line 129-139)
```typescript
const handleTokenClick = React.useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    const isMacBrowser = /Mac/.test(navigator.platform);
    if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
      handleEditClick();
    } else {
      // Find which property currently has this token applied
      const activeProperty = properties.find(prop => 
        typeof prop !== 'string' && 
        mainNodeSelectionValues[prop.name] === token.name
      );
      
      if (activeProperty) {
        // Token is active on a specific property - toggle it off
        handleClick(activeProperty, true);
      } else {
        // Token is not active - apply to first property
        handleClick(properties[0], false);
      }
    }
  },
  [canEdit, handleEditClick, handleClick, properties, mainNodeSelectionValues, token.name],
);
```

#### Code Review Points:

- [ ] `mainNodeSelectionValues` is properly imported and used
- [ ] Dependencies array includes all necessary values
- [ ] Logic correctly distinguishes between active and inactive states
- [ ] Edge case: What if multiple properties have the token? (Choose first found)
- [ ] Edge case: What if properties array is empty? (Should not happen, but check)
- [ ] Performance: Is the `.find()` operation efficient enough? (Yes, small array)

---

### Secondary Fix: removeValuesFromNode.ts (Optional Enhancement)

**File**: `/packages/tokens-studio-for-figma/src/plugin/removeValuesFromNode.ts`

#### Enhancement (Optional):

Preserve auto-layout mode when removing itemSpacing:

```typescript
case 'itemSpacing':
  if ('itemSpacing' in node && typeof node.itemSpacing !== 'undefined') {
    // Store the original sizing mode
    const originalPrimaryAxisSizingMode = 'primaryAxisSizingMode' in node 
      ? node.primaryAxisSizingMode 
      : undefined;
    
    node.itemSpacing = 0;
    
    // Restore auto-layout "hug" mode if it was set
    if (originalPrimaryAxisSizingMode === 'AUTO' && 'primaryAxisSizingMode' in node) {
      try {
        node.primaryAxisSizingMode = 'AUTO';
      } catch (e) {
        // If restoration fails, log but don't break
        console.warn('Could not restore primaryAxisSizingMode', e);
      }
    }
  }
  break;
```

#### Code Review Points:

- [ ] Does this enhancement actually preserve "hug" mode? (Needs testing)
- [ ] Are there edge cases where this would cause issues?
- [ ] Is the try-catch necessary? (Yes, Figma may reject the mode change)
- [ ] Should this be a separate fix or bundled with primary fix?

---

## Testing Checklist

### Unit Tests

- [ ] **Test: activeProperty found and removed**
  - Setup: Apply token to itemSpacing, left-click to remove
  - Assert: handleClick called with itemSpacing property and isActive=true

- [ ] **Test: no activeProperty found, apply to first**
  - Setup: No token applied, left-click to apply
  - Assert: handleClick called with properties[0] and isActive=false

- [ ] **Test: multiple properties have token**
  - Setup: Apply token to both itemSpacing and paddingTop
  - Assert: Removes from first found property

- [ ] **Test: properties array is empty**
  - Setup: Token type with no properties
  - Assert: Does not crash, handles gracefully

### Integration Tests

- [ ] **Test: Gap token left-click removal**
  - Apply gap token via right-click → Gap
  - Left-click to remove
  - Verify: Plugin data cleared, physical value = 0, inspect panel shows inactive

- [ ] **Test: Height preservation**
  - Frame with height = "hug"
  - Apply gap token, then remove via left-click
  - Verify: Height remains "hug" (or changes predictably)

- [ ] **Test: Multiple spacing properties**
  - Apply token to Gap, Horizontal Padding, and Top
  - Left-click to remove
  - Verify: Only one property is removed (first active found)

- [ ] **Test: Right-click still works**
  - Apply token via right-click → Gap
  - Remove via right-click → Gap
  - Verify: Still works correctly (regression test)

### Manual Testing

- [ ] **Scenario 1: Basic gap removal**
  1. Create frame with padding and gap tokens
  2. Left-click gap token
  3. Verify gap removed and inspect panel shows inactive

- [ ] **Scenario 2: Multiple frames selected**
  1. Select multiple frames with gap tokens
  2. Left-click to remove
  3. Verify all frames updated correctly

- [ ] **Scenario 3: Nested frames**
  1. Create nested frames with gap tokens
  2. Select parent, left-click to remove
  3. Verify only parent affected

- [ ] **Scenario 4: Undo/Redo**
  1. Apply gap token, remove via left-click
  2. Cmd+Z to undo
  3. Verify token is reapplied correctly

---

## Edge Cases to Consider

### Edge Case 1: Token Applied to Multiple Properties
**Scenario**: User applied the same spacing token to both "Gap" and "Top" padding

**Current Fix Behavior**: Will remove from first active property found

**Question**: Should we:
- A) Remove from all properties at once?
- B) Remove from first found (current)
- C) Show a dialog asking which to remove?

**Recommendation**: Option B (current) - Keep it simple, matches right-click behavior

### Edge Case 2: Properties Array Order Changes
**Scenario**: Future code changes the order of properties array

**Risk**: If "Gap" moves to properties[0], the bug is "fixed" by accident

**Mitigation**: The fix makes behavior independent of array order ✅

### Edge Case 3: Token Applied via "All" Property
**Scenario**: User applied token using "All" (spacing) property

**Current Fix Behavior**: Should detect "spacing" as active and remove it

**Verification Needed**: Test this scenario

### Edge Case 4: Aliased Tokens
**Scenario**: Token references another token (alias)

**Risk**: Does the fix work with aliases?

**Verification Needed**: Test with aliased tokens

---

## Performance Considerations

### Array.find() Performance
- **Operation**: `properties.find(...)` on each click
- **Array size**: Typically 5-10 properties
- **Impact**: Negligible (O(n) where n is small)
- **Verdict**: ✅ Acceptable

### Additional Selector Usage
- **New dependency**: `mainNodeSelectionValues`
- **Re-render trigger**: When selection values change
- **Impact**: Component re-renders when selection changes (expected behavior)
- **Verdict**: ✅ Acceptable

### Memory Impact
- **Additional state**: One more selector
- **Additional logic**: One `.find()` call
- **Impact**: Minimal
- **Verdict**: ✅ Acceptable

---

## Backward Compatibility

### Will this break existing workflows?
- [ ] **No breaking changes** - Only fixes buggy behavior
- [ ] **Right-click flow unchanged** - Still works as before
- [ ] **Apply token unchanged** - Only affects removal
- [ ] **Plugin data format unchanged** - No schema changes

### Migration needed?
- [ ] **No migration required** - Pure bug fix
- [ ] **No data cleanup needed** - Existing inconsistent states will resolve naturally

---

## Documentation Updates

After implementing the fix:

- [ ] Update CHANGELOG.md with bug fix entry
- [ ] Update user documentation (if any) about left-click behavior
- [ ] Add comments in code explaining the property detection logic
- [ ] Document the decision to use first-found property for multiple actives
- [ ] Add JSDoc comments for the updated function

---

## Code Quality Checks

### Before Committing:

- [ ] ESLint passes with no new warnings
- [ ] TypeScript compiles with no errors
- [ ] All existing tests still pass
- [ ] New tests added and passing
- [ ] Code formatted according to project style
- [ ] No console.log statements left in code
- [ ] No commented-out code
- [ ] All TODO comments resolved or removed

### Code Review Questions:

1. **Is the fix minimal?** 
   - ✅ Yes, only modifies the property selection logic

2. **Does it introduce new dependencies?**
   - ✅ Only `mainNodeSelectionValues` selector (already in codebase)

3. **Could this fix be simplified further?**
   - Possibly, but current approach is clear and maintainable

4. **Are there hidden assumptions?**
   - Assumes `mainNodeSelectionValues` is always up-to-date
   - Assumes properties array is never empty
   - Assumes property names match between properties and mainNodeSelectionValues

5. **What could break in the future?**
   - If property name conventions change
   - If mainNodeSelectionValues structure changes
   - If multiple properties can have the same name

---

## Release Checklist

### Pre-Release:

- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Code review approved
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Release notes prepared

### Release Notes Content:

```markdown
## Bug Fixes

### Gap Token Deselection Fix

**Issue**: When left-clicking a gap token to deselect it, the token would appear 
to be removed in the side panel but would still show as active in the inspect panel, 
and the frame's height would change from "hug" to a fixed value.

**Fix**: Left-click now correctly detects which property has the token applied and 
removes it from that specific property, ensuring consistent state between the side 
panel and inspect panel. Frame height behavior is also preserved.

**Workaround (Previous)**: Right-clicking and selecting "Gap" from the context menu 
worked correctly.

**Impact**: This fix improves the user experience when working with spacing/gap tokens 
and auto-layout frames. The right-click workflow continues to work as before.
```

### Post-Release:

- [ ] Monitor for new bug reports related to the fix
- [ ] Check analytics for changes in token usage patterns
- [ ] Gather user feedback
- [ ] Document any new issues discovered

---

## Rollback Plan

If the fix causes issues:

1. **Immediate Rollback**:
   - Revert commit
   - Deploy previous version
   - Communicate to users

2. **Investigation**:
   - Collect error logs
   - Reproduce the issue
   - Identify what was missed in testing

3. **Re-implementation**:
   - Fix the fix
   - Additional testing
   - Phased rollout (if possible)

---

## Success Criteria

The fix is considered successful when:

- [ ] ✅ Left-click removes gap token completely (both plugin data and physical value)
- [ ] ✅ Inspect panel shows token as inactive after removal
- [ ] ✅ Frame height remains "hug" (or changes predictably) after removal
- [ ] ✅ Right-click workflow still works correctly
- [ ] ✅ No new bugs introduced
- [ ] ✅ User reports of the bug stop
- [ ] ✅ All tests pass

---

## Additional Notes

### Related Issues to Watch:

This same pattern may exist in:
- Border radius token deselection
- Border width token deselection  
- Sizing token deselection
- Any other multi-property token type

**Action**: Consider auditing all multi-property token types for the same bug pattern.

### Future Improvements:

1. **Property Priority System**: Define which property is "primary" for each token type
2. **Multi-Property Dialog**: When multiple properties are active, show a dialog to choose
3. **Undo History**: Ensure undo/redo works correctly with the fix
4. **Keyboard Shortcuts**: Consider adding keyboard shortcuts for common operations

---

*Use this checklist during implementation, code review, and testing phases.*
