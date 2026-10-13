import React from 'react';
import { Provider } from 'react-redux';
import {
  act, render, createMockStore, waitFor,
} from '../../../tests/config/setupTest';
import ImportedTokensDialog from './ImportedTokensDialog';

// Hide log calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => { });

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const getDefaultStore = () => ({
  tokenState: {
    activeTokenSet: 'global',
    tokens: {
      global: [
        {
          name: 'light',
          type: 'typography',
          value: {
            fontFamily: 'aria',
            fontSize: '12',
            fontWeight: 'bold',
          },
        },
        {
          name: 'opacity.50',
          type: 'opacity',
          value: '50%',
        },
      ],
    },
    importedTokens: {
      newTokens: [
        {
          name: 'small',
          type: 'sizing',
          value: '12',
          description: 'regular sizing token',
        },
        {
          name: 'black',
          type: 'color',
          value: '#ffffff',
          description: 'regular color token',
        },
        {
          name: 'headline',
          type: 'boxShadow',
          value: {
            blur: 1,
            color: '#00000040',
            spread: 1,
            type: 'dropShadow',
            x: 1,
            y: 1,
          },
        },
      ],
      updatedTokens: [
        {
          name: 'light',
          type: 'typography',
          value: {
            fontFamily: 'aria',
            fontSize: '24',
            fontWeight: 'light',
          },
        },
        {
          name: 'opacity.50',
          type: 'opacity',
          value: '30%',
        },
      ],
    },
  },
});

