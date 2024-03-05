import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('disconnectVariableFromTheme', () => {
  it('should remove matching variableID from theme', async () => {
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
    await mockStore.dispatch.tokenState.disconnectVariableFromTheme({
      id: 'light',
      key: ['fg.default', 'fg.muted'],
    });
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaVariableReferences: {
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
    }]);
  });

  it('when there is no matching theme, should do nothing', async () => {
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
    await mockStore.dispatch.tokenState.disconnectVariableFromTheme({
      id: 'default',
      key: ['fg.default', 'fg.muted'],
    });
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
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
    }]);
  });
});
