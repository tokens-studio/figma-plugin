import React from 'react';
import { render, fireEvent, resetStore } from '../../../tests/config/setupTest';
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

  it('skip to start screen when there is no tokens', async () => {
    const { getAllByText, getByText } = render(<App />);

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'tokenvalues',
            status: '',
            values: {
              version: '5',
              usedTokenSet: ['global'],
              themes: [],
              activeTheme: null,
              checkForChanges: 'true',
              values: {
                global: [],
              },
            },
          },
        },
      }),
    );

    const cancelButtons = getAllByText('Cancel');
    fireEvent.click(cancelButtons[1]);

    await new Promise((r) => setTimeout(r, 1000));

    const welcomeText = getByText('Welcome to Figma Tokens.');
    expect(welcomeText).toBeInTheDocument();
  });
});
