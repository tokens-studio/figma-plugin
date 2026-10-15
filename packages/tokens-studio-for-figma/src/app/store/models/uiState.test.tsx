import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { StorageProviderType } from '@/constants/StorageProviderType';

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

  it('forgets the sync provider\'s credentials when the document switches to local storage', () => {
    const studio = {
      provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', name: 'Project', changeSetId: 'change-set-1',
    } as any;
    store.dispatch.uiState.setApiData(studio);
    store.dispatch.uiState.setStorage(studio);

    store.dispatch.uiState.setStorage({ provider: StorageProviderType.LOCAL });

    expect(store.getState().uiState.storageType).toEqual({ provider: StorageProviderType.LOCAL });
    expect(store.getState().uiState.api).toBeNull();
  });

  it('keeps the credentials when the storage is another sync provider', () => {
    const github = {
      provider: StorageProviderType.GITHUB, id: 'six7/figma-tokens', branch: 'main', filePath: 'tokens.json', secret: 'secret',
    } as any;
    store.dispatch.uiState.setApiData(github);

    store.dispatch.uiState.setStorage(github);

    expect(store.getState().uiState.api).toEqual(github);
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
