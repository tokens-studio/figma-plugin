import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  createMockStore, render, waitFor,
} from '../../../tests/config/setupTest';
import ApplySelector from './ApplySelector';

const mockHandleUpdate = jest.fn();
jest.mock('../store/useTokens', () => ({
  __esModule: true,
  default: () => ({
    handleUpdate: mockHandleUpdate,
  }),
}));

const mockStore = createMockStore({});
const renderStore = () => render(
  <Provider store={mockStore}>
    <ApplySelector />
  </Provider>,
);

describe('ApplySelector', () => {
  it('should call setUpdateMode', async () => {
    const updateModeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateMode');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await userEvent.click(trigger);
    const applyToDocument = await result.findByTestId('apply-to-document');
    await userEvent.click(applyToDocument, { pointerEventsCheck: 0 });
    await userEvent.click(trigger);
    const applyToPage = await result.findByTestId('apply-to-page');
    await userEvent.click(applyToPage, { pointerEventsCheck: 0 });
    await userEvent.click(trigger);
    const applyToSelection = await result.findByTestId('apply-to-selection');
    await userEvent.click(applyToSelection, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(updateModeSpy).toBeCalledTimes(3);
    });
  });
  it('should trigger an update', async () => {
    const result = renderStore();
    const updateButton = await result.findByTestId('update-button');
    updateButton.click();
    await waitFor(() => {
      expect(mockHandleUpdate).toBeCalledTimes(1);
    });
  });
});
