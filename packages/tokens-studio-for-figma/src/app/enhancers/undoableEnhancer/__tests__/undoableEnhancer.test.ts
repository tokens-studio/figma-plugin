import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '@/app/store/models';
import { undoableEnhancer } from '../undoableEnhancer';
import { UndoableEnhancerState } from '../UndoableEnhancerState';
import { UpdateTokenPayload, DeleteTokenPayload, DuplicateTokenPayload } from '@/types/payloads';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Store = RematchDispatch<RootModel> & {
  getState(): RematchRootState<RootModel>;
};

// Mock updateTokensOnSources to avoid complex side effects in tests
jest.mock('@/app/store/updateSources', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('UndoableEnhancer', () => {
  let store: Store;

  beforeEach(() => {
    // Reset the undoable enhancer state before each test
    UndoableEnhancerState.actionsHistory = [];
    UndoableEnhancerState.actionsHistoryPointer = 0;

    store = init<RootModel>({
      redux: {
        enhancers: [undoableEnhancer],
        initialState: {
          tokenState: {
            tokens: {
              global: [
                {
                  name: 'test-token',
                  type: 'color',
                  value: '#ff0000',
                  $extensions: {},
                  description: 'Test token',
                },
              ],
            },
            activeTokenSet: 'global',
            usedTokenSet: { global: TokenSetStatus.ENABLED },
            themes: [],
            activeTheme: {},
            lastSyncedState: JSON.stringify([{ global: [] }, []], null, 2),
            stringTokens: '',
            importedTokens: {
              newTokens: [],
              updatedTokens: [],
            },
            editProhibited: false,
            hasUnsavedChanges: false,
            collapsedTokenSets: [],
            collapsedTokenTypeObj: {},
            checkForChanges: false,
            collapsedTokens: [],
            changedState: {},
            remoteData: {},
            tokenFormat: { format: 'default' },
            tokenSetMetadata: {},
            importedThemes: {
              newThemes: [],
              updatedThemes: [],
            },
            compressedTokens: '',
            compressedThemes: '',
            tokensSize: 0,
            themesSize: 0,
            renamedCollections: null,
          },
        },
      },
      models,
    });
  });

  describe('Current undo functionality', () => {
    it('should track token creation and allow undo', () => {
      const createPayload: UpdateTokenPayload = {
        parent: 'global',
        name: 'new-token',
        type: 'color',
        value: '#00ff00',
        shouldUpdate: false,
      };

      // Create a token using the reducer directly to avoid side effects
      store.dispatch({ type: 'tokenState/createToken', payload: createPayload });

      // Verify token was created
      const tokensAfterCreate = store.getState().tokenState.tokens.global;
      expect(tokensAfterCreate).toHaveLength(2);
      expect(tokensAfterCreate.find((t) => t.name === 'new-token')).toBeDefined();

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/createToken');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify token was removed
      const tokensAfterUndo = store.getState().tokenState.tokens.global;
      expect(tokensAfterUndo).toHaveLength(1);
      expect(tokensAfterUndo.find((t) => t.name === 'new-token')).toBeUndefined();
    });

    it('should track token deletion and allow undo', () => {
      const deletePayload: DeleteTokenPayload = {
        parent: 'global',
        path: 'test-token',
      };

      // Delete the token using the reducer directly
      store.dispatch({ type: 'tokenState/deleteToken', payload: deletePayload });

      // Verify token was deleted
      const tokensAfterDelete = store.getState().tokenState.tokens.global;
      expect(tokensAfterDelete).toHaveLength(0);

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/deleteToken');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify token was restored
      const tokensAfterUndo = store.getState().tokenState.tokens.global;
      expect(tokensAfterUndo).toHaveLength(1);
      expect(tokensAfterUndo.find((t) => t.name === 'test-token')).toBeDefined();
    });

    it('should track token duplication and allow undo', () => {
      const duplicatePayload: DuplicateTokenPayload = {
        parent: 'global',
        oldName: 'test-token',
        newName: 'test-token-copy',
        type: 'color',
        value: '#ff0000',
        tokenSets: ['global'],
      };

      // Duplicate the token using the reducer directly
      store.dispatch({ type: 'tokenState/duplicateToken', payload: duplicatePayload });

      // Verify token was duplicated
      const tokensAfterDuplicate = store.getState().tokenState.tokens.global;
      expect(tokensAfterDuplicate).toHaveLength(2);
      expect(tokensAfterDuplicate.find((t) => t.name === 'test-token-copy')).toBeDefined();

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/duplicateToken');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify duplicated token was removed
      const tokensAfterUndo = store.getState().tokenState.tokens.global;
      expect(tokensAfterUndo).toHaveLength(1);
      expect(tokensAfterUndo.find((t) => t.name === 'test-token-copy')).toBeUndefined();
    });
  });

  describe('Areas NOT covered by undo', () => {
    it('should NOT track token set creation', () => {
      // Add a new token set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'new-set' });

      // Verify token set was created
      expect(store.getState().tokenState.tokens['new-set']).toBeDefined();

      // Verify history was NOT tracked (this is what we want to fix)
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(0);
    });

    it('should NOT track token set deletion', () => {
      // First add a set to delete
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'temp-set' });

      // Clear history from the add operation (not tracked anyway)
      UndoableEnhancerState.actionsHistory = [];

      // Delete the token set
      store.dispatch({ type: 'tokenState/deleteTokenSet', payload: 'temp-set' });

      // Verify token set was deleted
      expect(store.getState().tokenState.tokens['temp-set']).toBeUndefined();

      // Verify history was NOT tracked (this is what we want to fix)
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(0);
    });

    it('should NOT track active token set changes', () => {
      // Add another set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'other-set' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Change active token set
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'other-set' });

      // Verify active token set changed
      expect(store.getState().tokenState.activeTokenSet).toBe('other-set');

      // Verify history was NOT tracked (this is what we want to fix)
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(0);
    });

    it('should NOT track multiple token creation', () => {
      const multipleTokens = [
        {
          parent: 'global',
          name: 'token1',
          type: 'color' as const,
          value: '#ff0000',
        },
        {
          parent: 'global',
          name: 'token2',
          type: 'color' as const,
          value: '#00ff00',
        },
      ];

      // Create multiple tokens
      store.dispatch({ type: 'tokenState/createMultipleTokens', payload: multipleTokens });

      // Verify tokens were created
      const tokens = store.getState().tokenState.tokens.global;
      expect(tokens.find((t) => t.name === 'token1')).toBeDefined();
      expect(tokens.find((t) => t.name === 'token2')).toBeDefined();

      // Verify history was NOT tracked (this is what we want to fix)
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(0);
    });
  });

  describe('Redo functionality', () => {
    it('should support redo after undo', () => {
      const createPayload: UpdateTokenPayload = {
        parent: 'global',
        name: 'test-redo',
        type: 'color',
        value: '#0000ff',
        shouldUpdate: false,
      };

      // Create token
      store.dispatch({ type: 'tokenState/createToken', payload: createPayload });
      expect(store.getState().tokenState.tokens.global).toHaveLength(2);

      // Undo
      UndoableEnhancerState.undo();
      expect(store.getState().tokenState.tokens.global).toHaveLength(1);

      // Redo
      UndoableEnhancerState.redo();
      expect(store.getState().tokenState.tokens.global).toHaveLength(2);
      expect(store.getState().tokenState.tokens.global.find((t) => t.name === 'test-redo')).toBeDefined();
    });
  });
});
