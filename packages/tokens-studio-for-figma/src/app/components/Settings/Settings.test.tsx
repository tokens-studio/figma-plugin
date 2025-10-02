import React from 'react';
import Settings from './Settings';
import {
  render, resetStore, fireEvent, waitFor,
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
    waitFor(() => {
      expect(result.queryByText('Set up where tokens should be stored')).not.toBeNull();
    });
  });

  it('renders token application settings switches', () => {
    const result = render(<Settings />);

    // Check if the switches exist by ID
    expect(result.container.querySelector('#updateOnChange')).toBeTruthy();
    expect(result.container.querySelector('#shouldSwapStyles')).toBeTruthy();
    expect(result.container.querySelector('#shouldUpdateStyles')).toBeTruthy();
    expect(result.container.querySelector('#autoApplyThemeOnDrop')).toBeTruthy();
    expect(result.container.querySelector('#inspectDeep')).toBeTruthy();
  });

  it('renders export options switches', () => {
    const result = render(<Settings />);

    // Check if the switches exist by ID
    expect(result.container.querySelector('#variablesColor')).toBeTruthy();
    expect(result.container.querySelector('#variablesString')).toBeTruthy();
    expect(result.container.querySelector('#variablesNumber')).toBeTruthy();
    expect(result.container.querySelector('#variablesBoolean')).toBeTruthy();
    expect(result.container.querySelector('#stylesColor')).toBeTruthy();
    expect(result.container.querySelector('#stylesTypography')).toBeTruthy();
    expect(result.container.querySelector('#stylesEffect')).toBeTruthy();
  });

  it('renders export rules switches', () => {
    const result = render(<Settings />);

    // Check if the switches exist by ID
    expect(result.container.querySelector('#ignoreFirstPartForStyles')).toBeTruthy();
    expect(result.container.querySelector('#prefixStylesWithThemeName')).toBeTruthy();
    expect(result.container.querySelector('#createStylesWithVariableReferences')).toBeTruthy();
    expect(result.container.querySelector('#renameExistingStylesAndVariables')).toBeTruthy();
    expect(result.container.querySelector('#removeStylesAndVariablesWithoutConnection')).toBeTruthy();
  });
});
