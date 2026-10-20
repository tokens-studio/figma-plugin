import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/constants/Tabs';
import {
  act, createMockStore, render, waitFor,
} from '../../../../tests/config/setupTest';
import Navbar from '../Navbar';
import { useUpgradeDialogStore } from '@/app/store/useUpgradeDialogStore';

describe('Navbar', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    const settingsTabButton = await result.findByText('settings');
    act(() => settingsTabButton.click());

    expect(mockStore.getState().uiState.activeTab).toEqual(Tabs.SETTINGS);
  });

  it('opens the upgrade dialog instead of token flow for users without a license', async () => {
    global.open = jest.fn();
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    await userEvent.click(result.getByTestId('token-flow-button'));

    expect(useUpgradeDialogStore.getState().feature).toEqual('tokenFlow');
    expect(global.open).not.toHaveBeenCalled();
    act(() => useUpgradeDialogStore.getState().closeUpgradeDialog());
  });

  it('should open the token flow page when the button is clicked', async () => {
    global.open = jest.fn();

    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );
    mockStore.dispatch.userState.setLicenseKey('test-key-123');

    const tokenFlowButton = await result.findByTestId('token-flow-button');
    await userEvent.click(tokenFlowButton);
    await waitFor(() => {
      expect(global.open).toHaveBeenCalledWith(`${process.env.TOKEN_FLOW_APP_URL}?id=test-id`);
    });
  });

  it('displays the second screen icon if user has access to it via license key', async () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    expect(result.queryByLabelText('Second Screen')).not.toBeInTheDocument();

    mockStore.dispatch.userState.setLicenseKey('test-key-123');
    await waitFor(() => {
      const secondScreenButton = result.getByLabelText('Second Screen');
      expect(secondScreenButton).toBeInTheDocument();
    });
  });
});
