import React from 'react';
import { Provider } from 'react-redux';
import OnboardingFlow from './OnboardingFlow';
import { render, resetStore, createMockStore } from '../../../tests/config/setupTest';

// Hide error calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Settings Component', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders correctly', async () => {
    const mockStore = createMockStore({
      uiState: {
        lastOpened: 0,
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <OnboardingFlow />
      </Provider>,
    );
    expect(result.getByText('Welcome!')).toBeInTheDocument();
  });
});
