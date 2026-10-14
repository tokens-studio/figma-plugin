import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import LaunchScreen from '../LaunchScreen/LaunchScreen';
import ConsentDialog from '../LaunchScreen/ConsentDialog';

describe('LaunchScreen', () => {
  it('calls the matching handler for each button', () => {
    const onCreateAccount = jest.fn();
    const onLogIn = jest.fn();
    const onContinueWithoutAccount = jest.fn();
    const { getByTestId } = render(
      <LaunchScreen
        onCreateAccount={onCreateAccount}
        onLogIn={onLogIn}
        onContinueWithoutAccount={onContinueWithoutAccount}
      />,
    );

    fireEvent.click(getByTestId('launch-screen-create-account'));
    fireEvent.click(getByTestId('launch-screen-log-in'));
    fireEvent.click(getByTestId('launch-screen-continue'));

    expect(onCreateAccount).toHaveBeenCalledTimes(1);
    expect(onLogIn).toHaveBeenCalledTimes(1);
    expect(onContinueWithoutAccount).toHaveBeenCalledTimes(1);
  });

  it('disables Log In while logging in and shows the login error', () => {
    const { getByTestId, getByRole } = render(<LaunchScreen isLoggingIn error="Login failed" />);

    expect(getByTestId('launch-screen-log-in')).toHaveProperty('disabled', true);
    expect(getByRole('alert').textContent).toBe('Login failed');
  });

  it('renders the footer links', () => {
    const { getByText } = render(<LaunchScreen />);

    expect(getByText('joinSlackShort').closest('a')?.getAttribute('href')).toBe('https://tokens.studio/slack');
    expect(getByText('docs').closest('a')?.getAttribute('target')).toBe('_blank');
    expect(getByText('reportIssue').closest('a')?.getAttribute('href')).toBe('https://github.com/tokens-studio/figma-plugin/issues');
  });
});

describe('ConsentDialog', () => {
  it('keeps Agree disabled until the terms are accepted', () => {
    const onAgree = jest.fn();
    const { getByTestId } = render(<ConsentDialog isOpen onAgree={onAgree} />);

    expect(getByTestId('consent-agree')).toHaveProperty('disabled', true);
    fireEvent.click(getByTestId('consent-terms'));
    expect(getByTestId('consent-agree')).toHaveProperty('disabled', false);

    fireEvent.click(getByTestId('consent-agree'));
    expect(onAgree).toHaveBeenCalledWith({ performanceAnalytics: false });
  });

  it('passes the optional analytics choice to onAgree', () => {
    const onAgree = jest.fn();
    const { getByTestId } = render(<ConsentDialog isOpen onAgree={onAgree} />);

    fireEvent.click(getByTestId('consent-terms'));
    fireEvent.click(getByTestId('consent-analytics'));
    fireEvent.click(getByTestId('consent-agree'));

    expect(onAgree).toHaveBeenCalledWith({ performanceAnalytics: true });
  });

  it('calls onCancel from the Cancel button', () => {
    const onCancel = jest.fn();
    const { getByText } = render(<ConsentDialog isOpen onCancel={onCancel} />);

    fireEvent.click(getByText('cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
