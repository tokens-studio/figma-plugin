import React from 'react';
import { Provider } from 'react-redux';
import {
  render, createMockStore,
} from '../../../tests/config/setupTest';
import ImportedTokensDialog from './ImportedTokensDialog';

describe('ImportedTokensDialog', () => {
  const mockStore = createMockStore({
    tokenState: {
      importedTokens: {
        newTokens: [
          {
            name: 'black',
            type: 'color',
            value: '#ffffff',
            description: 'regular color token',
          },
          {
            name: 'light',
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
          }
        ],
      }
    }
  });

  it('shows newTokenlist and updateTokenlist with value and oldValue and description', () => {
    const result = render(
      <Provider store={mockStore}>
        <ImportedTokensDialog />
      </Provider>,
    );
    expect(result.queryByText('New Tokens')).toBeInTheDocument();
    expect(result.queryByText('Create all')).toBeInTheDocument();
    expect(result.queryByText('Existing Tokens')).toBeInTheDocument();
    expect(result.queryByText('Update all')).toBeInTheDocument();
    expect(result.queryByText('#ffffff')).toBeInTheDocument();
    expect(result.queryByText('regular color token')).toBeInTheDocument();
    expect(result.queryByText('before: old description')).toBeInTheDocument();
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

});
