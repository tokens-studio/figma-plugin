import { useCallback, useEffect, useState } from 'react';
import { UndoableEnhancerState } from '../enhancers/undoableEnhancer/UndoableEnhancerState';

export function useActionsHistory() {
  const [actionsHistory, setActionsHistory] = useState(UndoableEnhancerState.actionsHistory);

  const updateActionsHistory = useCallback(() => {
    // use this to wait for the current stack to clear
    // so we don't trigger the useSelector hooks whilst the previous reducer
    // is still running
    setTimeout(() => {
      setActionsHistory(UndoableEnhancerState.actionsHistory);
    }, 0);
  }, []);

  useEffect(() => {
    UndoableEnhancerState.$e.on('actionsHistoryChanged', updateActionsHistory);
  }, [updateActionsHistory]);

  return actionsHistory;
}
