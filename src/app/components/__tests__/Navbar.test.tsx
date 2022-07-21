import React from 'react';
import { Provider } from 'react-redux';
import { Tabs } from '@/constants/Tabs';
import { act, createMockStore, render } from '../../../../tests/config/setupTest';
import Navbar from '../Navbar';

describe('Navbar', () => {
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
});
