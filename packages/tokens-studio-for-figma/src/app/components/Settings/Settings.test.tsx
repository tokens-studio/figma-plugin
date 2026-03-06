import React from 'react';
import Settings from './Settings';
import {
  render, resetStore, fireEvent, waitFor,
} from '../../../../tests/config/setupTest';
import { store } from '../../store';
import { replay } from '@/app/sentry';

jest.mock('@/app/sentry', () => ({
  setupReplay: jest.fn(),
  initializeSentry: jest.fn(),
  replay: {
    getReplayId: jest.fn(() => 'test-session-id'),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

describe('Settings Component', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Settings />);
  });

  it('show onboarding explainer syncproviders', () => {
    store.dispatch.uiState.setOnboardingExplainerSyncProviders(true);

    const result = render(<Settings />);

    expect(result.findByText('Set up where tokens should be stored')).not.toBeUndefined();
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSyncProviders(true);
    const result = render(<Settings />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Set up where tokens should be stored')).toBeNull();
  });

  it('reset onboarding explainers', async () => {
    const result = render(<Settings />);

    fireEvent.click(result.getByTestId('reset-onboarding'));
    waitFor(() => {
      expect(result.queryByText('Set up where tokens should be stored')).not.toBeNull();
    });
  });

  it('shows a session id when session recording is enabled', async () => {
    (replay.getReplayId as jest.Mock)
      .mockReturnValueOnce('')
      .mockReturnValueOnce('session-id-123');
    const result = render(<Settings />);

    const sessionSwitch = result.getByRole('switch');
    fireEvent.click(sessionSwitch);

    await waitFor(() => {
      expect(result.queryByText(/yourCurrentSessionIdIs|Your current session id is/)).not.toBeNull();
      expect(result.queryByText('session-id-123')).not.toBeNull();
    });
  });
});
