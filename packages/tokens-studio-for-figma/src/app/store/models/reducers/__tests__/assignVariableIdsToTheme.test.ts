import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('assignVariableIdsToTheme', () => {
  it('should keep existing keys in their original order and append new ones', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaCollectionId: 'VariableCollectionID:123',
          $figmaModeId: 'modeID:123',
          $figmaVariableReferences: {
            'fg.default': 'variableID:aaa',
            'colors.red': 'variableID:bbb',
          },
        }],
      },
    });
    await mockStore.dispatch.tokenState.assignVariableIdsToTheme({
      light: {
        collectionId: 'VariableCollectionID:123',
        modeId: 'modeID:123',
        // The export visits tokens in its own order, which differs from themes.json
        variableIds: {
          'colors.red': 'variableID:bbb',
          'colors.blue': 'variableID:ccc',
          'fg.default': 'variableID:aaa',
        },
      },
    });
    const [updatedTheme] = mockStore.getState().tokenState.themes;
    expect(Object.keys(updatedTheme.$figmaVariableReferences ?? {})).toEqual([
      'fg.default',
      'colors.red',
      'colors.blue',
    ]);
    expect(updatedTheme.$figmaVariableReferences).toEqual({
      'fg.default': 'variableID:aaa',
      'colors.red': 'variableID:bbb',
      'colors.blue': 'variableID:ccc',
    });
  });

  it('should drop references for tokens the export no longer produced', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaCollectionId: 'VariableCollectionID:123',
          $figmaModeId: 'modeID:123',
          $figmaVariableReferences: {
            'colors.red': 'variableID:aaa',
            'colors.old': 'variableID:bbb',
          },
        }],
      },
    });
    await mockStore.dispatch.tokenState.assignVariableIdsToTheme({
      light: {
        collectionId: 'VariableCollectionID:123',
        modeId: 'modeID:123',
        variableIds: {
          'colors.red': 'variableID:aaa',
          'colors.crimson': 'variableID:ccc',
        },
      },
    });
    const [updatedTheme] = mockStore.getState().tokenState.themes;
    expect(updatedTheme.$figmaVariableReferences).toEqual({
      'colors.red': 'variableID:aaa',
      'colors.crimson': 'variableID:ccc',
    });
  });

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
