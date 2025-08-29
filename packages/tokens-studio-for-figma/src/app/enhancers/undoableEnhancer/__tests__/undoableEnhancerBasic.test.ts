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

describe('UndoableEnhancer - Basic Tracking Test', () => {
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
        },
      },
      models,
    });
  });

  describe('Tracking verification', () => {
    it('should track token set operations', () => {
      // Test that our new undo definitions are being recognized
      
      // Add token set using reducer only
      store.dispatch({ type: 'tokenState/addTokenSet', payload: 'test-set' });
      
      // Check if it was tracked
      console.log('Actions history length:', UndoableEnhancerState.actionsHistory.length);
      console.log('Action types:', UndoableEnhancerState.actionsHistory.map(a => a.action.type));
      
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/addTokenSet');
    });

    it('should track active token set changes', () => {
      // Test setActiveTokenSet tracking
      store.dispatch({ type: 'tokenState/setActiveTokenSet', payload: 'other-set' });
      
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/setActiveTokenSet');
    });

    it('should track multiple token creation', () => {
      const multipleTokens = [
        { parent: 'global', name: 'token1', type: 'color' as const, value: '#ff0000' },
      ];

      store.dispatch({ type: 'tokenState/createMultipleTokens', payload: multipleTokens });
      
      expect(UndoableEnhancerState.actionsHistory).toHaveLength(1);
      expect(UndoableEnhancerState.actionsHistory[0].action.type).toBe('tokenState/createMultipleTokens');
    });
  });
});