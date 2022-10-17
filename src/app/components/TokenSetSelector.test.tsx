import React from 'react';
import TokenSetSelector from './TokenSetSelector';
import { render } from '../../../tests/config/setupTest';
import { store } from '../store';

describe('TokenSetSelector Component', () => {
  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector />);

    expect(result.findByText('Sets')).not.toBeUndefined();
  });
});
