import React from 'react';
import { render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import ProBadge from './ProBadge';

// Mock the useFlags hook from the wrapper
jest.mock('@/app/components/LaunchDarkly', () => ({
  useFlags: jest.fn(),
}));

const { useFlags: mockUseFlags } = require('@/app/components/LaunchDarkly');

describe('ProBadge', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockUseFlags.mockReset();
  });

  it('displays get pro badge if user is on free plan (when bypassLicenseCheck is false)', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const { getByText } = render(<ProBadge campaign="test" />, { store });
    expect(getByText('getPro')).toBeInTheDocument();
  });

  it('displays pro badge if user is on pro plan', () => {
    // Mock the flag to be explicitly false (normal license validation)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: false });

    const { getByText, queryByText } = render(<ProBadge campaign="test" />, { store });
    store.dispatch.userState.setLicenseKey('test-key-123');

    waitFor(() => {
      expect(queryByText('getPro')).not.toBeInTheDocument();
      expect(getByText('pro')).toBeInTheDocument();
    });
  });

  it('displays pro badge when bypassLicenseCheck is true', () => {
    // Mock the flag to be explicitly true (bypass license check)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: true });

    const { getByText } = render(<ProBadge campaign="test" />, { store });
    // Should show "pro" even without a license key
    expect(getByText('pro')).toBeInTheDocument();
  });

  it('displays pro badge when bypassLicenseCheck is undefined (LaunchDarkly down)', () => {
    // Mock the flag to be undefined (LaunchDarkly is down)
    mockUseFlags.mockReturnValue({ bypassLicenseCheck: undefined });

    const { getByText } = render(<ProBadge campaign="test" />, { store });
    // Should show "pro" even without a license key (fallback behavior)
    expect(getByText('pro')).toBeInTheDocument();
  });
});
