import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '../../index';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('removeStyleIdsFromThemes', () => {
  let store: Store;

  it('Should be able to remove styles from any theme if the user deleted one', async () => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            themes: [{
              id: 'light',
              name: 'Light',
              selectedTokenSets: {},
              $figmaStyleReferences: {
                'colors.brand.primary': 'S:1234',
                'colors.red': 'S:1235',
                'colors.blue': 'S:1236',
              },
            }, {
              id: 'dark',
              name: 'Dark',
              selectedTokenSets: {},
              $figmaStyleReferences: {
                'colors.brand.primary': 'S:2345',
                'colors.red': 'S:2346',
              },
            }],
          },
        },
      },
      models,
    });
    await store.dispatch.tokenState.removeStyleIdsFromThemes(['S:1234', 'S:2345']);
    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        'colors.red': 'S:1235',
        'colors.blue': 'S:1236',
      },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        'colors.red': 'S:2346',
      },
    }]);
  });
});
