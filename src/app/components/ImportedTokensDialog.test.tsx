import React from 'react';
import { Provider } from 'react-redux';
import {
  act, render, createMockStore,
} from '../../../tests/config/setupTest';
import ImportedTokensDialog from './ImportedTokensDialog';

// Hide log calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => { });

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('ImportedTokensDialog', () => {
  const defaultStore = {
    tokenState: {
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
  };

  it('shows dialog with newTokenlist and updateTokenlist', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    expect(result.queryByText('importStyles')).toBeInTheDocument();
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

  it('should create single token', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[0] as HTMLButtonElement;
      updateButton.click();
    });
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
            id: 'mock-uuid',
          },
          name: 'small',
          type: 'sizing',
          value: '12',
          description: 'regular sizing token',
        },
      ],
    );
  });

  it('should create all tokens', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    await act(async () => {
      const createButton = result.getByTestId('button-import-create-all') as HTMLButtonElement;
      createButton.click();
    });
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
            id: 'mock-uuid',
          },
          name: 'small',
          type: 'sizing',
          value: '12',
          description: 'regular sizing token',
        },
        {
          $extensions: {
            id: 'mock-uuid',
          },
          name: 'black',
          type: 'color',
          value: '#ffffff',
          description: 'regular color token',
        },
        {
          $extensions: {
            id: 'mock-uuid',
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

  it('should ignore a new token', async () => {
    const mockStore = createMockStore(defaultStore);
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
            id: 'mock-uuid',
          },
          name: 'black',
          type: 'color',
          value: '#ffffff',
          description: 'regular color token',
        },
        {
          $extensions: {
            id: 'mock-uuid',
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

  it('should update a token', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[3] as HTMLButtonElement;
      updateButton.click();
    });

    expect(mockStore.getState().tokenState.tokens.global).toEqual(
      [
        {
          $extensions: {},
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

  it('should update all tokens', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const updateButton = result.getByTestId('button-import-update-all') as HTMLButtonElement;
      updateButton.click();
    });

    expect(mockStore.getState().tokenState.tokens.global).toEqual(
      [
        {
          $extensions: {},
          name: 'light',
          type: 'typography',
          value: {
            fontFamily: 'aria',
            fontSize: '24',
            fontWeight: 'light',
          },
        },
        {
          $extensions: {},
          name: 'opacity.50',
          type: 'opacity',
          value: '30%',
        },
      ],
    );
  });

  it('should ignore an existing token', async () => {
    const mockStore = createMockStore(defaultStore);
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
          $extensions: {},
          name: 'opacity.50',
          type: 'opacity',
          value: '30%',
        },
      ],
    );
  });

  it('should import all tokens', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const updateButton = result.queryByText('importAll') as HTMLButtonElement;
      updateButton.click();
    });

    expect(mockStore.getState().tokenState.tokens.global).toEqual(
      [
        {
          $extensions: {},
          name: 'light',
          type: 'typography',
          value: {
            fontFamily: 'aria',
            fontSize: '24',
            fontWeight: 'light',
          },
        },
        {
          $extensions: {},
          name: 'opacity.50',
          type: 'opacity',
          value: '30%',
        },
        {
          $extensions: {
            id: 'mock-uuid',
          },
          name: 'small',
          type: 'sizing',
          value: '12',
          description: 'regular sizing token',
        },
        {
          $extensions: {
            id: 'mock-uuid',
          },
          name: 'black',
          type: 'color',
          value: '#ffffff',
          description: 'regular color token',
        },
        {
          $extensions: {
            id: 'mock-uuid',
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

  it('should be able to close by clicking the close button', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );

    await act(async () => {
      const closeButton = result.queryByText('cancel') as HTMLButtonElement;
      closeButton.click();
    });
    expect(mockStore.getState().tokenState.importedTokens.newTokens).toEqual([]);
    expect(mockStore.getState().tokenState.importedTokens.updatedTokens).toEqual([]);
    expect(result.queryByText('importStyles')).not.toBeInTheDocument();
  });
});