describe('ImportedTokensDialog', () => {
  it('shows dialog with newTokenlist and updateTokenlist', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await waitFor(async () => {
      expect(result.queryByText('newTokens')).toBeInTheDocument();
      expect(result.queryByText('createAll')).toBeInTheDocument();
      expect(result.queryByText('existingTokens')).toBeInTheDocument();
      expect(result.queryByText('updateAll')).toBeInTheDocument();
      expect(result.queryByText('#ffffff')).toBeInTheDocument();
      expect(result.queryByText('regular color token')).toBeInTheDocument();
      expect(result.queryByText(JSON.stringify({
        blur: 1,
        color: '#00000040',
        spread: 1,
        type: 'dropShadow',
        x: 1,
        y: 1,
      }))).toBeInTheDocument();
      expect(result.queryByText('cancel')).toBeInTheDocument();
      expect(result.queryByText('importAll')).toBeInTheDocument();
    });
  });

  it('should create single token', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[0] as HTMLButtonElement;
      updateButton.click();
    });
    await waitFor(async () => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '50%',
          },
          {
            $extensions: {
              'studio.tokens': { id: 'mock-uuid' },
            },
            name: 'small',
            type: 'sizing',
            value: '12',
            description: 'regular sizing token',
          },
        ],
      );
    });
  });

  it('should create all tokens', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const createButton = result.getByTestId('button-import-create-all') as HTMLButtonElement;
      createButton.click();
    });
    await waitFor(async () => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '50%',
          },
          {
            name: 'small',
            type: 'sizing',
            value: '12',
            description: 'regular sizing token',
          },
          {
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            name: 'headline',
            type: 'boxShadow',
            value: {
              blur: 1,
              color: '#00000040',
              spread: 1,
              type: 'dropShadow',
              x: 1,
              y: 1,
            },
          },
        ],
      );
    });
  });

  it('should ignore a new token', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const removeButton = result.getAllByTestId('imported-tokens-dialog-remove-button')[0] as HTMLButtonElement;
      removeButton.click();
    });

    await act(async () => {
      const createButton = result.queryByText('createAll') as HTMLButtonElement;
      createButton.click();
    });
    await waitFor(async () => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '50%',
          },
          {
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            name: 'headline',
            type: 'boxShadow',
            value: {
              blur: 1,
              color: '#00000040',
              spread: 1,
              type: 'dropShadow',
              x: 1,
              y: 1,
            },
          },
        ],
      );
    });
  });

  it('should update a token', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[3] as HTMLButtonElement;
      updateButton.click();
    });

    await waitFor(async () => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '24',
              fontWeight: 'light',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '50%',
          },
        ],
      );
    });
  });

  it('should save the imported Figma metadata when updating a single token', async () => {
    const mockStore = createMockStore({
      tokenState: {
        activeTokenSet: 'global',
        tokens: {
          global: [
            {
              name: 'gap', type: 'dimension', value: '8px', $extensions: { 'com.figma.scopes': ['GAP'] },
            },
          ],
        },
        importedTokens: {
          newTokens: [],
          updatedTokens: [
            {
              name: 'gap',
              type: 'dimension',
              value: '8px',
              oldValue: '8px',
              parent: 'global',
              $extensions: { 'com.figma.scopes': ['ALL_SCOPES'] },
            },
          ],
        },
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      result.getAllByTestId('imported-tokens-dialog-update-button')[0].click();
    });

    await waitFor(() => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual([
        {
          name: 'gap', type: 'dimension', value: '8px', $extensions: { 'com.figma.scopes': ['ALL_SCOPES'] },
        },
      ]);
    });
  });

  it('should update all tokens', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const updateButton = result.getByTestId('button-import-update-all') as HTMLButtonElement;
      updateButton.click();
    });

    await waitFor(async () => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '24',
              fontWeight: 'light',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '30%',
          },
        ],
      );
    });
  });

  it('should ignore an existing token', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const removeButton = result.getAllByTestId('imported-tokens-dialog-remove-button')[3] as HTMLButtonElement;
      removeButton.click();
    });

    await act(async () => {
      const updateButton = result.queryByText('updateAll') as HTMLButtonElement;
      updateButton.click();
    });

    await waitFor(() => {
      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '12',
              fontWeight: 'bold',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '30%',
          },
        ],
      );
    });
  });

  it('should import all tokens', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await waitFor(async () => {
      const updateButton = await result.findByText('importAll') as HTMLButtonElement;
      updateButton.click();

      expect(mockStore.getState().tokenState.tokens.global).toEqual(
        [
          {
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '24',
              fontWeight: 'light',
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '30%',
          },
          {
            name: 'small',
            type: 'sizing',
            value: '12',
            description: 'regular sizing token',
          },
          {
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            name: 'headline',
            type: 'boxShadow',
            value: {
              blur: 1,
              color: '#00000040',
              spread: 1,
              type: 'dropShadow',
              x: 1,
              y: 1,
            },
          },
        ],
      );
    });
  });

  it('should be able to close by clicking the close button', async () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const closeButton = result.queryByTestId('button-import-close') as HTMLButtonElement;
      closeButton.click();
    });
    expect(mockStore.getState().tokenState.importedTokens.newTokens).toEqual([]);
    expect(mockStore.getState().tokenState.importedTokens.updatedTokens).toEqual([]);
    expect(result.queryByText('imported')).not.toBeInTheDocument();
  });

  it('should switch to first imported token set when current set is not in imported sets', async () => {
    const storeWithDifferentParent = {
      tokenState: {
        activeTokenSet: 'global',
        tokens: {
          global: [],
          'collection/mode1': [],
        },
        importedTokens: {
          newTokens: [
            {
              name: 'small',
              type: 'sizing',
              value: '12',
              parent: 'collection/mode1',
            },
          ],
          updatedTokens: [],
        },
      },
    };
    const mockStore = createMockStore(storeWithDifferentParent);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await waitFor(async () => {
      const importButton = await result.findByText('importAll') as HTMLButtonElement;
      importButton.click();

      // Should switch to 'collection/mode1' since 'global' is not in the imported sets
      expect(mockStore.getState().tokenState.activeTokenSet).toEqual('collection/mode1');
    });
  });

  it('should not switch token set when current set is in imported sets', async () => {
    const storeWithSameParent = {
      tokenState: {
        activeTokenSet: 'global',
        tokens: {
          global: [],
        },
        importedTokens: {
          newTokens: [
            {
              name: 'small',
              type: 'sizing',
              value: '12',
              parent: 'global',
            },
          ],
          updatedTokens: [],
        },
      },
    };
    const mockStore = createMockStore(storeWithSameParent);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await waitFor(async () => {
      const importButton = await result.findByText('importAll') as HTMLButtonElement;
      importButton.click();

      // Should stay on 'global' since it's in the imported sets
      expect(mockStore.getState().tokenState.activeTokenSet).toEqual('global');
    });
  });

  describe('tokens that belong to another set than the active one', () => {
    const getMultiSetStore = () => ({
      tokenState: {
        activeTokenSet: 'Colors/Light',
        tokens: {
          'Colors/Light': [{ name: 'color.bg', type: 'color', value: '#ffffff' }],
          'Colors/Dark': [{ name: 'color.bg', type: 'color', value: '#000000' }],
        },
        importedTokens: {
          newTokens: [
            {
              name: 'color.fg', type: 'color', value: '#111111', parent: 'Colors/Light',
            },
            {
              name: 'color.fg', type: 'color', value: '#eeeeee', parent: 'Colors/Dark',
            },
          ],
          updatedTokens: [
            {
              name: 'color.bg', type: 'color', value: '#fafafa', oldValue: '#ffffff', parent: 'Colors/Light',
            },
            {
              name: 'color.bg', type: 'color', value: '#0a0a0a', oldValue: '#000000', parent: 'Colors/Dark',
            },
          ],
        },
      },
    });

    it('should update a single token in its own set and keep the same-named row of the other set', async () => {
      const mockStore = createMockStore(getMultiSetStore());
      const result = render(
        <Provider store={mockStore}>
          <ImportedTokensDialog />
        </Provider>,
      );

      // Rows: 2 new tokens, then Light's color.bg, then Dark's color.bg
      await act(async () => {
        result.getAllByTestId('imported-tokens-dialog-update-button')[3].click();
      });

      await waitFor(() => {
        expect(mockStore.getState().tokenState.tokens).toEqual({
          'Colors/Light': [{ name: 'color.bg', type: 'color', value: '#ffffff' }],
          'Colors/Dark': [{ name: 'color.bg', type: 'color', value: '#0a0a0a' }],
        });
      });
      expect(result.queryByText('#0a0a0a')).not.toBeInTheDocument();
      expect(result.queryByText('#fafafa')).toBeInTheDocument();
    });

    it('should create a single token in its own set and keep the same-named row of the other set', async () => {
      const mockStore = createMockStore(getMultiSetStore());
      const result = render(
        <Provider store={mockStore}>
          <ImportedTokensDialog />
        </Provider>,
      );

      await act(async () => {
        result.getAllByTestId('imported-tokens-dialog-update-button')[1].click();
      });

      await waitFor(() => {
        expect(mockStore.getState().tokenState.tokens).toEqual({
          'Colors/Light': [{ name: 'color.bg', type: 'color', value: '#ffffff' }],
          'Colors/Dark': [
            { name: 'color.bg', type: 'color', value: '#000000' },
            {
              name: 'color.fg', type: 'color', value: '#eeeeee', $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
            },
          ],
        });
      });
      expect(result.queryByText('#eeeeee')).not.toBeInTheDocument();
      expect(result.queryByText('#111111')).toBeInTheDocument();
    });

    it('should update a single token whose name does not exist in the active set', async () => {
      const mockStore = createMockStore({
        tokenState: {
          activeTokenSet: 'Colors/Light',
          tokens: {
            'Colors/Light': [{ name: 'color.bg', type: 'color', value: '#ffffff' }],
            'Spacing/Default': [{ name: 'spacing.sm', type: 'dimension', value: '8' }],
          },
          importedTokens: {
            newTokens: [],
            updatedTokens: [
              {
                name: 'spacing.sm', type: 'dimension', value: '12', oldValue: '8', parent: 'Spacing/Default',
              },
            ],
          },
        },
      });
      const result = render(
        <Provider store={mockStore}>
          <ImportedTokensDialog />
        </Provider>,
      );

      await act(async () => {
        result.getAllByTestId('imported-tokens-dialog-update-button')[0].click();
      });

      await waitFor(() => {
        expect(mockStore.getState().tokenState.tokens).toEqual({
          'Colors/Light': [{ name: 'color.bg', type: 'color', value: '#ffffff' }],
          'Spacing/Default': [{ name: 'spacing.sm', type: 'dimension', value: '12' }],
        });
      });
    });
  });

  it('should apply value changes and create new tokens in a renamed collection when importing all', async () => {
    // The set doesn't exist under its new name yet, so setTokensFromVariables classifies all of its tokens as new
    const mockStore = createMockStore({
      tokenState: {
        activeTokenSet: 'Old/Default',
        tokens: {
          'Old/Default': [
            { name: 'spacing.sm', type: 'dimension', value: '8' },
            {
              name: 'spacing.md', type: 'dimension', value: '16', $extensions: { 'custom.extension': { keep: true } },
            },
          ],
        },
        renamedCollections: [['Old/Default', 'New/Default']],
        importedTokens: {
          newTokens: [
            {
              name: 'spacing.sm', type: 'dimension', value: '12', parent: 'New/Default',
            },
            {
              name: 'spacing.md', type: 'dimension', value: '16', parent: 'New/Default',
            },
            {
              name: 'spacing.lg', type: 'dimension', value: '24', parent: 'New/Default',
            },
          ],
          updatedTokens: [],
        },
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      (await result.findByText('importAll')).click();
    });

    await waitFor(() => {
      expect(mockStore.getState().tokenState.tokens).toEqual({
        'New/Default': [
          { name: 'spacing.sm', type: 'dimension', value: '12' },
          {
            name: 'spacing.md', type: 'dimension', value: '16', $extensions: { 'custom.extension': { keep: true }, 'studio.tokens': { id: 'mock-uuid' } },
          },
          { name: 'spacing.lg', type: 'dimension', value: '24' },
        ],
      });
    });
    expect(mockStore.getState().tokenState.renamedCollections).toBeNull();
  });
});
