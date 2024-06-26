import React from 'react';
import { Provider } from 'react-redux';
import {
  createMockStore, render, waitFor,
} from '../../../../../tests/config/setupTest';
import { ManageThemesModal } from '../ManageThemesModal';

const mockConfirm = jest.fn();

jest.mock('../../../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

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

    expect(result.queryByText('manageThemesModal.emptyTitle')).not.toBeNull();
  });

  it('should render create new theme form', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <ManageThemesModal />
      </Provider>,
    );

    await result.getByText('newTheme').click();
    expect(result.getByText('saveTheme')).toBeInTheDocument();
  });

  it('should render edit theme form', async () => {
    mockConfirm.mockImplementationOnce(() => (
      Promise.resolve(false)
    ));
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

    const result = render(
      <Provider store={mockStore}>
        <ManageThemesModal />
      </Provider>,
    );
    waitFor(() => {
      result.getByTestId('singlethemeentry-light').click();
      result.getByText('delete').click();
      expect(result.getByText('delete')).toBeInTheDocument();
    });
  });
});
