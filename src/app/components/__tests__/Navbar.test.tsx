import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/constants/Tabs';
import { act, createMockStore, render } from '../../../../tests/config/setupTest';
import Navbar from '../Navbar';

describe('Navbar', () => {
  beforeAll(() => {
    process.env.LAUNCHDARKLY_FLAGS = 'tokenFlowButton';
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

  it('displays the token flow button if user has access to it', () => {
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
    const tokenFlowButton = result.getByTestId('token-flow-button');
    expect(tokenFlowButton).toBeInTheDocument();
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
    await act(async () => userEvent.click(tokenFlowButton));

    expect(global.open).toHaveBeenCalledWith(`${process.env.TOKEN_FLOW_APP_URL}?id=test-id`);
  });
});
