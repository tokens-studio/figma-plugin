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
  it('shows dialog with newTokenlist and updateTokenlist', () => {
    const mockStore = createMockStore(getDefaultStore());
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    waitFor(async () => {
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
    waitFor(async () => {
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
    waitFor(async () => {
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
          {
            $extensions: {
              'studio.tokens': { id: 'mock-uuid' },
            },
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
    waitFor(async () => {
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
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            $extensions: {
              'studio.tokens': { id: 'mock-uuid' },
            },
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

    waitFor(async () => {
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

    waitFor(async () => {
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
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
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
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
            name: 'light',
            type: 'typography',
            value: {
              fontFamily: 'aria',
              fontSize: '24',
              fontWeight: 'light',
            },
          },
          {
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
            name: 'opacity.50',
            type: 'opacity',
            value: '30%',
          },
          {
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
            name: 'small',
            type: 'sizing',
            value: '12',
            description: 'regular sizing token',
          },
          {
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            $extensions: { 'studio.tokens': { id: 'mock-uuid' } },
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
});
