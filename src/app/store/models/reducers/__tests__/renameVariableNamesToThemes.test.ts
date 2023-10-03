import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('renameVariableNamesToThemes', () => {
  it('should update the variable name in theme data', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaVariableReferences: {
            'fg.default': 'variableID:12345',
            'fg.muted': 'variableID:23456',
            'colors.red': 'variableID:13456',
          },
        }, {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {},
          $figmaVariableReferences: {
            'fg.default': 'variableID:12345',
            'colors.red': 'variableID:13456',
          },
        }],
      },
    });
    await mockStore.dispatch.tokenState.renameVariableNamesToThemes([{ oldName: 'fg.default', newName: 'fg.default-rename' }]);
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaVariableReferences: {
        'fg.default-rename': 'variableID:12345',
        'fg.muted': 'variableID:23456',
        'colors.red': 'variableID:13456',
      },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaVariableReferences: {
        'fg.default-rename': 'variableID:12345',
        'colors.red': 'variableID:13456',
      },
    }]);
  });
});
