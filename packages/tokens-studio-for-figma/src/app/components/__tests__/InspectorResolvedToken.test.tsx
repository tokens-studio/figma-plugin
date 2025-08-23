import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import InspectorResolvedToken from '../InspectorResolvedToken';
import { TokenTypes } from '@/constants/TokenTypes';

// Mock the TokenTooltip to test that it's being used
jest.mock('../TokenTooltip', () => ({
  TokenTooltip: ({ children, token }: any) => (
    <div data-testid="token-tooltip" data-token-name={token.name} data-token-type={token.type}>
      {children}
    </div>
  ),
}));

const MockProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    {children}
  </Provider>
);

describe('InspectorResolvedToken with TokenTooltip', () => {
  it('wraps COLOR token in TokenTooltip', () => {
    const token = {
      name: 'primary.500',
      value: '#3B82F6',
      type: TokenTypes.COLOR,
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('primary.500');
    expect(tooltip.getAttribute('data-token-type')).toBe('color');
  });

  it('wraps TYPOGRAPHY token in TokenTooltip', () => {
    const token = {
      name: 'heading.large',
      value: { fontFamily: 'Inter', fontSize: '24px' },
      type: TokenTypes.TYPOGRAPHY,
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('heading.large');
    expect(tooltip.getAttribute('data-token-type')).toBe('typography');
  });

  it('wraps BOX_SHADOW token in TokenTooltip', () => {
    const token = {
      name: 'shadow.large',
      value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      type: TokenTypes.BOX_SHADOW,
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('shadow.large');
    expect(tooltip.getAttribute('data-token-type')).toBe('boxShadow');
  });

  it('wraps BORDER token in TokenTooltip', () => {
    const token = {
      name: 'border.default',
      value: { color: '#E5E7EB', width: '1px', style: 'solid' },
      type: TokenTypes.BORDER,
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('border.default');
    expect(tooltip.getAttribute('data-token-type')).toBe('border');
  });

  it('wraps ASSET token in TokenTooltip', () => {
    const token = {
      name: 'icon.star',
      value: 'star.svg',
      type: TokenTypes.ASSET,
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('icon.star');
    expect(tooltip.getAttribute('data-token-type')).toBe('asset');
  });

  it('wraps default token type in TokenTooltip', () => {
    const token = {
      name: 'spacing.large',
      value: '24px',
      type: 'spacing',
    };

    render(
      <MockProvider>
        <InspectorResolvedToken token={token} />
      </MockProvider>
    );

    const tooltip = screen.getByTestId('token-tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.getAttribute('data-token-name')).toBe('spacing.large');
    expect(tooltip.getAttribute('data-token-type')).toBe('other');
  });
});