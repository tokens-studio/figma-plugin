import React from 'react';
import { Provider } from 'react-redux';
import { render, resetStore, createMockStore } from '../../../tests/config/setupTest';
import { store } from '../store';
import Navbar from './Navbar';

jest.mock('launchdarkly-react-client-sdk', () => ({
  LDProvider: (props: React.PropsWithChildren<unknown>) => props.children,
  useLDClient: () => ({
    identify: () => Promise.resolve(),
  }),
  useFlags: () => ({
    tokenFlowButton: false,
  }),
}));

describe('ProBadge', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays the buttons on navbar', () => {
    const { getByText } = render(<Navbar />, { store });
    expect(getByText('Tokens')).toBeInTheDocument();
    expect(getByText('Inspect')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('displays the token flow button if user is on pro plan', () => {
    const mockStore = createMockStore({
      userState: {
        licenseKey: 'FIGMA-TOKENS',
        licenseDetails: {
          plan: 'Pro Plan',
          clientEmail: 'example@domain.com',
          entitlements: ['pro'],
        },
      },
    });
    const result = render(
      <Provider store={mockStore}>
        <Navbar />
      </Provider>,
    );

    const tokenFlowButton = result.getByTestId('token-flow-button');

    expect(tokenFlowButton).toBeInTheDocument();
  });
});
