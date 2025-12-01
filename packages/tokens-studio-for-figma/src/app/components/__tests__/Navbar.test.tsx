import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/constants/Tabs';
import {
  act, createMockStore, render, waitFor,
} from '../../../../tests/config/setupTest';
import Navbar from '../Navbar';

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

  it('displays the token flow button if user has access to it via license key', () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    expect(() => {
      result.getByTestId('token-flow-button');
    }).toThrowError();

    mockStore.dispatch.userState.setLicenseKey('test-key-123');
    waitFor(() => {
      const tokenFlowButton = result.getByTestId('token-flow-button');
      expect(tokenFlowButton).toBeInTheDocument();
    });
  });

  it('displays the token flow button if user has access to it via Studio PAT', () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    expect(() => {
      result.getByTestId('token-flow-button');
    }).toThrowError();

    mockStore.dispatch.userState.setTokensStudioPAT('studio-pat-token-123');
    waitFor(() => {
      const tokenFlowButton = result.getByTestId('token-flow-button');
      expect(tokenFlowButton).toBeInTheDocument();
    });
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
    waitFor(() => {
      userEvent.click(tokenFlowButton);
      expect(global.open).toHaveBeenCalledWith(`${process.env.TOKEN_FLOW_APP_URL}?id=test-id`);
    });
  });

  it('displays the second screen icon if user has access to it via license key', () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    expect(result.queryByLabelText('Second Screen')).not.toBeInTheDocument();

    mockStore.dispatch.userState.setLicenseKey('test-key-123');
    waitFor(() => {
      const secondScreenButton = result.getByLabelText('Second Screen');
      expect(secondScreenButton).toBeInTheDocument();
    });
  });

  it('displays the second screen icon if user has access to it via Studio PAT', () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    expect(result.queryByLabelText('Second Screen')).not.toBeInTheDocument();

    mockStore.dispatch.userState.setTokensStudioPAT('studio-pat-token-123');
    waitFor(() => {
      const secondScreenButton = result.getByLabelText('Second Screen');
      expect(secondScreenButton).toBeInTheDocument();
    });
  });
});
