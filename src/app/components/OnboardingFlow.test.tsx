import React from 'react';
import OnboardingFlow from './OnboardingFlow';
import { render } from '../../../tests/config/setupTest';

describe('Settings Component', () => {
  it('renders correctly', () => {
    render(<OnboardingFlow />);
  });
});
