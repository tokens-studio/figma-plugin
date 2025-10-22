import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useResolvedBaseFontSize } from './useResolvedBaseFontSize';
import { TokensContext } from '@/context';
import { store } from '../store';

// Mock the selector
jest.mock('@/selectors', () => ({
  aliasBaseFontSizeSelector: jest.fn(),
}));

// Mock the alias utility
jest.mock('@/utils/alias', () => ({
  getAliasValue: jest.fn(),
}));

const { aliasBaseFontSizeSelector } = require('@/selectors');
const { getAliasValue } = require('@/utils/alias');

describe('useResolvedBaseFontSize', () => {
  const mockTokensContext = {
    resolvedTokens: [
      { name: 'fontSize.base', value: '16px', type: 'fontSizes' },
      { name: 'fontSize.large', value: '24px', type: 'fontSizes' },
    ],
  };

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <TokensContext.Provider value={mockTokensContext}>
        {children}
      </TokensContext.Provider>
    </Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns default font size when no alias base font size is set', () => {
    aliasBaseFontSizeSelector.mockReturnValue(null);

    const { result } = renderHook(() => useResolvedBaseFontSize(), { wrapper });

    expect(result.current).toBe('16px');
  });

  it('returns resolved font size when alias base font size is set and resolves successfully', () => {
    aliasBaseFontSizeSelector.mockReturnValue('{fontSize.large}');
    getAliasValue.mockReturnValue('24px');

    const { result } = renderHook(() => useResolvedBaseFontSize(), { wrapper });

    expect(result.current).toBe('24px');
    expect(getAliasValue).toHaveBeenCalledWith('{fontSize.large}', mockTokensContext.resolvedTokens);
  });

  it('returns default font size when alias base font size fails to resolve', () => {
    aliasBaseFontSizeSelector.mockReturnValue('{fontSize.nonexistent}');
    getAliasValue.mockReturnValue(null);

    const { result } = renderHook(() => useResolvedBaseFontSize(), { wrapper });

    expect(result.current).toBe('16px');
    expect(getAliasValue).toHaveBeenCalledWith('{fontSize.nonexistent}', mockTokensContext.resolvedTokens);
  });

  it('converts numeric resolved value to string', () => {
    aliasBaseFontSizeSelector.mockReturnValue('{fontSize.base}');
    getAliasValue.mockReturnValue(16);

    const { result } = renderHook(() => useResolvedBaseFontSize(), { wrapper });

    expect(result.current).toBe('16');
  });
});
