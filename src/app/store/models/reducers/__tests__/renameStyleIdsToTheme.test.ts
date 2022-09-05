import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '../../index';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('renameStyleIdsToCurrentTheme', () => {
  let store: Store;

  it('should rename styleId to current theme', async () => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            themes: [{
              id: 'light',
              name: 'Light',
              selectedTokenSets: {},
              $figmaStyleReferences: {
                old: 'S:1234',
                'colors.red': 'S:0283',
              },
            }],
            activeTheme: 'light',
          },
        },
      },
      models,
    });
    await store.dispatch.tokenState.renameStyleIdsToCurrentTheme('old', 'new');
    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        new: 'S:1234',
        'colors.red': 'S:0283',
      },
    }]);
  });

  it('couldn\'t rename styleId to current theme when there is no activeTheme', async () => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            themes: [{
              id: 'light',
              name: 'Light',
              selectedTokenSets: {},
              $figmaStyleReferences: {
                old: 'S:1234',
                'colors.red': 'S:0283',
              },
            }],
            activeTheme: null,
          },
        },
      },
      models,
    });
    await store.dispatch.tokenState.renameStyleIdsToCurrentTheme('old', 'new');
    const { themes } = store.getState().tokenState;
    expect(themes).toEqual([{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaStyleReferences: {
        old: 'S:1234',
        'colors.red': 'S:0283',
      },
    }]);
  });
});
