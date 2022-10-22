import React from 'react';
import OnboardingFlow from './OnboardingFlow';
import { render, screen } from '../../../tests/config/setupTest';

describe('Settings Component', () => {
  it('renders correctly', async () => {
    render(<OnboardingFlow />);
    expect(await screen.findByText('Welcome to Figma Tokens')).not.toBeUndefined();
  });

  it('click the next button', () => {
    render(<OnboardingFlow />);
    const nextButton = screen.getByTestId('button-changelog-next') as HTMLButtonElement;
    nextButton.click();
    expect(screen.findByText('Create tokens'));
  });
});
