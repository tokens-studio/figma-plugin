import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('renameVariableIdsToTheme', () => {
  it('should update $figmaVariableReferences', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaVariableReferences: {
            'fg.default': 'variableID:12345',
            'colors.red': 'variableID:13456',
          },
        }, {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {},
          $figmaVariableReferences: {
            'fg.default': 'variableID:23456',
            'colors.red': 'variableID:24567',
          },
        }],
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
      },
    });
    await mockStore.dispatch.tokenState.renameVariableIdsToTheme([
      {
        oldName: 'fg.default',
        newName: 'fg.default-rename',
        variableIds: [
          'variableID:12345',
          'variableID:23456',
        ],
      },
    ]);
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaVariableReferences: {
        'fg.default-rename': 'variableID:12345',
        'colors.red': 'variableID:13456',
      },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaVariableReferences: {
        'fg.default-rename': 'variableID:23456',
        'colors.red': 'variableID:24567',
      },
    }]);
  });
});
