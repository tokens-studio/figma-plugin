import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore, render, resetStore } from '../../../tests/config/setupTest';
import { EditTokenObject } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import EditTokenFormModal from './EditTokenFormModal';

describe('EditTokenFormModal', () => {
  beforeEach(() => {
    resetStore();
  });
  it('should render editTokenFormModal', () => {
    const mockStore = createMockStore({
      uiState: {
        showEditForm: true,
        showAutoSuggest: true,
        editToken: {
          status: EditTokenFormStatus.CREATE,
        } as EditTokenObject,
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <EditTokenFormModal resolvedTokens={[]} />
      </Provider>,
    );

    expect(result.getByText('New Token')).toBeInTheDocument();
    result.unmount();
  });
});
