import React from 'react';
import { render, fireEvent, resetStore } from '../../../tests/config/setupTest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows welcome screen when no tokens are found', () => {
    const { getByText } = render(<App />);
    const WelcomeText = getByText('Welcome to Figma Tokens.');

    expect(WelcomeText).toBeInTheDocument();
  });
});
