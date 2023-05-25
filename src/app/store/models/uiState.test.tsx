import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('uiState', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          activeTokensTab: 'list',
          figmaFonts: [],
        },
      },
      models,
    });
  });

  it('should be able to set inspectDeep', () => {
    const fonts = [
      {
        fontName: {
          family: 'ABeeZee',
          style: 'Italic',
        },
      },
      {
        fontName: {
          family: 'Abril Fatface',
          style: 'Regular',
        },
      },
    ];
    store.dispatch.uiState.setFigmaFonts(fonts);
    expect(store.getState().uiState.figmaFonts).toBe(fonts);
  });
});
