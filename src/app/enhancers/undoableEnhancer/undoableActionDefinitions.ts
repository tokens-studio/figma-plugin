import type { Dispatch } from 'redux';
import type { AnyAction } from '@/types/redux';
import type { RootState } from '@/app/store';
import { SingleToken } from '@/types/tokens';
import { UpdateTokenPayload } from '@/types/payloads';

// @TODO improve dispatch typing
type Effect<S = any, A extends AnyAction<true> = AnyAction<true>> = (dispatch: Dispatch<AnyAction<true>>, action: A, snapshot: S) => void;
type UndoableActionDefinition<S = any, A extends AnyAction<true> = AnyAction<true>> = {
  type: A['type'];
  undo: Effect<S, A>;
  redo: Effect<S, A>;
  getStateSnapshot: (action: A, state?: RootState) => S;
};

export const undoableActionDefinitions = [
  {
    type: 'tokenState/deleteToken',
    getStateSnapshot: ({ payload }, state) => (
      state?.tokenState.tokens[payload.parent].find((token) => (
        token.name === payload.path
      )) ?? null
    ),
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/deleteToken',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/createToken',
          payload: {
            name: action.payload.path,
            parent: action.payload.parent,
            value: snapshot.value,
            shouldUpdate: true,
            type: snapshot.type,
            description: snapshot.description,
          } as UpdateTokenPayload,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<SingleToken | null, AnyAction<true> & {
    type: 'tokenState/deleteToken'
  }>,
  {
    type: 'tokenState/createToken',
    getStateSnapshot: () => null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/createToken',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, { payload }) => {
      dispatch({
        type: 'tokenState/deleteToken',
        payload: { parent: payload.parent, path: payload.name },
        meta: { silent: true },
      });
    },
  } as UndoableActionDefinition<null, AnyAction<true> & {
    type: 'tokenState/createToken'
  }>,
  {
    type: 'tokenState/duplicateToken',
    getStateSnapshot: () => null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/duplicateToken',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, { payload }) => {
      dispatch({
        type: 'tokenState/deleteToken',
        payload: { parent: payload.parent, path: payload.newName },
        meta: { silent: true },
      });
    },
  } as UndoableActionDefinition<null, AnyAction<true> & {
    type: 'tokenState/duplicateToken'
  }>,
] as UndoableActionDefinition[];
