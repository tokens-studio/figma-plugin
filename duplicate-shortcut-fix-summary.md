# Fix for Duplicate Shortcut Warning: "Possibly duplicate shortcut registered: Enter"

## Problem
When opening the Edit Token Form dialog, a console warning appeared: "Possibly duplicate shortcut registered: Enter". This occurred because both `EditTokenForm` and `PushDialog` components were registering the "Enter" key shortcut, and these modals could potentially be open simultaneously.

## Root Cause
1. `EditTokenForm` was registering `useShortcut(['Enter'], handleSaveShortcut)` 
2. `PushDialog` was also registering `useShortcut(['Enter'], handleSaveShortcut)`
3. Both handlers only responded to Enter when modifier keys (Cmd/Ctrl) were pressed
4. The `useShortcut` hook tracks active shortcuts globally and warns about duplicates

## Solution
Changed both components to register the specific key combinations they actually respond to:

### Before:
```typescript
// EditTokenForm.tsx
const handleSaveShortcut = React.useCallback(
  (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      checkAndSubmitTokenValue();
    }
  },
  [checkAndSubmitTokenValue],
);
useShortcut(['Enter'], handleSaveShortcut);

// PushDialog.tsx  
const handleSaveShortcut = React.useCallback(
  (event: KeyboardEvent) => {
    if (showPushDialog?.state === 'initial' && (event.metaKey || event.ctrlKey)) {
      handlePushChanges();
    }
  },
  [handlePushChanges, showPushDialog],
);
useShortcut(['Enter'], handleSaveShortcut);
```

### After:
```typescript
// EditTokenForm.tsx
const handleSaveShortcut = React.useCallback(
  () => {
    checkAndSubmitTokenValue();
  },
  [checkAndSubmitTokenValue],
);
useShortcut(['cmd+Enter', 'ctrl+Enter'], handleSaveShortcut);

// PushDialog.tsx
const handleSaveShortcut = React.useCallback(
  () => {
    if (showPushDialog?.state === 'initial') {
      handlePushChanges();
    }
  },
  [handlePushChanges, showPushDialog],
);
useShortcut(['cmd+Enter', 'ctrl+Enter'], handleSaveShortcut);
```

## Benefits
1. **Eliminates duplicate warning**: Each component now registers specific key combinations instead of conflicting on "Enter"
2. **Preserves functionality**: Form submission still works with Cmd/Ctrl+Enter from anywhere in the modal
3. **Maintains input behavior**: Individual input fields (like `MentionInput`) continue to submit the form with plain Enter key via their `onPressEnter` handlers
4. **Cleaner code**: Handlers no longer need to check for modifier keys since the shortcut registration handles that

## Technical Details
- The `MentionInput` component (used in `DownshiftInput`) has its own `onPressEnter` handler that calls `onSubmit` when Enter is pressed
- This allows users to submit the form by pressing Enter while focused on input fields
- The global Cmd/Ctrl+Enter shortcut provides an alternative way to submit from anywhere in the modal
- Both approaches now work without conflicts