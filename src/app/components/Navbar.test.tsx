import React from 'react';
import { render, resetStore } from '../../../tests/config/setupTest';
import { store } from '../store';
import Navbar from './Navbar';

describe('ProBadge', () => {
  beforeEach(() => {
    resetStore();
  });

  it('displays the buttons on navbar', () => {
    const { getByText } = render(<Navbar />, { store });
    expect(getByText('Tokens')).toBeInTheDocument();
    expect(getByText('Inspect')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('displays the token flow button if user is on pro plan', () => {
    process.env.LAUNCHDARKLY_FLAGS = 'tokenFlowButton';
    const result = render(<Navbar />);

    const tokenFlowButton = result.getByTestId('token-flow-button');

    expect(tokenFlowButton).toBeInTheDocument();
  });
});
