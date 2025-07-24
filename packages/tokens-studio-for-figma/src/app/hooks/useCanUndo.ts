import { useCallback, useEffect, useState } from 'react';
import { UndoableEnhancerState } from '../enhancers/undoableEnhancer/UndoableEnhancerState';

export function useCanUndo() {
  const [canUndo, setCanUndo] = useState(false);

  const updateCanUndo = useCallback(() => {
    // use this to wait for the current stack to clear
    // so we don't trigger the useSelector hooks whilst the previous reducer
    // is still running
    setTimeout(() => {
      const nextCanUndo = (
        UndoableEnhancerState.actionsHistory.length > 0
        && UndoableEnhancerState.actionsHistoryPointer < UndoableEnhancerState.actionsHistory.length
      );
      setCanUndo(nextCanUndo);
    }, 0);
  }, []);

  useEffect(() => {
    UndoableEnhancerState.$e.on('actionsHistoryChanged', updateCanUndo);
    UndoableEnhancerState.$e.on('actionsHistoryPointerChanged', updateCanUndo);
  }, [updateCanUndo]);

  return canUndo;
}
