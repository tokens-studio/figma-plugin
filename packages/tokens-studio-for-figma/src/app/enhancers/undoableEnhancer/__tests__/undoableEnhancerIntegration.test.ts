import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '@/app/store/models';
import { undoableEnhancer } from '../undoableEnhancer';
import { UndoableEnhancerState } from '../UndoableEnhancerState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Store = RematchDispatch<RootModel> & {
  getState(): RematchRootState<RootModel>;
};

// Mock all the external dependencies that cause issues
jest.mock('@/app/store/updateSources', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('UndoableEnhancer - Integration Test', () => {
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
            tokens: { global: [] },
            activeTokenSet: 'global',
            usedTokenSet: { global: TokenSetStatus.ENABLED },
            themes: [],
            activeTheme: {},
            lastSyncedState: JSON.stringify([{ global: [] }, []], null, 2),
            stringTokens: '',
            importedTokens: { newTokens: [], updatedTokens: [] },
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
            importedThemes: { newThemes: [], updatedThemes: [] },
            compressedTokens: '',
            compressedThemes: '',
            tokensSize: 0,
            themesSize: 0,
            renamedCollections: null,
          },
          uiState: {
            api: null,
            storageType: { provider: 'local' },
          },
        },
      },
      models,
    });
  });

  describe('Token Set Operations - Full Undo/Redo Cycle', () => {
    it('should properly undo and redo token set addition', () => {
      // Initial state - only global exists
      expect(Object.keys(store.getState().tokenState.tokens)).toEqual(['global']);

      // Add a token set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'design-system' });

      // Verify it was added
      expect(Object.keys(store.getState().tokenState.tokens)).toContain('design-system');
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);

      // Undo the addition
      UndoableEnhancerState.undo();

      // Verify it was removed
      expect(Object.keys(store.getState().tokenState.tokens)).toEqual(['global']);

      // Redo the addition
      UndoableEnhancerState.redo();

      // Verify it was added back
      expect(Object.keys(store.getState().tokenState.tokens)).toContain('design-system');
    });

    it('should properly undo and redo active token set changes', () => {
      // Add another token set first
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'themes' });
      
      // Clear history from the add operation
      UndoableEnhancerState.actionsHistory = [];

      // Verify initial active set
      expect(store.getState().tokenState.activeTokenSet).toBe('global');

      // Change active token set
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'themes' });

      // Verify it changed
      expect(store.getState().tokenState.activeTokenSet).toBe('themes');
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);

      // Undo the change
      UndoableEnhancerState.undo();

      // Verify it reverted
      expect(store.getState().tokenState.activeTokenSet).toBe('global');

      // Redo the change
      UndoableEnhancerState.redo();

      // Verify it changed back
      expect(store.getState().tokenState.activeTokenSet).toBe('themes');
    });
  });

  describe('Bulk Token Operations - Full Undo/Redo Cycle', () => {
    it('should properly undo and redo multiple token creation', () => {
      // Initial state - no tokens
      expect(store.getState().tokenState.tokens.global).toHaveLength(0);

      // Create multiple tokens
      const tokens = [
        { parent: 'global', name: 'primary', type: 'color' as const, value: '#007bff' },
        { parent: 'global', name: 'secondary', type: 'color' as const, value: '#6c757d' },
        { parent: 'global', name: 'success', type: 'color' as const, value: '#28a745' },
      ];

      store.dispatch({ type: 'tokenState/createMultipleTokens', payload: tokens });

      // Verify tokens were created
      const tokensAfterCreate = store.getState().tokenState.tokens.global;
      expect(tokensAfterCreate).toHaveLength(3);
      expect(tokensAfterCreate.find(t => t.name === 'primary')).toBeTruthy();
      expect(tokensAfterCreate.find(t => t.name === 'secondary')).toBeTruthy();
      expect(tokensAfterCreate.find(t => t.name === 'success')).toBeTruthy();
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);

      // Undo the creation
      UndoableEnhancerState.undo();

      // Verify tokens were removed
      expect(store.getState().tokenState.tokens.global).toHaveLength(0);

      // Redo the creation
      UndoableEnhancerState.redo();

      // Verify tokens were restored
      const tokensAfterRedo = store.getState().tokenState.tokens.global;
      expect(tokensAfterRedo).toHaveLength(3);
      expect(tokensAfterRedo.find(t => t.name === 'primary')).toBeTruthy();
    });
  });

  describe('Complex Workflow - Multiple Operations', () => {
    it('should handle a complex workflow with multiple undo/redo operations', () => {
      // Step 1: Add a token set
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'colors' });
      expect(Object.keys(store.getState().tokenState.tokens)).toContain('colors');

      // Step 2: Create some tokens
      const colorTokens = [
        { parent: 'colors', name: 'brand.primary', type: 'color' as const, value: '#007bff' },
        { parent: 'colors', name: 'brand.secondary', type: 'color' as const, value: '#6c757d' },
      ];
      store.dispatch({ type: 'tokenState/createMultipleTokens', payload: colorTokens });
      expect(store.getState().tokenState.tokens.colors).toHaveLength(2);

      // Step 3: Change active token set
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'colors' });
      expect(store.getState().tokenState.activeTokenSet).toBe('colors');

      // Verify we have 3 actions in history
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(3);

      // Undo operations in reverse order
      
      // Undo step 3: active token set change
      UndoableEnhancerState.undo();
      expect(store.getState().tokenState.activeTokenSet).toBe('global');

      // Undo step 2: token creation
      UndoableEnhancerState.undo();
      expect(store.getState().tokenState.tokens.colors).toHaveLength(0);

      // Undo step 1: token set addition
      UndoableEnhancerState.undo();
      expect(Object.keys(store.getState().tokenState.tokens)).toEqual(['global']);

      // Now redo all operations
      
      // Redo step 1: token set addition
      UndoableEnhancerState.redo();
      expect(Object.keys(store.getState().tokenState.tokens)).toContain('colors');

      // Redo step 2: token creation
      UndoableEnhancerState.redo();
      expect(store.getState().tokenState.tokens.colors).toHaveLength(2);

      // Redo step 3: active token set change
      UndoableEnhancerState.redo();
      expect(store.getState().tokenState.activeTokenSet).toBe('colors');

      // Verify final state matches original
      expect(store.getState().tokenState.tokens.colors.find(t => t.name === 'brand.primary')).toBeTruthy();
      expect(store.getState().tokenState.tokens.colors.find(t => t.name === 'brand.secondary')).toBeTruthy();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle undo when no actions exist', () => {
      // Try to undo when nothing has been done
      const initialPointer = UndoableEnhancerState.actionsHistoryPointer;
      UndoableEnhancerState.undo();
      
      // Pointer shouldn't change
      expect(UndoableEnhancerState.actionsHistoryPointer).toBe(initialPointer);
    });

    it('should handle redo when no actions have been undone', () => {
      // Add an action
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'test' });
      
      // Try to redo without undoing first
      const initialPointer = UndoableEnhancerState.actionsHistoryPointer;
      UndoableEnhancerState.redo();
      
      // Pointer shouldn't change
      expect(UndoableEnhancerState.actionsHistoryPointer).toBe(initialPointer);
    });

    it('should clear redo history when new action is performed after undo', () => {
      // Perform two actions
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set1' });
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set2' });
      
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(2);

      // Undo one action
      UndoableEnhancerState.undo();
      expect(UndoableEnhancerState.actionsHistoryPointer).toBe(1);

      // Perform a new action - this should clear the redo history
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'set3' });
      
      // Should now have 2 actions (the first one + the new one), and pointer reset
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(2);
      expect(UndoableEnhancerState.actionsHistoryPointer).toBe(0);
      
      // The last action should be the new one we just added
      expect(UndoableEnhancerState.actionsHistory[1].action.payload).toBe('set3');
    });
  });
});