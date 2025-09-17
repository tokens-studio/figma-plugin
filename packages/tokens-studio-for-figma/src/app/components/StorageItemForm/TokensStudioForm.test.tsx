import React from 'react';
import { render, fireEvent } from '../../../../tests/config/setupTest';
import TokensStudioForm from './TokensStudioForm';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

const { track } = jest.requireMock('@/utils/analytics');

describe('TokensStudioForm', () => {
  beforeEach(() => {
    track.mockClear();
  });

  const defaultValues = {
    provider: StorageProviderType.TOKENS_STUDIO,
    name: '',
    id: '',
    secret: '',
    orgId: '',
    baseUrl: '',
  };

  const mockProps = {
    values: defaultValues,
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    hasErrored: false,
    errorMessage: '',
  };

  it('tracks when start free trial button is clicked', () => {
    const { getByText } = render(<TokensStudioForm {...mockProps} />);
    const startTrialButton = getByText('tokensStudioForm.startFreeTrial');

    fireEvent.click(startTrialButton);

    expect(track).toHaveBeenCalledWith('Start Free Trial Clicked', {
      source: 'tokens-studio-form',
    });
  });
});
