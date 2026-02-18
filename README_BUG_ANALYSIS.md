# Bug Analysis Documentation

This directory contains comprehensive analysis of the **Gap Token Deselection Bug**.

## Quick Links

1. **[GAP_TOKEN_BUG_SUMMARY.md](./GAP_TOKEN_BUG_SUMMARY.md)** - Start here for a concise overview
2. **[GAP_TOKEN_BUG_DIAGRAM.md](./GAP_TOKEN_BUG_DIAGRAM.md)** - Visual flow diagrams and comparisons  
3. **[BUG_ANALYSIS_GAP_TOKEN_DESELECTION.md](./BUG_ANALYSIS_GAP_TOKEN_DESELECTION.md)** - Deep technical analysis

---

## The Bug in 30 Seconds

**Problem**: Left-clicking a gap token to deselect it doesn't work properly.

**Why**: 
- Left-click uses `properties[0]` which is the "All" property (`Properties.spacing`)
- But user applied token to `Properties.itemSpacing` (Gap)
- System removes wrong plugin data
- Physical value gets removed as side effect
- Plugin data for `itemSpacing` never gets cleared
- Result: Visual mismatch between UI panels

**Symptoms**:
- Gap value: ❌ Disappears from side panel
- Inspect panel: ❌ Still shows token as active  
- Height: ❌ Changes from "hug" to fixed

**Workaround**: Right-click and select "Gap" from menu (works correctly)

---

## The Fix

Make left-click context-aware by detecting which property has the token applied:

```typescript
// In MoreButton.tsx, line ~135
const activeProperty = properties.find(prop => 
  typeof prop !== 'string' && 
  mainNodeSelectionValues[prop.name] === token.name
);

if (activeProperty) {
  handleClick(activeProperty, true);  // Remove from active property
} else {
  handleClick(properties[0], false);  // Apply to first property
}
```

---

## Key Files to Review

### The Bug Location
- `packages/tokens-studio-for-figma/src/app/components/MoreButton/MoreButton.tsx` (line 135)
  - Uses `properties[0]` instead of detecting active property

### Property Definitions  
- `packages/tokens-studio-for-figma/src/app/hooks/usePropertiesForType.ts` (lines 8-52)
  - Defines `properties[0]` as "All" (spacing), not Gap (itemSpacing)

### Side Effects
- `packages/tokens-studio-for-figma/src/plugin/removeValuesFromNode.ts` (lines 125-133)
  - `Properties.spacing` removal clears `itemSpacing` as side effect

---

## Impact

**Severity**: HIGH  
**Frequency**: Every left-click deselection of gap tokens  
**Users Affected**: Anyone using spacing/gap tokens with auto-layout

---

## Related Patterns

This same bug likely affects:
- Border radius tokens (all vs. individual corners)
- Border width tokens (all sides vs. individual)
- Sizing tokens (width/height combinations)
- Any multi-property token where `properties[0]` != user's applied property

---

## Analysis Methodology

This analysis was performed using:
1. ✅ Code review of all relevant files
2. ✅ Flow tracing through UI → Plugin communication
3. ✅ State analysis of plugin data vs. physical values
4. ✅ Comparison of left-click vs. right-click flows
5. ✅ Identification of side effects and timing issues

**Confidence Level**: Very High (root cause definitively identified)

---

## Next Steps for Development Team

1. **Implement the fix** - Add context-aware property detection
2. **Add tests** - Cover all multi-property token scenarios  
3. **Consider refactoring** - Apply pattern to all similar token types
4. **Update documentation** - Explain property selection behavior
5. **User communication** - Release notes should mention the fix

---

*For detailed technical analysis, see the individual documentation files listed above.*
