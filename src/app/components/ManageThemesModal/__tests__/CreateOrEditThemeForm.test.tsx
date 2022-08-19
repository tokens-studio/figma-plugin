import React from 'react';
import { Provider } from 'react-redux';
import { act, createMockStore, render } from '../../../../../tests/config/setupTest';
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

    const stylesTabButton = await result.findByText('Styles');
    act(() => stylesTabButton.click());

    expect(result.queryAllByText('Attach local styles')).toHaveLength(3);
  });
});
