import React from 'react';
import { render } from '../../../tests/config/setupTest';
import { store } from '../store';
import Navbar from './Navbar';

describe('ProBadge', () => {
  it('displays get pro badge if user is on free plan', () => {
    const { getByText } = render(<Navbar />, { store });
    expect(getByText('Tokens')).toBeInTheDocument();
    expect(getByText('Inspect')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('displays pro badge if user is on pro plan', () => {
    const { getByTestId } = render(<Navbar />, { store });
    store.dispatch.userState.setLicenseKey('test-key-123');

    const tokenFlowButton = getByTestId('token-flow-button');

    expect(tokenFlowButton).toBeInTheDocument();
    expect(tokenFlowButton).not.toBeDisabled();
  });
});
