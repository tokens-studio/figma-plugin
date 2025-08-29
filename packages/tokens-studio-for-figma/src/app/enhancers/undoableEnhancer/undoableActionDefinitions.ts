import type { Dispatch } from 'redux';
import type { AnyAction } from '@/types/redux';
import type { RootState } from '@/app/store';
import { SingleToken } from '@/types/tokens';
import { UpdateTokenPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

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
  
  // Token Set Operations
  {
    type: 'tokenState/addTokenSet',
    getStateSnapshot: () => null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/addTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, { payload }) => {
      dispatch({
        type: 'tokenState/deleteTokenSet',
        payload: payload,
        meta: { silent: true },
      });
    },
  } as UndoableActionDefinition<null, AnyAction<true> & {
    type: 'tokenState/addTokenSet'
  }>,
  
  {
    type: 'tokenState/deleteTokenSet',
    getStateSnapshot: ({ payload }, state) => {
      if (!state?.tokenState.tokens[payload]) return null;
      return {
        name: payload,
        tokens: state.tokenState.tokens[payload],
        wasActive: state.tokenState.activeTokenSet === payload,
        usedTokenSetStatus: state.tokenState.usedTokenSet[payload],
      };
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/deleteTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        // Restore the token set
        dispatch({
          type: 'tokenState/addTokenSet',
          payload: snapshot.name,
          meta: { silent: true },
        });
        
        // Restore the tokens
        if (snapshot.tokens.length > 0) {
          dispatch({
            type: 'tokenState/setTokens',
            payload: { [snapshot.name]: snapshot.tokens },
            meta: { silent: true },
          });
        }
        
        // Restore active token set if it was active
        if (snapshot.wasActive) {
          dispatch({
            type: 'tokenState/setActiveTokenSet',
            payload: snapshot.name,
            meta: { silent: true },
          });
        }
        
        // Restore used token set status
        if (snapshot.usedTokenSetStatus) {
          // Note: In a real implementation, we'd need access to current state
          // For now, we'll skip this part as it requires store access
        }
      }
    },
  } as UndoableActionDefinition<{
    name: string;
    tokens: SingleToken[];
    wasActive: boolean;
    usedTokenSetStatus?: TokenSetStatus;
  } | null, AnyAction<true> & {
    type: 'tokenState/deleteTokenSet'
  }>,
  
  {
    type: 'tokenState/duplicateTokenSet',
    getStateSnapshot: () => null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/duplicateTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, { payload }) => {
      // payload for duplicateTokenSet is newName, oldName
      // We need to delete the newly created set
      const [newName] = Array.isArray(payload) ? payload : [payload];
      dispatch({
        type: 'tokenState/deleteTokenSet',
        payload: newName,
        meta: { silent: true },
      });
    },
  } as UndoableActionDefinition<null, AnyAction<true> & {
    type: 'tokenState/duplicateTokenSet'
  }>,
  
  {
    type: 'tokenState/renameTokenSet',
    getStateSnapshot: ({ payload }) => ({
      oldName: payload.oldName,
      newName: payload.newName,
    }),
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/renameTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/renameTokenSet',
          payload: { oldName: snapshot.newName, newName: snapshot.oldName },
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<{
    oldName: string;
    newName: string;
  } | null, AnyAction<true> & {
    type: 'tokenState/renameTokenSet'
  }>,
  
  {
    type: 'tokenState/setTokenSetOrder',
    getStateSnapshot: (action, state) => {
      if (!state?.tokenState.tokens) return null;
      return Object.keys(state.tokenState.tokens);
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/setTokenSetOrder',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/setTokenSetOrder',
          payload: snapshot,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<string[] | null, AnyAction<true> & {
    type: 'tokenState/setTokenSetOrder'
  }>,
  
  // Token Set State Operations
  {
    type: 'tokenState/setActiveTokenSet',
    getStateSnapshot: (action, state) => state?.tokenState.activeTokenSet || null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/setActiveTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/setActiveTokenSet',
          payload: snapshot,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<string | null, AnyAction<true> & {
    type: 'tokenState/setActiveTokenSet'
  }>,
  
  {
    type: 'tokenState/toggleUsedTokenSet',
    getStateSnapshot: (action, state) => {
      if (!state?.tokenState.usedTokenSet) return null;
      return { ...state.tokenState.usedTokenSet };
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/toggleUsedTokenSet',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/setUsedTokenSet',
          payload: snapshot,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<Record<string, TokenSetStatus> | null, AnyAction<true> & {
    type: 'tokenState/toggleUsedTokenSet'
  }>,
  
  {
    type: 'tokenState/toggleTreatAsSource',
    getStateSnapshot: (action, state) => {
      if (!state?.tokenState.usedTokenSet) return null;
      return { ...state.tokenState.usedTokenSet };
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/toggleTreatAsSource',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        dispatch({
          type: 'tokenState/setUsedTokenSet',
          payload: snapshot,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<Record<string, TokenSetStatus> | null, AnyAction<true> & {
    type: 'tokenState/toggleTreatAsSource'
  }>,
  
  // Bulk Token Operations
  {
    type: 'tokenState/createMultipleTokens',
    getStateSnapshot: () => null,
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/createMultipleTokens',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, { payload }) => {
      // Delete all the tokens that were created
      payload.forEach((token: any) => {
        dispatch({
          type: 'tokenState/deleteToken',
          payload: { parent: token.parent, path: token.name },
          meta: { silent: true },
        });
      });
    },
  } as UndoableActionDefinition<null, AnyAction<true> & {
    type: 'tokenState/createMultipleTokens'
  }>,
  
  {
    type: 'tokenState/editMultipleTokens',
    getStateSnapshot: ({ payload }, state) => {
      if (!state?.tokenState.tokens) return null;
      
      const originalTokens: Array<{ parent: string; name: string; originalData: SingleToken | null }> = [];
      payload.forEach((editToken: any) => {
        const tokenSet = state.tokenState.tokens[editToken.parent];
        if (tokenSet) {
          const originalToken = tokenSet.find((token) => token.name === editToken.name);
          originalTokens.push({
            parent: editToken.parent,
            name: editToken.name,
            originalData: originalToken ? { ...originalToken } : null,
          });
        }
      });
      
      return originalTokens;
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/editMultipleTokens',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        const restorePayload = snapshot
          .filter((item) => item.originalData)
          .map((item) => ({
            parent: item.parent,
            name: item.name,
            type: item.originalData!.type,
            value: item.originalData!.value,
            description: item.originalData!.description,
            $extensions: item.originalData!.$extensions,
          }));
        
        if (restorePayload.length > 0) {
          dispatch({
            type: 'tokenState/editMultipleTokens',
            payload: restorePayload,
            meta: { silent: true },
          });
        }
      }
    },
  } as UndoableActionDefinition<Array<{
    parent: string;
    name: string;
    originalData: SingleToken | null;
  }> | null, AnyAction<true> & {
    type: 'tokenState/editMultipleTokens'
  }>,
  
  // Token Group Operations
  {
    type: 'tokenState/deleteTokenGroup',
    getStateSnapshot: ({ payload }, state) => {
      if (!state?.tokenState.tokens[payload.parent]) return null;
      
      // Find all tokens that match the group pattern
      const deletedTokens = state.tokenState.tokens[payload.parent].filter(
        (token) => token.name.startsWith(`${payload.path}.`) && token.type === payload.type
      );
      
      return {
        parent: payload.parent,
        path: payload.path,
        type: payload.type,
        deletedTokens,
      };
    },
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/deleteTokenGroup',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot && snapshot.deletedTokens.length > 0) {
        // Restore all deleted tokens
        const tokensToRestore = snapshot.deletedTokens.map((token) => ({
          parent: snapshot.parent,
          name: token.name,
          type: token.type,
          value: token.value,
          description: token.description,
          $extensions: token.$extensions,
        }));
        
        dispatch({
          type: 'tokenState/createMultipleTokens',
          payload: tokensToRestore,
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<{
    parent: string;
    path: string;
    type: string;
    deletedTokens: SingleToken[];
  } | null, AnyAction<true> & {
    type: 'tokenState/deleteTokenGroup'
  }>,
  
  {
    type: 'tokenState/renameTokenGroup',
    getStateSnapshot: ({ payload }) => ({
      parent: payload.parent,
      oldName: payload.oldName,
      newName: payload.newName,
      type: payload.type,
    }),
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/renameTokenGroup',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        // Rename back to original name
        dispatch({
          type: 'tokenState/renameTokenGroup',
          payload: {
            parent: snapshot.parent,
            oldName: snapshot.newName,
            newName: snapshot.oldName,
            type: snapshot.type,
          },
          meta: { silent: true },
        });
      }
    },
  } as UndoableActionDefinition<{
    parent: string;
    oldName: string;
    newName: string;
    type: string;
  } | null, AnyAction<true> & {
    type: 'tokenState/renameTokenGroup'
  }>,
  
  {
    type: 'tokenState/duplicateTokenGroup',
    getStateSnapshot: ({ payload }) => ({
      parent: payload.parent,
      oldName: payload.oldName,
      newName: payload.newName,
      type: payload.type,
      tokenSets: payload.tokenSets,
    }),
    redo: (dispatch, action) => {
      dispatch({
        type: 'tokenState/duplicateTokenGroup',
        payload: action.payload,
        meta: { silent: true },
      });
    },
    undo: (dispatch, action, snapshot) => {
      if (snapshot) {
        // Delete all the duplicated tokens from all affected token sets
        snapshot.tokenSets.forEach((tokenSetName: string) => {
          dispatch({
            type: 'tokenState/deleteTokenGroup',
            payload: {
              parent: tokenSetName,
              path: snapshot.newName,
              type: snapshot.type,
            },
            meta: { silent: true },
          });
        });
      }
    },
  } as UndoableActionDefinition<{
    parent: string;
    oldName: string;
    newName: string;
    type: string;
    tokenSets: string[];
  } | null, AnyAction<true> & {
    type: 'tokenState/duplicateTokenGroup'
  }>,
] as UndoableActionDefinition[];
