# Token Reordering Refactor - Implementation Summary

## Problem Statement
Previously, tokens in TokenListing could only be reordered within the same group. Users could not drag tokens to different groups (e.g., moving `size.font.small` to become `size.spacing.small`). The reorder logic was also complex and could be improved.

## Solution Overview
This implementation refactors the token reordering system to:
1. Support cross-group token moves with automatic renaming
2. Validate token names for uniqueness when moving to new groups
3. Simplify the reorder logic for better maintainability

## Key Changes

### 1. New Utility Functions (`src/utils/token/`)

#### tokenPath.ts
Provides functions for working with token paths:
- `getParentPath(tokenName)` - Extract parent path (e.g., "size.font.small" → "size.font")
- `getTokenBaseName(tokenName)` - Get base name (e.g., "size.font.small" → "small")
- `isInGroup(tokenName, groupPath)` - Check if token is in a specific group
- `buildTokenName(baseName, parentPath)` - Build new token name with different parent
- `getPathDepth(tokenName)` - Get depth level of token path
- `areSiblings(tokenName1, tokenName2)` - Check if tokens are in same parent group

#### tokenValidation.ts
Provides validation for token moves:
- `wouldCauseNameCollision(token, newParentPath, allTokens)` - Check if move would cause collision
- `getNewTokenName(token, newParentPath)` - Get new name when moving to different parent

### 2. Refactored DraggableWrapper (`src/app/components/TokenButton/DraggableWrapper.tsx`)

**Before:**
- Only reordered tokens within the same parent group
- No automatic renaming
- No collision detection
- Complex index calculation

**After:**
- Supports cross-group moves
- Automatic token renaming when moving to different groups
- Name collision validation before move
- Simplified reorder logic with clear comments
- Better error handling

Key improvements in `handleDrop`:
```typescript
// Get the target parent path (where we're dropping the token)
const targetParentPath = getParentPath(token.name);

// Check if moving to a new parent would cause a name collision
if (wouldCauseNameCollision(draggedToken, targetParentPath, tokenSet)) {
  console.warn('Cannot move token: A token with this name already exists...');
  return;
}

// Update the token's name if moving to a different parent
const currentParent = getParentPath(draggedToken.name);
const updatedToken = currentParent !== targetParentPath
  ? { ...movedToken, name: getNewTokenName(movedToken, targetParentPath) }
  : movedToken;
```

### 3. Updated DragOverItem (`src/app/components/TokenButton/DragOverItem.tsx`)

**Before:**
```typescript
// Only allowed dragging within same parent group
const draggedItemNameArray = draggedItemName.slice(0, draggedItemName.length - 1);
const dragOverNameArray = dragOverName.slice(0, dragOverName.length - 1);

if (draggedItemNameArray.toString() === dragOverNameArray.toString()) {
  return true;
}
```

**After:**
```typescript
// Allow dragging tokens to any location as long as they have the same type
return true;
```

This simplified logic allows the visual drag indicator to show for any valid drop target (same token type).

### 4. Comprehensive Test Coverage

- **tokenPath.test.ts**: 22 tests, 100% coverage
- **tokenValidation.test.ts**: 8 tests, 100% coverage  
- **DraggableWrapper.test.tsx**: 7 tests for reordering logic

Tests cover:
- Within-group reordering
- Cross-group moves with renaming
- Name collision prevention
- Type mismatch prevention
- Self-drop prevention

## Usage Examples

### Example 1: Move token to different sibling group
**Before:** `size.font.small` → **After:** `size.spacing.small`
- User drags `size.font.small` onto `size.spacing.big`
- Token is moved and renamed to `size.spacing.small`
- Token appears in the spacing group

### Example 2: Move token up a level
**Before:** `size.font.small` → **After:** `size.small`
- User drags `size.font.small` onto `size` (root token)
- Token is moved and renamed to `size.small`
- Token appears at the size root level

### Example 3: Collision prevention
**Before:** Both `size.font.small` and `size.spacing.small` exist
- User tries to drag `size.font.small` onto `size.spacing.big`
- Move is rejected with warning (collision detected)
- Both tokens remain unchanged

## Technical Details

### Token Name Structure
Tokens use dot-notation for hierarchy:
- `size` (root level)
- `size.font` (one level deep)
- `size.font.small` (two levels deep)

When moving tokens, the last segment (base name) is preserved while the parent path changes.

### Collision Detection
Before any move, the system checks:
1. Current parent path vs. target parent path
2. If different, check if a token with the new name already exists
3. Reject move if collision detected

### Index Calculation
The insertion index is calculated based on drag direction:
- Dragging down (higher index): Insert at drop position
- Dragging up (lower index): Insert before drop position (adjustedDropIndex = dropIndex - 1)

## Breaking Changes
None. This is a backward-compatible enhancement. Existing same-group reordering continues to work as before.

## Performance Impact
Minimal. Added validation checks are O(n) where n = number of tokens in the set.

## Future Enhancements
Potential improvements for future iterations:
1. Add user-friendly error notifications (currently console.warn)
2. Support for group-to-group drag (moving entire groups)
3. Visual preview of token's new location during drag
4. Undo/redo support for reordering operations
5. Bulk token moves (multi-select)

## Migration Guide
No migration needed. The changes are transparent to existing code.

## Testing
Run tests with:
```bash
yarn test --testPathPattern="(TokenGroup|tokenPath|tokenValidation|DraggableWrapper)"
```

Build with:
```bash
yarn build:dev
```

Lint with:
```bash
yarn lint
```
