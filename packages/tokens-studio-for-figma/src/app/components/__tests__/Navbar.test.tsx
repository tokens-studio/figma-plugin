import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/constants/Tabs';
import {
  act, createMockStore, render, waitFor,
} from '../../../../tests/config/setupTest';
import Navbar from '../Navbar';

// Mock the useFlags hook from the wrapper
jest.mock('@/app/components/LaunchDarkly', () => ({
  useFlags: jest.fn(),
}));

const { useFlags: mockUseFlags } = require('@/app/components/LaunchDarkly');

describe('Navbar', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockUseFlags.mockReset();
    // Default to false (normal license validation) unless overridden in specific tests
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });
  });

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

  it('hides token flow button for free users when bypassLicenseCheck is false', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Without license key, button should not be visible
    expect(() => {
      result.getByTestId('token-flow-button');
    }).toThrowError();
  });

  it('displays the token flow button if user has access to it via license key', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Without license key, button should not be visible
    expect(() => {
      result.getByTestId('token-flow-button');
    }).toThrowError();

    // After setting license key, button should appear
    mockStore.dispatch.userState.setLicenseKey('test-key-123');
    waitFor(() => {
      const tokenFlowButton = result.getByTestId('token-flow-button');
      expect(tokenFlowButton).toBeInTheDocument();
    });
  });

  it('displays the token flow button if user has access to it via Studio PAT', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Without Studio PAT, button should not be visible
    expect(() => {
      result.getByTestId('token-flow-button');
    }).toThrowError();

    // After setting Studio PAT, button should appear
    mockStore.dispatch.userState.setTokensStudioPAT('studio-pat-token-123');
    waitFor(() => {
      const tokenFlowButton = result.getByTestId('token-flow-button');
      expect(tokenFlowButton).toBeInTheDocument();
    });
  });

  it('displays token flow button when bypassLicenseCheck is true', () => {
    // Mock the flag to be explicitly true (bypass license check)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: true });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Button should be visible even without license key
    const tokenFlowButton = result.getByTestId('token-flow-button');
    expect(tokenFlowButton).toBeInTheDocument();
  });

  it('displays token flow button when bypassLicenseCheck is undefined (LaunchDarkly down)', () => {
    // Mock the flag to be undefined (LaunchDarkly is down)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: undefined });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Button should be visible even without license key (fallback behavior)
    const tokenFlowButton = result.getByTestId('token-flow-button');
    expect(tokenFlowButton).toBeInTheDocument();
  });

  it('should open the token flow page when the button is clicked', async () => {
    // Use normal license validation (flag = false)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

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

  it('hides second screen icon for free users when bypassLicenseCheck is false', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Without license, second screen should not be visible
    expect(result.queryByLabelText('Second Screen')).not.toBeInTheDocument();
  });

  it('displays the second screen icon if user has access to it via license key', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

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
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

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

  it('displays second screen icon when bypassLicenseCheck is true', () => {
    // Mock the flag to be explicitly true (bypass license check)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: true });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Set a license key to trigger the same code path as the passing tests
    mockStore.dispatch.userState.setLicenseKey('test-key-123');

    waitFor(() => {
      // Second screen should be visible
      const secondScreenButton = result.getByLabelText('Second Screen');
      expect(secondScreenButton).toBeInTheDocument();
    });
  });

  it('displays second screen icon when bypassLicenseCheck is undefined (LaunchDarkly down)', () => {
    // Mock the flag to be undefined (LaunchDarkly is down)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: undefined });

    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    // Set a license key to trigger the same code path as the passing tests
    mockStore.dispatch.userState.setLicenseKey('test-key-123');

    waitFor(() => {
      // Second screen should be visible
      const secondScreenButton = result.getByLabelText('Second Screen');
      expect(secondScreenButton).toBeInTheDocument();
    });
  });
});
