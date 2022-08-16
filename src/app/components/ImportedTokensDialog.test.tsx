import React from 'react';
import { Provider } from 'react-redux';
import {
  act, render, createMockStore,
} from '../../../tests/config/setupTest';
import ImportedTokensDialog from './ImportedTokensDialog';

describe('ImportedTokensDialog', () => {
  const defaultStore = {
    tokenState: {
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
              fontFamilies: 'aria',
              fontSize: '12',
              fontWeight: 'bold'
            },
          },
          {
            name: 'opacity.50',
            type: 'opacity',
            value: '50%',
          },
        ],
      }
    }
  }

  it('shows dialog with newTokenlist and updateTokenlist', () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    expect(result.queryByText('Import Styles')).toBeInTheDocument();
    expect(result.queryByText('New Tokens')).toBeInTheDocument();
    expect(result.queryByText('Create all')).toBeInTheDocument();
    expect(result.queryByText('Existing Tokens')).toBeInTheDocument();
    expect(result.queryByText('Update all')).toBeInTheDocument();
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
    expect(result.queryByText('Cancel')).toBeInTheDocument();
    expect(result.queryByText('Import all')).toBeInTheDocument();
  });

  it('should create single token', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    // await act(async () => {
    //   const removeButton = result.getAllByTestId('imported-tokens-dialog-remove-button')[0] as HTMLButtonElement;
    //   removeButton.click();
    // });
    await act(async () => {
      const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[0] as HTMLButtonElement;
      updateButton.click();
    });
    await act(async () => {
      const importButton = result.queryByText('Import all') as HTMLButtonElement;
      importButton.click();
    });
    expect(mockStore.getState().tokenState.tokens.global).toEqual(
      [
        {
          name: 'small',
          type: 'sizing',
          value: '12',
          description: 'regular sizing token',
        }
      ]
    )
  });

  it('should create all tokens', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    // await act(async () => {
    //   const removeButton = result.getAllByTestId('imported-tokens-dialog-remove-button')[0] as HTMLButtonElement;
    //   removeButton.click();
    // });
    // await act(async () => {
    //   const updateButton = result.getAllByTestId('imported-tokens-dialog-update-button')[0] as HTMLButtonElement;
    //   updateButton.click();
    // });
    await act(async () => {
      const createButton = result.queryByText('Create all') as HTMLButtonElement;
      createButton.click();
    });
    expect(mockStore.getState().tokenState.tokens.global).toEqual(
      [
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
      ]
    )
  });
});

