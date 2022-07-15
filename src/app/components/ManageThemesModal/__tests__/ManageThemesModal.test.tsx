import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore, render } from '../../../../../tests/config/setupTest';
import { ManageThemesModal } from '../ManageThemesModal';

describe('ManageThemesModal', () => {
  it('should render', () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {},
            $figmaStyleReferences: {},
          },
        ],
      },
    });

    render(
      <Provider store={mockStore}>
        <ManageThemesModal />
      </Provider>,
    ).unmount();
  });

  it('should display a blank state', () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <ManageThemesModal />
      </Provider>,
    );

    expect(result.queryByText('You don\'t have any themes yet')).not.toBeNull();
  });
});
