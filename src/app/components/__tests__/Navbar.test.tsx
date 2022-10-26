import React from 'react';
import { Provider } from 'react-redux';
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

    const settingsTabButton = await result.findByText('Settings');
    act(() => settingsTabButton.click());

    expect(mockStore.getState().uiState.activeTab).toEqual(Tabs.SETTINGS);
  });

  it('displays the token flow button if user is on pro plan', () => {
    const result = render(<Navbar />);

    const tokenFlowButton = result.getByTestId('token-flow-button');

    expect(tokenFlowButton).toBeInTheDocument();
  });
});
