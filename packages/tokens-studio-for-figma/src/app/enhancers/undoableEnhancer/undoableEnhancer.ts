import type {
  Reducer, StoreEnhancerStoreCreator, PreloadedState, StoreEnhancer,
} from 'redux';
import type { AnyAction } from '@/types/redux';
import type { RootState } from '../../store';
import { undoableActionDefinitions } from './undoableActionDefinitions';
import { UndoableEnhancerState } from './UndoableEnhancerState';

type StoreCreator = StoreEnhancerStoreCreator<RootState, AnyAction<true>>;
type AppReducer = Reducer<RootState, AnyAction<true>>;
type AppPreloadedState = PreloadedState<RootState>;

export const undoableEnhancer = ((next: StoreCreator) => (reducer: AppReducer, preloadedState?: AppPreloadedState) => {
  const undoableEnhancerReducer: AppReducer = (state, action) => {
    const undoableAction = undoableActionDefinitions.find((def) => def.type === action.type);
    if (!('meta' in action && action.meta?.silent) && undoableAction) {
      type ActionType = Parameters<typeof undoableAction['getStateSnapshot']>[0];
      const snapshot = undoableAction.getStateSnapshot(action as ActionType, state);
      UndoableEnhancerState.push({ action, snapshot });
    }
    const nextState = reducer(state, action);
    return nextState;
  };
  const store = next(undoableEnhancerReducer, preloadedState);

  UndoableEnhancerState.$e.on('actionsHistoryPointerChanged', (previousIndex: number, nextIndex: number) => {
    const didUndo = nextIndex > previousIndex;
    const actionIndex = didUndo
      ? UndoableEnhancerState.actionsHistory.length - previousIndex - 1
      : UndoableEnhancerState.actionsHistory.length - nextIndex - 1;
    const actionToPerform = UndoableEnhancerState.actionsHistory[actionIndex];
    if (actionToPerform) {
      const actionDefinition = undoableActionDefinitions.find((def) => (
        def.type === actionToPerform.action.type
      ));
      if (actionDefinition) {
        const handler = didUndo ? actionDefinition.undo : actionDefinition.redo;
        handler(store.dispatch, actionToPerform.action, actionToPerform.snapshot);
      }
    }
  });

  return store;
}) as unknown as StoreEnhancer;
