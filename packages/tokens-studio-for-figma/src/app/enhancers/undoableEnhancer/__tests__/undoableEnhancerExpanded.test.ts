import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '@/app/store/models';
import { undoableEnhancer } from '../undoableEnhancer';
import { UndoableEnhancerState } from '../UndoableEnhancerState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Store = RematchDispatch<RootModel> & {
  getState(): RematchRootState<RootModel>;
};

// Mock updateTokensOnSources to avoid complex side effects in tests
jest.mock('@/app/store/updateSources', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('UndoableEnhancer - Expanded Functionality', () => {
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
          uiState: {
            api: null,
          },
        },
      },
      models,
    });
  });

  describe('Token Set Operations with Undo', () => {
    it('should track token set creation and allow undo', () => {
      // Add a new token set using reducer directly
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'new-set' });

      // Verify token set was created
      expect(store.getState().tokenState.tokens['new-set']).toBeDefined();

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/addTokenSet');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify token set was removed
      expect(store.getState().tokenState.tokens['new-set']).toBeUndefined();
    });

    it('should track token set deletion and allow undo', () => {
      // First add a set to delete
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'temp-set' });

      // Clear history from the add operation
      UndoableEnhancerState.actionsHistory = [];

      // Delete the token set
      store.dispatch({ type: 'tokenState/deleteTokenSet', payload: 'temp-set' });

      // Verify token set was deleted
      expect(store.getState().tokenState.tokens['temp-set']).toBeUndefined();

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/deleteTokenSet');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify token set was restored
      expect(store.getState().tokenState.tokens['temp-set']).toBeDefined();
    });

    it('should track active token set changes and allow undo', () => {
      // Add another set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'other-set' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Store original active set
      const originalActive = store.getState().tokenState.activeTokenSet;

      // Change active token set
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'other-set' });

      // Verify active token set changed
      expect(store.getState().tokenState.activeTokenSet).toBe('other-set');

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/setActiveTokenSet');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify active token set was restored
      expect(store.getState().tokenState.activeTokenSet).toBe(originalActive);
    });

    it('should track token set renaming and allow undo', () => {
      // Add a set to rename
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'old-name' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Rename the token set
      store.dispatch({ type: 'tokenState/renameTokenSet', payload: { oldName: 'old-name', newName: 'new-name' } });

      // Verify token set was renamed
      expect(store.getState().tokenState.tokens['old-name']).toBeUndefined();
      expect(store.getState().tokenState.tokens['new-name']).toBeDefined();

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/renameTokenSet');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify token set name was restored
      expect(store.getState().tokenState.tokens['old-name']).toBeDefined();
      expect(store.getState().tokenState.tokens['new-name']).toBeUndefined();
    });

    it('should track token set order changes and allow undo', () => {
      // Add more sets
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set-a' });
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set-b' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Get original order
      const originalOrder = Object.keys(store.getState().tokenState.tokens);

      // Change order
      const newOrder = ['set-b', 'global', 'set-a'];
      store.dispatch({ type: 'tokenState/setTokenSetOrder', payload: newOrder });

      // Verify order changed
      expect(Object.keys(store.getState().tokenState.tokens)).toEqual(newOrder);

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/setTokenSetOrder');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify order was restored
      expect(Object.keys(store.getState().tokenState.tokens)).toEqual(originalOrder);
    });
  });

  describe('Bulk Token Operations with Undo', () => {
    it('should track multiple token creation and allow undo', () => {
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

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/createMultipleTokens');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify tokens were removed
      const tokensAfterUndo = store.getState().tokenState.tokens.global;
      expect(tokensAfterUndo.find((t) => t.name === 'token1')).toBeUndefined();
      expect(tokensAfterUndo.find((t) => t.name === 'token2')).toBeUndefined();
    });

    it('should track multiple token edits and allow undo', () => {
      // First create some tokens to edit
      const createTokens = [
        {
          parent: 'global',
          name: 'edit-token1',
          type: 'color' as const,
          value: '#ff0000',
        },
        {
          parent: 'global',
          name: 'edit-token2',
          type: 'color' as const,
          value: '#00ff00',
        },
      ];
      store.dispatch({ type: 'tokenState/createMultipleTokens', payload: createTokens });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Edit multiple tokens
      const editTokens = [
        {
          parent: 'global',
          name: 'edit-token1',
          type: 'color' as const,
          value: '#0000ff', // Changed value
        },
        {
          parent: 'global',
          name: 'edit-token2',
          type: 'color' as const,
          value: '#ffff00', // Changed value
        },
      ];

      store.dispatch({ type: 'tokenState/editMultipleTokens', payload: editTokens });

      // Verify tokens were edited
      const tokens = store.getState().tokenState.tokens.global;
      expect(tokens.find((t) => t.name === 'edit-token1')?.value).toBe('#0000ff');
      expect(tokens.find((t) => t.name === 'edit-token2')?.value).toBe('#ffff00');

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/editMultipleTokens');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify tokens were restored to original values
      const tokensAfterUndo = store.getState().tokenState.tokens.global;
      expect(tokensAfterUndo.find((t) => t.name === 'edit-token1')?.value).toBe('#ff0000');
      expect(tokensAfterUndo.find((t) => t.name === 'edit-token2')?.value).toBe('#00ff00');
    });
  });

  describe('Token Set State Operations with Undo', () => {
    it('should track toggle used token set and allow undo', () => {
      // Add another set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'test-set' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Get original used token set state
      const originalUsedTokenSet = { ...store.getState().tokenState.usedTokenSet };

      // Toggle used token set
      store.dispatch({ type: 'tokenState/toggleUsedTokenSet', payload: 'test-set' });

      // Verify used token set changed
      expect(store.getState().tokenState.usedTokenSet).not.toEqual(originalUsedTokenSet);

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/toggleUsedTokenSet');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify used token set was restored
      expect(store.getState().tokenState.usedTokenSet).toEqual(originalUsedTokenSet);
    });

    it('should track toggle treat as source and allow undo', () => {
      // Add another set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'source-set' });

      // Clear history
      UndoableEnhancerState.actionsHistory = [];

      // Get original used token set state
      const originalUsedTokenSet = { ...store.getState().tokenState.usedTokenSet };

      // Toggle treat as source
      store.dispatch({ type: 'tokenState/toggleTreatAsSource', payload: 'source-set' });

      // Verify used token set changed
      expect(store.getState().tokenState.usedTokenSet).not.toEqual(originalUsedTokenSet);

      // Verify history was tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/toggleTreatAsSource');

      // Undo the action
      UndoableEnhancerState.undo();

      // Verify used token set was restored
      expect(store.getState().tokenState.usedTokenSet).toEqual(originalUsedTokenSet);
    });
  });

  describe('Complex Operations', () => {
    it('should handle multiple operations and undo them in reverse order', () => {
      // Perform multiple operations
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set1' });
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set2' });
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'set1' });

      // Verify all operations were tracked
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(3);

      // Verify final state
      expect(store.getState().tokenState.tokens.set1).toBeDefined();
      expect(store.getState().tokenState.tokens.set2).toBeDefined();
      expect(store.getState().tokenState.activeTokenSet).toBe('set1');

      // Undo operations in reverse order
      UndoableEnhancerState.undo(); // Undo setActiveTokenSet
      expect(store.getState().tokenState.activeTokenSet).toBe('global');

      UndoableEnhancerState.undo(); // Undo addTokenSet(set2)
      expect(store.getState().tokenState.tokens.set2).toBeUndefined();

      UndoableEnhancerState.undo(); // Undo addTokenSet(set1)
      expect(store.getState().tokenState.tokens.set1).toBeUndefined();
    });

    it('should handle redo operations', () => {
      // Add a token set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'redo-test' });

      // Verify it exists
      expect(store.getState().tokenState.tokens['redo-test']).toBeDefined();

      // Undo
      UndoableEnhancerState.undo();
      expect(store.getState().tokenState.tokens['redo-test']).toBeUndefined();

      // Redo
      UndoableEnhancerState.redo();
      expect(store.getState().tokenState.tokens['redo-test']).toBeDefined();
    });
  });
});
