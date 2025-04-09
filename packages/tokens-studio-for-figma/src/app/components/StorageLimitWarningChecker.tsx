import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@/app/store';
import useStorageLimitWarning from '@/app/hooks/useStorageLimitWarning';
import { uiStateSelector } from '@/selectors';

export default function StorageLimitWarningChecker() {
  const [hasChecked, setHasChecked] = useState(false);
  const { showStorageLimitWarning } = useStorageLimitWarning();
  const dispatch = useDispatch<Dispatch>();
  const uiState = useSelector(uiStateSelector);

  // We'll rely on the UI state flag instead of client storage
  useEffect(() => {
    setHasChecked(true);
  }, []);

  // Also check for the storageLimitExceeded flag in the UI state
  useEffect(() => {
    async function handleStorageLimitExceeded() {
      // Only show warning if storage limit is exceeded, we've checked, and not already using client storage
      if (uiState.storageLimitExceeded && hasChecked && !uiState.useClientStorageForLocal) {
        try {
          // Show the warning dialog
          const switchToRemote = await showStorageLimitWarning();
          if (!switchToRemote) {
            // User chose to use client storage
            dispatch.uiState.setUseClientStorageForLocal(true);
          }
          // Reset the flag
          dispatch.uiState.setStorageLimitExceeded(false);
        } catch (error) {
          console.error('Error handling storage limit exceeded:', error);
        }
      } else if (uiState.storageLimitExceeded) {
        // Reset the flag if we're already using client storage
        dispatch.uiState.setStorageLimitExceeded(false);
      }
    }

    handleStorageLimitExceeded();
  }, [uiState.storageLimitExceeded, uiState.useClientStorageForLocal, hasChecked, showStorageLimitWarning, dispatch]);

  // This component doesn't render anything
  return null;
}
