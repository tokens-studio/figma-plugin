import React from 'react';
import Settings from './Settings';
import {
  render, screen, resetStore, fireEvent,
} from '../../../../tests/config/setupTest';
import { store } from '../../store';

describe('Settings Component', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Settings />);
  });

  it('can toggle ignoreFirstPartForStyles', () => {
    render(<Settings />);

    const checkbox = screen.getByTestId('ignoreFirstPartForStyles');
    fireEvent.click(checkbox, {
      target: checkbox,
    });

    expect(store.getState().settings.ignoreFirstPartForStyles).toBe(true);
  });

  it('can toggle prefixStylesWithThemeName', () => {
    render(<Settings />);

    const checkbox = screen.getByTestId('prefixStylesWithThemeName');
    fireEvent.click(checkbox, {
      target: checkbox,
    });

    expect(store.getState().settings.prefixStylesWithThemeName).toBe(true);
  });

  it('show onboarding explainer syncproviders', () => {
    store.dispatch.uiState.setOnboardingExplainerSyncProviders(true);

    const result = render(<Settings />);

    expect(result.findByText('Set up where tokens should be stored')).not.toBeUndefined();
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSyncProviders(true);
    const result = render(<Settings />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Set up where tokens should be stored')).toBeNull();
  });

  it('reset onboarding explainers', async () => {
    const result = render(<Settings />);

    fireEvent.click(result.getByTestId('reset-onboarding'));

    expect(result.queryByText('Set up where tokens should be stored')).not.toBeNull();
  });
});
