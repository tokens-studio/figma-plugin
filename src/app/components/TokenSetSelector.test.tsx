import React from 'react';
import TokenSetSelector from './TokenSetSelector';
import { render, fireEvent } from '../../../tests/config/setupTest';
import { store } from '../store';

describe('TokenSetSelector Component', () => {
  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector />);

    expect(result.findByText('Sets')).not.toBeUndefined();
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');
    const result = render(<TokenSetSelector />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Sets')).toBeNull();
  });

  it('create new token set', async () => {
    const result = render(<TokenSetSelector />);
    const newTokenSetButton = await result.findByTestId('new-set-button');
    fireEvent.click(newTokenSetButton);
    const newTokenSetInput = await result.findByTestId('create-set-input');
    fireEvent.change(newTokenSetInput, { target: { value: 'newSet' } });
    const createButton = await result.getByRole('button', {
      name: /create/i,
    });

    fireEvent.click(createButton);
    expect(store.getState().tokenState.tokens).toEqual({
      newSet: [],
      global: [],
    });
  });
});
