import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  act, createMockStore, render,
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
    await act(async () => {
      await userEvent.click(trigger);
      const applyToDocument = result.getByTestId('apply-to-document');
      await userEvent.click(applyToDocument, { pointerEventsCheck: 0 });
      await userEvent.click(trigger);
      const applyToPage = result.getByTestId('apply-to-page');
      await userEvent.click(applyToPage, { pointerEventsCheck: 0 });
      await userEvent.click(trigger);
      const applyToSelection = result.getByTestId('apply-to-selection');
      await userEvent.click(applyToSelection, { pointerEventsCheck: 0 });
      expect(updateModeSpy).toBeCalledTimes(3);
    });
  });
  it('should trigger an update', async () => {
    const result = renderStore();
    const updateButton = await result.findByTestId('update-button');
    act(() => {
      updateButton.click();
    });

    expect(mockHandleUpdate).toBeCalledTimes(1);
  });
});
