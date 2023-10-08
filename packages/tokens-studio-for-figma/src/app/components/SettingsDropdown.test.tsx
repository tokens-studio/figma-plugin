import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { act, createMockStore, render } from '../../../tests/config/setupTest';
import SettingsDropdown from './SettingsDropdown';
import { StorageProviderType } from '@/constants/StorageProviderType';

const mockStore = createMockStore({});
const mockStoreJSONBin = createMockStore({
  uiState: {
    localApiState: {
      provider: StorageProviderType.JSONBIN,
    },
  },
});

const renderStore = (store = mockStore) => render(
  <Provider store={store}>
    <SettingsDropdown />
  </Provider>,
);

describe('SettingsDropdown', () => {
  it('should work', async () => {
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-on-change');
      const updateRemote = result.queryByTestId('update-remote');
      const updateStyles = result.getByTestId('update-styles');

      expect(updateChanges).toBeInTheDocument();
      expect(updateStyles).toBeInTheDocument();
      expect(updateRemote).toBeNull();
    });
  });
  it('should show Update remote when jsonbin', async () => {
    const result = renderStore(mockStoreJSONBin);

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateRemote = result.getByTestId('update-remote');

      expect(updateRemote).toBeInTheDocument();
    });
  });

  it('should call updateOnChanges', async () => {
    const updateOnChangeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateOnChange');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-on-change');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateOnChangeSpy).toBeCalledTimes(1);
    });
  });
  it('should call updateRemote', async () => {
    const updateRemoteSpy = jest.spyOn(mockStoreJSONBin.dispatch.settings, 'setUpdateRemote');
    const result = renderStore(mockStoreJSONBin);

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-remote');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateRemoteSpy).toBeCalledTimes(1);
    });
  });
  it('should call updateStyles', async () => {
    const updateStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateStyles');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-styles');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateStylesSpy).toBeCalledTimes(1);
    });
  });

  it('should call swapStyles', async () => {
    const shouldSwapStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setShouldSwapStyles');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('swap-styles');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(shouldSwapStylesSpy).toBeCalledTimes(1);
    });
  });
});
