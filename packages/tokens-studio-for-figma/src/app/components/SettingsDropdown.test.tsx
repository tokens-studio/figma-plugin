import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render, waitFor } from '../../../tests/config/setupTest';
import SettingsDropdown from './SettingsDropdown';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { track } from '@/utils/analytics';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work', async () => {
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    waitFor(async () => {
      await userEvent.click(trigger);
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
    waitFor(async () => {
      await userEvent.click(trigger);
      const updateRemote = result.getByTestId('update-remote');

      expect(updateRemote).toBeInTheDocument();
    });
  });

  it('should call updateOnChanges', async () => {
    const updateOnChangeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateOnChange');
    const result = renderStore();

    const trigger = await result.getByTestId('bottom-bar-settings');
    waitFor(async () => {
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
    waitFor(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-remote');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateRemoteSpy).toBeCalledTimes(1);
    });
  });

  it('should call swapStyles', async () => {
    const shouldSwapStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setShouldSwapStyles');
    const result = renderStore();

    waitFor(async () => {
      const trigger = await result.getByTestId('bottom-bar-settings');
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('swap-styles');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(shouldSwapStylesSpy).toBeCalledTimes(1);
    });
  });

  it('should call autoApplyThemeOnDrop and track analytics', async () => {
    const setAutoApplyThemeOnDropSpy = jest.spyOn(mockStore.dispatch.settings, 'setAutoApplyThemeOnDrop');
    const result = renderStore();

    waitFor(async () => {
      const trigger = await result.getByTestId('bottom-bar-settings');
      await userEvent.click(trigger);
      const autoApplyOption = result.getByTestId('auto-apply-theme-on-drop');
      await userEvent.click(autoApplyOption, { pointerEventsCheck: 0 });
      
      expect(setAutoApplyThemeOnDropSpy).toBeCalledTimes(1);
      expect(track).toHaveBeenCalledWith('autoApplyThemeOnDrop', { value: true });
    });
  });

  it('should track analytics when autoApplyThemeOnDrop is toggled off', async () => {
    // Create a store with autoApplyThemeOnDrop set to true initially
    const mockStoreWithAutoApply = createMockStore({
      settings: { autoApplyThemeOnDrop: true },
    });
    const setAutoApplyThemeOnDropSpy = jest.spyOn(mockStoreWithAutoApply.dispatch.settings, 'setAutoApplyThemeOnDrop');
    const result = renderStore(mockStoreWithAutoApply);

    waitFor(async () => {
      const trigger = await result.getByTestId('bottom-bar-settings');
      await userEvent.click(trigger);
      const autoApplyOption = result.getByTestId('auto-apply-theme-on-drop');
      await userEvent.click(autoApplyOption, { pointerEventsCheck: 0 });
      
      expect(setAutoApplyThemeOnDropSpy).toBeCalledTimes(1);
      expect(track).toHaveBeenCalledWith('autoApplyThemeOnDrop', { value: false });
    });
  });
});
