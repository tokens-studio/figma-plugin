import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../tests/config/setupTest';
import TokensStudioForm from './TokensStudioForm';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { track } from '@/utils/analytics';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

describe('TokensStudioForm', () => {
  it('opens app.tokens.studio trial URL when start free trial is clicked', async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <TokensStudioForm
        values={{
          provider: StorageProviderType.TOKENS_STUDIO,
          name: '',
          id: '',
          secret: '',
          orgId: '',
        }}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    const startFreeTrialButton = screen.getByRole('button', { name: 'tokensStudioForm.startFreeTrial' });
    await user.click(startFreeTrialButton);

    expect(track).toHaveBeenCalledWith('Start Free Trial Clicked', {
      source: 'tokens-studio-form',
    });
    expect(openSpy).toHaveBeenCalledWith('https://app.tokens.studio/trial', '_blank');
  });
});
