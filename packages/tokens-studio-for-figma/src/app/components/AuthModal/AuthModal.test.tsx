import React from 'react';
import { Provider } from 'react-redux';
import {
  createMockStore, fireEvent, render, resetStore, screen, waitFor,
} from '../../../../tests/config/setupTest';
import AuthModal from '.';
import { AuthContextProvider } from '@/context/AuthContext';
import supabase from '@/supabase';

// Hide log calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => {});

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
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passInput = screen.getByLabelText(/password/i);

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

    const loginLink = screen.getByText(/back to login/i);

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

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    expect(emailInput).toHaveValue(usedEmail);
  });

  it('Displays login error', async () => {
    const email = 'test@email.com';
    const pass = 'pass';
    const loginError = 'Invalid login credentials';

    // setupTest's msw server intercepts fetch before a fetch mock, so mock what the client returns for this error body.
    jest.spyOn(supabase, 'signIn').mockResolvedValueOnce({
      data: null,
      error: { error: 'invalid_grant', error_description: loginError },
    });

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
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passInput = screen.getByLabelText(/password/i);

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
    loginButton.click();
    await waitFor(async () => {
      const errorMsg = await screen.findByText(new RegExp(loginError, 'i'));
      expect(errorMsg).toBeInTheDocument();
    });
  });
});

it('Displays signup error', async () => {
  const email = 'test@email.com';
  const pass = 'pass';
  const signupError = 'Error signing up';

  // setupTest's msw server intercepts fetch before a fetch mock, so mock what the client returns for this error body.
  jest.spyOn(supabase, 'signUp').mockResolvedValueOnce({
    data: null,
    error: { code: 422, msg: signupError },
  });

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
  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const passInput = screen.getByLabelText(/password/i);

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
  signupButton.click();
  await waitFor(async () => {
    const errorMsg = await screen.findByText(new RegExp(signupError, 'i'));
    expect(errorMsg).toBeInTheDocument();
  });
});
