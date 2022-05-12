import React from 'react';
import { render, resetStore } from '../../../tests/config/setupTest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows loading screen', () => {
    const { getByText } = render(<App />);
    const LoadingText = getByText('Loading, please wait.');

    expect(LoadingText).toBeInTheDocument();
  });
});
