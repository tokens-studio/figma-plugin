import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render, waitFor } from '../../../tests/config/setupTest';
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
    await userEvent.click(trigger);
    await waitFor(() => {
      const updateChangesOption = result.getByTestId('update-on-change');
      const updateRemoteOption = result.queryByTestId('update-remote');
      const shouldUpdateStylesOption = result.getByTestId('should-update-styles');

      expect(updateChangesOption).toBeInTheDocument();
      expect(shouldUpdateStylesOption).toBeInTheDocument();
      expect(updateRemoteOption).toBeNull();
    });
  });
  it('should show Update remote when jsonbin', async () => {
    const result = renderStore(mockStoreJSONBin);

    const trigger = await result.getByTestId('bottom-bar-settings');
    await userEvent.click(trigger);
    await waitFor(() => {
      const updateRemote = result.getByTestId('update-remote');

      expect(updateRemote).toBeInTheDocument();
    });
  });

  it('should call updateOnChanges', async () => {
    const updateOnChangeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateOnChange');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await userEvent.click(trigger);
    const updateChanges = await result.findByTestId('update-on-change');
    await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(updateOnChangeSpy).toBeCalledTimes(1);
    });
  });
  it('should call updateRemote', async () => {
    const updateRemoteSpy = jest.spyOn(mockStoreJSONBin.dispatch.settings, 'setUpdateRemote');
    const result = renderStore(mockStoreJSONBin);

    const trigger = await result.getByTestId('bottom-bar-settings');
    await userEvent.click(trigger);
    const updateChanges = await result.findByTestId('update-remote');
    await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(updateRemoteSpy).toBeCalledTimes(1);
    });
  });

  it('should call swapStyles', async () => {
    const shouldSwapStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setShouldSwapStyles');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    await userEvent.click(trigger);
    const updateChanges = await result.findByTestId('swap-styles');
    await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(shouldSwapStylesSpy).toBeCalledTimes(1);
    });
  });
});
