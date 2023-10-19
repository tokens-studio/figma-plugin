import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('assignVariableIdsToTheme', () => {
  it('should assign variables data to the theme', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
        }, {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {},
        }],
      },
    });
    await mockStore.dispatch.tokenState.assignVariableIdsToTheme({
      light: {
        collectionId: 'VariableCollectionID:123',
        modeId: 'modeID:123',
        variableIds: {
          'fg.default': 'variableID:12345',
          'colors.red': 'variableID:13456',
        },
      },
      default: {
        collectionId: 'VariableCollectionID:234',
        modeId: 'modeID:234',
        variableIds: {
          'fg.default': 'variableID:12345',
          'colors.red': 'variableID:13456',
        },
      },
    });
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaCollectionId: 'VariableCollectionID:123',
      $figmaModeId: 'modeID:123',
      $figmaVariableReferences: {
        'fg.default': 'variableID:12345',
        'colors.red': 'variableID:13456',
      },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
    }]);
  });
});
