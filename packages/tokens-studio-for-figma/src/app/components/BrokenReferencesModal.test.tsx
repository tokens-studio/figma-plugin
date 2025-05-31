import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '../../../tests/config/setupTest';
import { BrokenReferencesModal } from './BrokenReferencesModal';

// Mock the translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'brokenReferences') return 'Broken References';
      if (key === 'brokenReferencesDescription') return `${options?.count} tokens have broken references that need to be fixed:`;
      if (key === 'edit') return 'Edit';
      if (key === 'close') return 'Close';
      return key;
    },
  }),
}));

const mockStore = createMockStore({});

const renderWithProps = (props: any) => {
  return render(
    <Provider store={mockStore}>
      <BrokenReferencesModal {...props} />
    </Provider>
  );
};

describe('BrokenReferencesModal', () => {
  const mockOnClose = jest.fn();
  const mockOnTokenEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const props = {
      isOpen: false,
      onClose: mockOnClose,
      brokenTokens: [],
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    expect(screen.queryByText('Broken References')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const brokenTokens = [
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    const props = {
      isOpen: true,
      onClose: mockOnClose,
      brokenTokens,
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    expect(screen.getByText('Broken References')).toBeInTheDocument();
    expect(screen.getByText('1 tokens have broken references that need to be fixed:')).toBeInTheDocument();
  });

  it('should group tokens by set', () => {
    const brokenTokens = [
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

    const props = {
      isOpen: true,
      onClose: mockOnClose,
      brokenTokens,
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    // Check if sets are displayed
    expect(screen.getByText('global')).toBeInTheDocument();
    expect(screen.getByText('theme')).toBeInTheDocument();
    
    // Check if token names are displayed
    expect(screen.getByText('colors.broken1')).toBeInTheDocument();
    expect(screen.getByText('spacing.broken')).toBeInTheDocument();
    expect(screen.getByText('colors.broken2')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const brokenTokens = [
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    const props = {
      isOpen: true,
      onClose: mockOnClose,
      brokenTokens,
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle edit button click', () => {
    const brokenTokens = [
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    const props = {
      isOpen: true,
      onClose: mockOnClose,
      brokenTokens,
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnTokenEdit).toHaveBeenCalledTimes(1);
  });

  it('should display token values correctly', () => {
    const brokenTokens = [
      {
        name: 'colors.broken',
        type: 'color',
        value: '{colors.nonexistent}',
        internal__Parent: 'global',
        failedToResolve: true,
      },
      {
        name: 'object.broken',
        type: 'typography',
        value: { fontFamily: '{fonts.nonexistent}', fontSize: '16px' },
        internal__Parent: 'global',
        failedToResolve: true,
      },
    ];

    const props = {
      isOpen: true,
      onClose: mockOnClose,
      brokenTokens,
      onTokenEdit: mockOnTokenEdit,
    };

    renderWithProps(props);

    // Check string value
    expect(screen.getByText('{colors.nonexistent}')).toBeInTheDocument();
    
    // Check object value (JSON stringified)
    expect(screen.getByText('{"fontFamily":"{fonts.nonexistent}","fontSize":"16px"}')).toBeInTheDocument();
  });
});