import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, fireEvent, render, waitFor,
} from '../../../tests/config/setupTest';
import { Initiator } from './Initiator';
import ImportedTokensDialog from './ImportedTokensDialog';
import { MessageFromPluginTypes } from '@/types/messages';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Hide react-modal noise.
jest.spyOn(console, 'error').mockImplementation(() => {});

const studioApi = {
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', name: 'Studio', branch: 'main', changeSetId: 'change-set-1',
};
const githubApi = {
  provider: StorageProviderType.GITHUB, id: 'six7/figma-tokens', branch: 'main', filePath: 'tokens.json',
};
const localApi = { provider: StorageProviderType.LOCAL };

const lightTheme = {
  id: 'server-light',
  name: 'Light',
  group: 'Colors',
  selectedTokenSets: { 'Colors/Light': TokenSetStatus.ENABLED },
  $figmaCollectionId: 'VariableCollectionId:1:2',
  $figmaModeId: '1:0',
};

const createStore = (api: Record<string, unknown>) => createMockStore({
  uiState: { api, storageType: api } as any,
  tokenState: {
    activeTokenSet: 'core',
    tokens: {
      core: [{ name: 'red', value: '#ff0000', type: 'color' }],
      'Colors/Light': [
        { name: 'color.bg', value: '#d6d6d6', type: 'color' },
        { name: 'color.fg', value: '#2f2f2f', type: 'color' },
      ],
    },
    themes: [lightTheme],
  } as any,
});

// What pullVariables sends after a collection got a new mode and a changed value.
const variablesMessage = {
  type: MessageFromPluginTypes.VARIABLES,
  values: {
    colors: [
      {
        name: 'color.bg', value: '#d6d6d6', type: 'color', parent: 'Colors/Light',
      },
      {
        name: 'color.fg', value: '#000000', type: 'color', parent: 'Colors/Light',
      },
      {
        name: 'Foo', value: '#0099ff', type: 'color', parent: 'New/NEWONE',
      },
    ],
  },
  themes: [
    { ...lightTheme, id: 'colors-light' },
    {
      id: 'new-newone',
      name: 'NEWONE',
      group: 'New',
      selectedTokenSets: { 'New/NEWONE': TokenSetStatus.ENABLED },
      $figmaCollectionId: 'VariableCollectionId:1:5',
      $figmaModeId: '1:6',
    },
  ],
};

const renderWithStore = (store: ReturnType<typeof createStore>) => render(
  <Provider store={store}>
    <Initiator />
    <ImportedTokensDialog />
  </Provider>,
);

const sendVariables = () => {
  act(() => {
    fireEvent(window, new MessageEvent('message', { data: { pluginMessage: variablesMessage } }));
  });
};

describe('Initiator variables import', () => {
  it('applies the import right away with Tokens Studio sync, without the review dialog', async () => {
    const store = createStore(studioApi);
    const result = renderWithStore(store);

    sendVariables();

    const { tokenState } = store.getState();
    expect(tokenState.tokens['Colors/Light']).toEqual([
      { name: 'color.bg', value: '#d6d6d6', type: 'color' },
      { name: 'color.fg', value: '#000000', type: 'color' },
    ]);
    expect(tokenState.tokens['New/NEWONE']).toEqual([{ name: 'Foo', value: '#0099ff', type: 'color' }]);
    expect(tokenState.themes.map((theme) => theme.id)).toEqual(['server-light', 'new-newone']);
    expect(tokenState.importedTokens).toEqual({ newTokens: [], updatedTokens: [] });
    expect(tokenState.activeTokenSet).toBe('Colors/Light');
    expect(result.queryByTestId('button-import-all')).not.toBeInTheDocument();
  });

  it.each([
    ['GitHub', githubApi],
    ['a local document', localApi],
  ])('still asks which tokens to import with %s', async (_name, api) => {
    const store = createStore(api);
    const result = renderWithStore(store);

    sendVariables();

    const { tokenState } = store.getState();
    expect(tokenState.tokens['Colors/Light'][1].value).toBe('#2f2f2f');
    expect(tokenState.tokens['New/NEWONE']).toBeUndefined();
    expect(tokenState.importedTokens.newTokens).toHaveLength(1);
    expect(tokenState.importedTokens.updatedTokens).toHaveLength(1);
    expect(await result.findByTestId('button-import-all')).toBeInTheDocument();
  });

  it('ends up with the same tokens and themes as "Import all" in the review dialog', async () => {
    const studioStore = createStore(studioApi);
    renderWithStore(studioStore);
    sendVariables();

    const reviewStore = createStore(localApi);
    const result = renderWithStore(reviewStore);
    sendVariables();
    const importAll = await result.findByTestId('button-import-all');
    act(() => {
      importAll.click();
    });

    await waitFor(() => expect(reviewStore.getState().tokenState.tokens['New/NEWONE']).toBeDefined());
    const studio = studioStore.getState().tokenState;
    const reviewed = reviewStore.getState().tokenState;
    expect(studio.tokens).toEqual(reviewed.tokens);
    expect(studio.themes).toEqual(reviewed.themes);
    expect(studio.activeTokenSet).toEqual(reviewed.activeTokenSet);
  });

  it('keeps the Tokens Studio id of a theme the import updates', async () => {
    const store = createStore(studioApi);
    renderWithStore(store);

    // The mode was renamed in Figma; pullVariables names the theme's id after the new mode.
    act(() => {
      fireEvent(window, new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MessageFromPluginTypes.VARIABLES,
            values: {
              colors: [{
                name: 'color.bg', value: '#d6d6d6', type: 'color', parent: 'Colors/Day',
              }],
            },
            themes: [{
              ...lightTheme, id: 'colors-day', name: 'Day', selectedTokenSets: { 'Colors/Day': TokenSetStatus.ENABLED },
            }],
          },
        },
      }));
    });

    const { tokenState } = store.getState();
    expect(tokenState.importedThemes.updatedThemes.map((theme) => theme.id)).toEqual(['server-light']);
    expect(tokenState.themes).toEqual([expect.objectContaining({ id: 'server-light', name: 'Day' })]);
  });

  it('applies renamed collections with Tokens Studio sync before the imported tokens', async () => {
    const store = createStore(studioApi);
    renderWithStore(store);

    act(() => {
      fireEvent(window, new MessageEvent('message', {
        data: { pluginMessage: { type: MessageFromPluginTypes.RENAME_COLLECTIONS_AND_MODES, renamedCollections: [['Colors/Light', 'Colours/Light']] } },
      }));
    });
    act(() => {
      fireEvent(window, new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: MessageFromPluginTypes.VARIABLES,
            values: {
              colors: [{
                name: 'color.bg', value: '#d6d6d6', type: 'color', parent: 'Colours/Light',
              }],
            },
          },
        },
      }));
    });

    const { tokenState } = store.getState();
    expect(tokenState.tokens['Colors/Light']).toBeUndefined();
    expect(tokenState.tokens['Colours/Light'].map((token) => token.name)).toEqual(['color.bg', 'color.fg']);
    expect(tokenState.renamedCollections).toBeNull();
  });
});
