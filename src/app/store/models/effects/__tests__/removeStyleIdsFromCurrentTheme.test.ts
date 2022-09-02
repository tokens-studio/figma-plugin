import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '../../index';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('removeStyleIdsFromCurrentTheme', () => {
  let store: Store;

  it('should remove styleId from current theme', async () => {
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
                'colors.red': 'S:0283',
              },
            }],
            activeTheme: 'light',
          },
        },
      },
      models,
    });
    await store.dispatch.tokenState.removeStyleIdsFromCurrentTheme({
      'colors.red': 'S:0283',
    });
    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        'colors.brand.primary': 'S:1234',
      },
    }]);
  });

  it('couldn\'t remove styleId from current theme when there is no activeTheme', async () => {
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
                'colors.red': 'S:0283',
              },
            }],
            activeTheme: null,
          },
        },
      },
      models,
    });
    await store.dispatch.tokenState.removeStyleIdsFromCurrentTheme({
      'colors.red': 'S:0283',
    });
    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        'colors.brand.primary': 'S:1234',
        'colors.red': 'S:0283',
      },
    }]);
  });
});
