import React from 'react';
import {
  render, fireEvent, resetStore, getByTestId,
} from '../../../tests/config/setupTest';
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

  it('calls setTokenData when received values', () => {
    const { getByText } = render(<App />);
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'tokenvalues',
            usedTokenSet: ['global'],
            values: {
              version: '5',
              values: {
                global: {
                  size: {
                    xs: {
                      type: 'sizing',
                      description: 'some size',
                      value: '4',
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );
    const TokensText = getByText('Size');

    expect(TokensText).toBeInTheDocument();
  });
});
