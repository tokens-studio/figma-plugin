import type { Dispatch } from 'redux';
import type { AnyAction } from '@/types/redux';

// @TODO improve dispatch typing
type Effect = (dispatch: Dispatch, action: AnyAction<true>) => void;
type UndoableActionDefinition = {
  type: AnyAction<true>['type'];
  effects?: {
    undo?: Effect[];
    redo?: Effect[];
    any?: Effect[];
  },
};

export const undoableActionDefinitions: UndoableActionDefinition[] = [
  {
    type: 'tokenState/deleteToken',
    effects: {
      any: [
        (dispatch) => dispatch({ type: 'tokenState/updateDocument' }),
      ],
    },
  },
  {
    type: 'tokenState/createToken',
    effects: {
      any: [
        (dispatch) => dispatch({ type: 'tokenState/updateDocument' }),
      ],
    },
  },
  {
    type: 'tokenState/duplicateToken',
    effects: {
      any: [
        (dispatch) => dispatch({ type: 'tokenState/updateDocument' }),
      ],
    },
  },
];
