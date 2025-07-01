import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { ThemePreferenceSelector } from '../ThemePreferenceSelector';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('ThemePreferenceSelector', () => {
  const renderWithStore = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('should render theme selector with correct options', () => {
    renderWithStore(<ThemePreferenceSelector />);
    
    // Check if the theme label is rendered
    expect(screen.getByText('Theme')).toBeInTheDocument();
    
    // Check if the select trigger is present
    expect(screen.getByTestId('choose-theme')).toBeInTheDocument();
  });

  it('should display Auto (Follow Figma) as default option', async () => {
    renderWithStore(<ThemePreferenceSelector />);
    
    const trigger = screen.getByTestId('choose-theme');
    expect(trigger).toHaveTextContent('Auto (Follow Figma)');
  });
});