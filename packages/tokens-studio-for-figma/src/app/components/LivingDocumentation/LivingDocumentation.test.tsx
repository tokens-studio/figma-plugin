import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { createMockStore } from '../../../../tests/config/setupTest';
import LivingDocumentation from './LivingDocumentation';

describe('LivingDocumentation', () => {
  it('should render the component', () => {
    const mockStore = createMockStore({
      tokenState: {
        tokens: {
          global: [],
          colors: [],
        },
      },
      uiState: {
        selectedLayers: 0,
      },
    });

    render(
      <Provider store={mockStore}>
        <LivingDocumentation />
      </Provider>
    );

    expect(screen.getByText('Living Documentation')).toBeInTheDocument();
    expect(screen.getByText('Generate Documentation')).toBeInTheDocument();
  });

  it('should show selection status', () => {
    const mockStore = createMockStore({
      tokenState: {
        tokens: {
          global: [],
        },
      },
      uiState: {
        selectedLayers: 1,
      },
    });

    render(
      <Provider store={mockStore}>
        <LivingDocumentation />
      </Provider>
    );

    expect(screen.getByText('✓ One layer selected in Figma')).toBeInTheDocument();
  });
});
