import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '../../../tests/config/setupTest';
import { TokensContext } from '@/context';
import { BrokenReferencesIndicator } from './BrokenReferencesIndicator';

// Mock the translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'brokenReference') return 'broken reference';
      if (key === 'brokenReferences') return 'broken references';
      if (key === 'brokenReferencesDescription') return `${options?.count} tokens have broken references that need to be fixed:`;
      if (key === 'edit') return 'Edit';
      if (key === 'close') return 'Close';
      return key;
    },
  }),
}));

const mockStore = createMockStore({});

const renderWithContext = (resolvedTokens: any[]) => {
  const mockContextValue = {
    resolvedTokens,
  };

  return render(
    <Provider store={mockStore}>
      <TokensContext.Provider value={mockContextValue}>
        <BrokenReferencesIndicator />
      </TokensContext.Provider>
    </Provider>
  );
};

describe('BrokenReferencesIndicator', () => {
  it('should not render when there are no broken references', () => {
    const resolvedTokens = [
      {
        name: 'colors.primary',
        type: 'color',
        value: '#ff0000',
        internal__Parent: 'global',
      },
      {
        name: 'colors.secondary',
        type: 'color',
        value: '#00ff00',
        internal__Parent: 'global',
      },
    ];

    renderWithContext(resolvedTokens);

    expect(screen.queryByTestId('broken-references-indicator')).not.toBeInTheDocument();
  });

  it('should render when there are broken references', () => {
    const resolvedTokens = [
      {
        name: 'colors.primary',
        type: 'color',
        value: '#ff0000',
        internal__Parent: 'global',
      },
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    renderWithContext(resolvedTokens);

    expect(screen.getByTestId('broken-references-indicator')).toBeInTheDocument();
    expect(screen.getByText('1 broken reference')).toBeInTheDocument();
  });

  it('should show correct count for multiple broken references', () => {
    const resolvedTokens = [
      {
        name: 'colors.broken1',
        type: 'color',
        value: '{colors.nonexistent1}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
      {
        name: 'colors.broken2',
        type: 'color',
        value: '{colors.nonexistent2}',
        internal__Parent: 'theme',
        failedToResolve: true,
      },
      {
        name: 'colors.working',
        type: 'color',
        value: '#ff0000',
        internal__Parent: 'global',
      },
    ];

    renderWithContext(resolvedTokens);

    expect(screen.getByTestId('broken-references-indicator')).toBeInTheDocument();
    expect(screen.getByText('2 broken references')).toBeInTheDocument();
  });

  it('should open modal when clicked', () => {
    const resolvedTokens = [
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    renderWithContext(resolvedTokens);

    const indicator = screen.getByTestId('broken-references-indicator');
    fireEvent.click(indicator);

    // Check if modal content is visible
    expect(screen.getByText('brokenReferences')).toBeInTheDocument();
    expect(screen.getByText('1 tokens have broken references that need to be fixed:')).toBeInTheDocument();
  });

  it('should group broken tokens by set in modal', () => {
    const resolvedTokens = [
      {
        name: 'colors.broken1',
        type: 'color',
        value: '{colors.nonexistent1}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
      {
        name: 'spacing.broken',
        type: 'spacing',
        value: '{spacing.nonexistent}',
        internal__Parent: 'theme',
        failedToResolve: true,
      },
      {
        name: 'colors.broken2',
        type: 'color',
        value: '{colors.nonexistent2}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    renderWithContext(resolvedTokens);

    const indicator = screen.getByTestId('broken-references-indicator');
    fireEvent.click(indicator);

    // Check if sets are displayed
    expect(screen.getByText('global')).toBeInTheDocument();
    expect(screen.getByText('theme')).toBeInTheDocument();
    
    // Check if token names are displayed
    expect(screen.getByText('colors.broken1')).toBeInTheDocument();
    expect(screen.getByText('spacing.broken')).toBeInTheDocument();
    expect(screen.getByText('colors.broken2')).toBeInTheDocument();
  });
});