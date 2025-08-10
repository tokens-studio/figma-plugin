import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, render, fireEvent,
} from '../../../../../tests/config/setupTest';
import { CreateOrEditThemeForm } from '../CreateOrEditThemeForm';

describe('CreateOrEditThemeForm', () => {
  it('should work', async () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {},
        }],
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <CreateOrEditThemeForm
          id="light"
          defaultValues={{
            name: 'Light',
            tokenSets: {},
          }}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      </Provider>,
    );

    expect((await result.findByTestId('create-or-edit-theme-form--input--name') as HTMLInputElement).value).toEqual('Light');

    const stylesTabButton = await result.findByText('stylesAndVariables');
    act(() => stylesTabButton.click());

    expect(result.queryAllByText('attachLocalStyles')).toHaveLength(3);
  });

  it('should render search input for token sets', async () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {},
        }],
        tokens: {
          core: [{ name: 'color.primary', value: '#000' }],
          'theme/light': [{ name: 'color.bg', value: '#fff' }],
          'components/button': [{ name: 'button.bg', value: '{color.primary}' }],
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <CreateOrEditThemeForm
          defaultValues={{
            name: 'Test Theme',
            tokenSets: {},
          }}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      </Provider>,
    );

    // Make sure we're on the Sets tab
    expect(await result.findByTestId('token-sets-search-input')).toBeInTheDocument();
  });

  it('should filter token sets based on search query', async () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: {},
        }],
        tokens: {
          core: [{ name: 'color.primary', value: '#000' }],
          'theme/light': [{ name: 'color.bg', value: '#fff' }],
          'theme/dark': [{ name: 'color.bg', value: '#000' }],
          'components/button': [{ name: 'button.bg', value: '{color.primary}' }],
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <CreateOrEditThemeForm
          defaultValues={{
            name: 'Test Theme',
            tokenSets: {},
          }}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      </Provider>,
    );

    const searchInput = await result.findByTestId('token-sets-search-input');

    // Type 'theme' in search
    fireEvent.change(searchInput, { target: { value: 'theme' } });

    // Should show theme-related token sets but not others
    expect(result.queryByText('theme/light')).toBeInTheDocument();
    expect(result.queryByText('theme/dark')).toBeInTheDocument();

    // Type 'button' in search
    fireEvent.change(searchInput, { target: { value: 'button' } });

    // Should show button component
    expect(result.queryByText('components/button')).toBeInTheDocument();
  });
});
