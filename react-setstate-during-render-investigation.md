# React setState During Render Warning Investigation

## Issue Description

The user is experiencing a React warning when editing tokens and hitting save:

```
tokenState.ts:18 Warning: Cannot update a component (`Initiator`) while rendering a different component (`Footer`). To locate the bad setState() call inside `Footer`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
```

## Root Cause Analysis

After investigating the codebase, I found the root cause of this warning:

### Location of the Problem

**File:** `packages/tokens-studio-for-figma/src/hooks/useChangedState.ts`  
**Lines:** 42-47

```typescript
const hasChanges = useMemo(() => {
  const hasChanged = !compareLastSyncedState(tokens, themes, lastSyncedState, tokenFormat);

  dispatch.tokenState.updateCheckForChanges(hasChanged); // ❌ This is the problem!

  return hasChanged;
}, [tokens, themes, lastSyncedState, tokenFormat, dispatch.tokenState]);
```

### Why This Causes the Warning

1. The `useChangedState` hook is called from the `Footer` component
2. Inside the `useMemo` (which runs during render), there's a dispatch call: `dispatch.tokenState.updateCheckForChanges(hasChanged)`
3. This dispatch call triggers a state update in the Redux store
4. The state update causes the `Initiator` component to re-render (since it's connected to the Redux store)
5. React detects that one component (`Footer`) is causing another component (`Initiator`) to update during render, which violates React's rules

### The Chain of Events

1. **Footer component renders** → calls `useChangedState()`
2. **useChangedState hook** → executes `useMemo` during render
3. **useMemo** → calls `dispatch.tokenState.updateCheckForChanges(hasChanged)`
4. **Redux dispatch** → updates the store state
5. **Store update** → triggers re-render of connected components like `Initiator`
6. **React warning** → "Cannot update a component (`Initiator`) while rendering a different component (`Footer`)"

## Solution

The fix is to move the dispatch call out of the `useMemo` and into a `useEffect` instead. This ensures the state update happens after the render phase is complete.

### Recommended Fix

```typescript
// packages/tokens-studio-for-figma/src/hooks/useChangedState.ts

import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react'; // Add useEffect import
import {
  lastSyncedStateSelector,
  remoteDataSelector,
  storageTypeSelector,
  themesListSelector,
  tokensSelector,
} from '@/selectors';
import { findDifferentState } from '@/utils/findDifferentState';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { compareLastSyncedState } from '@/utils/compareLastSyncedState';
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';

export function useChangedState() {
  const remoteData = useSelector(remoteDataSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const storageType = useSelector(storageTypeSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokenFormat = useSelector(tokenFormatSelector);
  const dispatch = useDispatch();

  const changedPushState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(remoteData, {
      tokens,
      themes,
      metadata: storageType.provider !== StorageProviderType.LOCAL ? { tokenSetOrder } : {},
    });
  }, [remoteData, tokens, themes, storageType]);

  const changedPullState = useMemo(() => {
    const tokenSetOrder = Object.keys(tokens);
    return findDifferentState(
      {
        tokens,
        themes,
        metadata: storageType.provider !== StorageProviderType.LOCAL ? { tokenSetOrder } : {},
      },
      remoteData,
    );
  }, [remoteData, tokens, themes, storageType]);

  const hasChanges = useMemo(() => {
    const hasChanged = !compareLastSyncedState(tokens, themes, lastSyncedState, tokenFormat);
    // ❌ Remove the dispatch call from here
    return hasChanged;
  }, [tokens, themes, lastSyncedState, tokenFormat]);

  // ✅ Move the dispatch call to useEffect
  useEffect(() => {
    dispatch.tokenState.updateCheckForChanges(hasChanges);
  }, [hasChanges, dispatch.tokenState]);

  return { changedPushState, changedPullState, hasChanges };
}
```

## Why This Fix Works

1. **Separates computation from side effects**: The `useMemo` now only computes the `hasChanges` value without side effects
2. **Moves side effect to useEffect**: The dispatch call is now in `useEffect`, which runs after the render phase
3. **Maintains the same behavior**: The `updateCheckForChanges` is still called whenever `hasChanges` changes, but now it happens at the right time in the React lifecycle
4. **Eliminates the warning**: React no longer detects a state update during render

## Additional Notes

- This is a common React anti-pattern where side effects (like dispatching actions) are performed during render
- The warning appears intermittently because it depends on the timing of when components render and when the `useMemo` recalculates
- The fix maintains the exact same functionality while following React's best practices