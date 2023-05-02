import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('renameStyleIdsToCurrentTheme', () => {
  it('should rename styleId to current theme', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {
            old: 'S:1234',
            'colors.red': 'S:0283',
          },
        }, {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {},
          $figmaStyleReferences: {
            'color.blue': 'S:2345',
            'colors.red': 'S:0285',
          },
        }],
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
      },
    });
    await mockStore.dispatch.tokenState.renameStyleIdsToCurrentTheme(['S:1234', 'S:2345'], 'new');
    const { themes } = mockStore.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        new: 'S:1234',
        'colors.red': 'S:0283',
      },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        new: 'S:2345',
        'colors.red': 'S:0285',
      },
    }]);
  });
});
