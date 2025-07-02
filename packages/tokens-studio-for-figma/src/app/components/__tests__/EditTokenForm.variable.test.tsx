import React from 'react';
import { Provider } from 'react-redux';
import { render } from '../../../../tests/config/setupTest';
import { createMockStore, resetStore } from '../../../../tests/config/setupTest';
import { EditTokenObject, TokenTypeSchema } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import EditTokenForm from '../EditTokenForm';

describe('EditTokenForm - Variable Properties Integration', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should show variable properties for variable-compatible token types', () => {
    const mockStore = createMockStore({
      uiState: {
        showEditForm: true,
        showAutoSuggest: true,
        editToken: {
          initialName: '',
          name: '',
          value: '#ff0000', // Add color value
          status: EditTokenFormStatus.CREATE,
          type: TokenTypes.COLOR, // Variable-compatible token type
          schema: {
            type: TokenTypes.COLOR,
            value: {
              type: 'string',
            },
          } as unknown as TokenTypeSchema,
        } as EditTokenObject,
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <EditTokenForm resolvedTokens={[]} />
      </Provider>,
    );

    // Should show variable scopes section
    expect(result.getByText('Variable Scopes')).toBeInTheDocument();
    expect(result.getByText('Define where this variable can be used in Figma')).toBeInTheDocument();
    
    // Should show code syntax section
    expect(result.getByText('Code Syntax')).toBeInTheDocument();
    expect(result.getByText('Define custom code syntax for different platforms')).toBeInTheDocument();
    
    // Should show platform inputs
    expect(result.getByLabelText('Web')).toBeInTheDocument();
    expect(result.getByLabelText('Android')).toBeInTheDocument();
    expect(result.getByLabelText('iOS')).toBeInTheDocument();

    result.unmount();
  });

  it('should not show variable properties for non-variable token types', () => {
    const mockStore = createMockStore({
      uiState: {
        showEditForm: true,
        showAutoSuggest: true,
        editToken: {
          initialName: '',
          name: '',
          value: [], // Box shadow value as array
          status: EditTokenFormStatus.CREATE,
          type: TokenTypes.BOX_SHADOW, // Non-variable token type (not in tokenTypesToCreateVariable)
          schema: {
            type: TokenTypes.BOX_SHADOW,
            value: {
              type: 'array',
            },
          } as unknown as TokenTypeSchema,
        } as EditTokenObject,
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <EditTokenForm resolvedTokens={[]} />
      </Provider>,
    );

    // Should not show variable properties since box shadow is not in tokenTypesToCreateVariable
    expect(result.queryByText('Variable Scopes')).not.toBeInTheDocument();
    expect(result.queryByText('Code Syntax')).not.toBeInTheDocument();

    result.unmount();
  });

  it('should show variable properties for sizing tokens', () => {
    const mockStore = createMockStore({
      uiState: {
        showEditForm: true,
        showAutoSuggest: true,
        editToken: {
          initialName: '',
          name: '',
          value: '16px', // Add sizing value
          status: EditTokenFormStatus.CREATE,
          type: TokenTypes.SIZING, // Variable-compatible token type
          schema: {
            type: TokenTypes.SIZING,
            value: {
              type: 'string',
            },
          } as unknown as TokenTypeSchema,
        } as EditTokenObject,
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <EditTokenForm resolvedTokens={[]} />
      </Provider>,
    );

    // Should show variable properties
    expect(result.getByText('Variable Scopes')).toBeInTheDocument();
    expect(result.getByText('Code Syntax')).toBeInTheDocument();

    result.unmount();
  });
});