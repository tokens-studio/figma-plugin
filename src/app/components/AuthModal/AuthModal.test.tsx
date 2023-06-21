import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { mockFetch } from '../../../../tests/__mocks__/fetchMock';
import {
  createMockStore, fireEvent, render, resetStore, screen,
} from '../../../../tests/config/setupTest';
import AuthModal from '.';
import { AuthContextProvider } from '@/context/AuthContext';

// Hide log calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('launchdarkly-react-client-sdk', () => ({
  LDProvider: (props: React.PropsWithChildren<unknown>) => props.children,
  useLDClient: () => ({
    identify: () => Promise.resolve(),
  }),
  useFlags: () => ({}),
}));

describe('Add license key', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly & inputs work', () => {
    const email = 'test@email.com';
    const pass = 'pass';
    const mockStore = createMockStore({
      uiState: {
        secondScreenEnabled: true,
      },
    });
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>,
    );

    const loginButton = screen.getByRole('button', { name: /log in/i });
    const emailInput = screen.getByTestId('input-email');
    const passInput = screen.getByTestId('input-password');

    expect(loginButton).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: email },
    });
    fireEvent.change(passInput, {
      target: { value: pass },
    });

    expect(emailInput).toHaveValue(email);
    expect(passInput).toHaveValue(pass);
  });

  it('user can go to signup & initial mode is sign in', () => {
    const mockStore = createMockStore({
      uiState: {
        secondScreenEnabled: true,
      },
    });
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>,
    );

    const message = screen.getByText(/do not have an account \?/i);
    const signupLink = screen.getByText(/sign up here/i);

    expect(message).toBeInTheDocument();
    expect(signupLink).toBeInTheDocument();

    fireEvent.click(signupLink);

    const signupMessage = screen.getByText(/already have an account \?/i);
    const loginLink = screen.getByText(/log in here/i);

    expect(signupMessage).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
  });

  it('Email gets pre-filled if theres an email saved', () => {
    const usedEmail = 'used@email.com';
    const mockStore = createMockStore({
      uiState: {
        secondScreenEnabled: true,
      },
      userState: {
        usedEmail,
      },
    });
    render(
      <Provider store={mockStore}>
        <AuthModal />
      </Provider>,
    );

    const emailInput = screen.getByTestId('input-email');
    expect(emailInput).toHaveValue(usedEmail);
  });

  it('Displays login error', async () => {
    const email = 'test@email.com';
    const pass = 'pass';
    const loginError = 'Error loggingg in';

    mockFetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({ error: { msg: loginError } }),
    }));

    const mockStore = createMockStore({
      uiState: {
        secondScreenEnabled: true,
      },
    });
    render(
      <Provider store={mockStore}>
        <AuthContextProvider authData={null}>
          <AuthModal />
        </AuthContextProvider>
      </Provider>,
    );

    const loginButton = screen.getByRole('button', { name: /log in/i });
    const emailInput = screen.getByTestId('input-email');
    const passInput = screen.getByTestId('input-password');

    expect(loginButton).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: email },
    });
    fireEvent.change(passInput, {
      target: { value: pass },
    });

    expect(emailInput).toHaveValue(email);
    await act(async () => {
      loginButton.click();

      const errorMsg = await screen.findByText(new RegExp(loginError, 'i'));
      expect(errorMsg).toBeInTheDocument();
    });
  });

  it('Displays signup error', async () => {
    const email = 'test@email.com';
    const pass = 'pass';
    const signupError = 'Error signing up';

    mockFetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({ error: { msg: signupError } }),
    }));

    const mockStore = createMockStore({
      uiState: {
        secondScreenEnabled: true,
      },
    });
    render(
      <Provider store={mockStore}>
        <AuthContextProvider authData={null}>
          <AuthModal />
        </AuthContextProvider>
      </Provider>,
    );

    const message = screen.getByText(/do not have an account \?/i);
    const signupLink = screen.getByText(/sign up here/i);

    expect(message).toBeInTheDocument();
    expect(signupLink).toBeInTheDocument();

    fireEvent.click(signupLink);

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    const emailInput = screen.getByTestId('input-email');
    const passInput = screen.getByTestId('input-password');

    expect(signupButton).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: email },
    });
    fireEvent.change(passInput, {
      target: { value: pass },
    });

    expect(emailInput).toHaveValue(email);
    await act(async () => {
      signupButton.click();

      const errorMsg = await screen.findByText(new RegExp(signupError, 'i'));
      expect(errorMsg).toBeInTheDocument();
    });
  });
});
