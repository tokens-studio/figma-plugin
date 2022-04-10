import * as JSONPatch from 'jsondiffpatch';
import extend from 'just-extend';
import type {
  Reducer, StoreEnhancerStoreCreator, PreloadedState, StoreEnhancer,
} from 'redux';
import type { AnyAction } from '@/types/redux';
import type { RootState } from '../../store';
import { undoableActionDefinitions } from './undoableActionDefinitions';
import { UndoableEnhancerState } from './UndoableEnhancerState';
import { BackgroundJobs } from '@/constants/BackgroundJobs';

type StoreCreator = StoreEnhancerStoreCreator<RootState, AnyAction<true>>;
type AppReducer = Reducer<RootState, AnyAction<true>>;
type AppPreloadedState = PreloadedState<RootState>;

export const undoableEnhancer = ((next: StoreCreator) => (reducer: AppReducer, preloadedState?: AppPreloadedState) => {
  const undoableEnhancerReducer: AppReducer = (state, action) => {
    const nextState = reducer(state, action);
    const undoableAction = undoableActionDefinitions.find((def) => def.type === action.type);
    if (undoableAction) {
      const undoDiff = JSONPatch.diff(state, nextState);
      const redoDiff = JSONPatch.diff(nextState, state);
      if (undoDiff && redoDiff) {
        UndoableEnhancerState.push({
          action,
          diff: { undo: undoDiff, redo: redoDiff },
        });
      }
    }
    return nextState;
  };

  const store = next(undoableEnhancerReducer, preloadedState);

  UndoableEnhancerState.$e.on('actionsHistoryPointerChanged', (previousIndex: number, nextIndex: number) => {
    const didUndo = nextIndex > previousIndex;
    const actionToPerform = didUndo
      ? UndoableEnhancerState.actionsHistory[previousIndex]
      : UndoableEnhancerState.actionsHistory[nextIndex];
    if (actionToPerform) {
      const actionDefinition = undoableActionDefinitions.find((def) => (
        def.type === actionToPerform.action.type
      ));
      store.dispatch({
        type: 'uiState/startJob',
        payload: {
          name: didUndo ? BackgroundJobs.UI_UNDOING : BackgroundJobs.UI_REDOING,
          isInfinite: true,
        },
      });
      const currentState = store.getState();
      const diff = didUndo ? actionToPerform.diff.undo : actionToPerform.diff.redo;
      const nextState = JSONPatch.patch(extend(true, {}, currentState), diff) as typeof currentState;
      Object.assign(currentState, nextState);

      const effects = (didUndo ? actionDefinition?.effects?.undo : actionDefinition?.effects?.redo)
        ?? actionDefinition?.effects?.any
        ?? [];
      effects.forEach((effect) => effect(store.dispatch, actionToPerform.action));

      store.dispatch({
        type: 'uiState/completeJob',
        payload: didUndo ? BackgroundJobs.UI_UNDOING : BackgroundJobs.UI_REDOING,
      });
    }
  });

  return store;
}) as unknown as StoreEnhancer;
