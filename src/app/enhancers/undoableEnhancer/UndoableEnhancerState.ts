import EventEmitter from 'eventemitter3';
import type { AnyAction } from '@/types/redux';

type EventTypes = 'actionsHistoryChanged' | 'actionsHistoryPointerChanged';

type UndoableAction<S = any> = {
  action: AnyAction<true>;
  snapshot: S;
};

type UndoableEnhancerStateType = {
  $e: EventEmitter<EventTypes>;
  // @README this index will be pointing to the last registered action (back to front)
  // when undoing an action this number will increase -- undoing the previous action
  // when redoing an action this number will decrease -- redoing the action it is currently pointing at
  actionsHistoryPointer: number;
  actionsHistory: UndoableAction[];
  undo: () => number;
  redo: () => number;
  push: (...args: UndoableAction[]) => UndoableAction[];
};

export const UndoableEnhancerState: UndoableEnhancerStateType = {
  $e: new EventEmitter<EventTypes>(),
  actionsHistoryPointer: 0,
  actionsHistory: [],
  push: (...args) => {
    UndoableEnhancerState.actionsHistory = [
      ...UndoableEnhancerState.actionsHistory.slice(0, UndoableEnhancerState.actionsHistory.length - UndoableEnhancerState.actionsHistoryPointer),
      ...args,
    ];
    UndoableEnhancerState.actionsHistoryPointer = 0;
    UndoableEnhancerState.$e.emit('actionsHistoryChanged', UndoableEnhancerState.actionsHistory);
    return UndoableEnhancerState.actionsHistory;
  },
  undo: () => {
    const nextIndex = Math.min(
      UndoableEnhancerState.actionsHistory.length,
      UndoableEnhancerState.actionsHistoryPointer + 1,
    );
    if (nextIndex !== UndoableEnhancerState.actionsHistoryPointer) {
      const previousIndex = UndoableEnhancerState.actionsHistoryPointer;
      UndoableEnhancerState.actionsHistoryPointer = nextIndex;
      UndoableEnhancerState.$e.emit('actionsHistoryPointerChanged', previousIndex, nextIndex);
    }
    return UndoableEnhancerState.actionsHistoryPointer;
  },
  redo: () => {
    const nextIndex = Math.max(0, UndoableEnhancerState.actionsHistoryPointer - 1);
    if (nextIndex !== UndoableEnhancerState.actionsHistoryPointer) {
      UndoableEnhancerState.actionsHistoryPointer = nextIndex;
      UndoableEnhancerState.$e.emit('actionsHistoryPointerChanged', UndoableEnhancerState.actionsHistoryPointer);
    }
    return UndoableEnhancerState.actionsHistoryPointer;
  },
};
