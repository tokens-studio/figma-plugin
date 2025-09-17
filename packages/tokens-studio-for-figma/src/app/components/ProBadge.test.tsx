import React from 'react';
import { render, waitFor, fireEvent } from '../../../tests/config/setupTest';
import { store } from '../store';
import ProBadge from './ProBadge';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

const { track } = jest.requireMock('@/utils/analytics');

describe('ProBadge', () => {
  beforeEach(() => {
    track.mockClear();
    // Reset the store state
    store.dispatch.userState.setLicenseKey('');
  });

  it('displays get pro badge if user is on free plan', () => {
    const { getByText } = render(<ProBadge campaign="test" />, { store });
    expect(getByText('getPro')).toBeInTheDocument();
  });

  it('displays pro badge if user is on pro plan', () => {
    const { getByText, queryByText } = render(<ProBadge campaign="test" />, { store });
    store.dispatch.userState.setLicenseKey('test-key-123');

    waitFor(() => {
      expect(queryByText('getPro')).not.toBeInTheDocument();
      expect(getByText('pro')).toBeInTheDocument();
    });
  });

  it('tracks click event when badge is clicked', () => {
    const { getByRole } = render(<ProBadge campaign="test-campaign" />, { store });
    const badge = getByRole('link');

    fireEvent.click(badge);

    expect(track).toHaveBeenCalledWith('Pro Badge Clicked', {
      campaign: 'test-campaign',
      source: 'pro-badge',
      isProUser: false,
    });
  });

  it('tracks click event with pro user status when pro user clicks badge', () => {
    store.dispatch.userState.setLicenseKey('test-key-123');
    const { getByRole } = render(<ProBadge campaign="test-campaign" />, { store });
    const badge = getByRole('link');

    fireEvent.click(badge);

    expect(track).toHaveBeenCalledWith('Pro Badge Clicked', {
      campaign: 'test-campaign',
      source: 'pro-badge',
      isProUser: true,
    });
  });
});
