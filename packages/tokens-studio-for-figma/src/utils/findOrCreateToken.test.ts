import { findOrCreateToken } from './findOrCreateToken';
import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';

// Mock normalizeVariableName
jest.mock('./normalizeVariableName', () => ({
  normalizeVariableName: (name: string) => name.replace(/\//g, '.'),
}));

describe('findOrCreateToken', () => {
  const mockStyle = {
    boundVariables: {
      fontFamily: { id: 'var-123' },
      fontSize: { id: 'var-456' },
    },
  } as any;

  const mockVariables = [
    { id: 'var-123', name: 'brand/primary' },
    { id: 'var-456', name: 'size/large' },
  ] as any[];

  const mockTokenArray: StyleToCreateToken[] = [];

  beforeEach(() => {
    mockTokenArray.length = 0;
  });

  it('should return existing token when bound variable matches existing token', () => {
    // Setup: Add existing token with variable name
    const existingToken = {
      name: 'brand.primary',
      value: 'Inter',
      type: TokenTypes.FONT_FAMILIES,
    };
    mockTokenArray.push(existingToken);

    const result = findOrCreateToken(
      mockStyle,
      'fontFamily',
      'Inter',
      mockTokenArray,
      TokenTypes.FONT_FAMILIES,
      mockVariables,
    );

    expect(result).toBe(existingToken);
    expect(mockTokenArray).toHaveLength(1); // No new token added
  });

  it('should create new token with variable name when bound variable exists but no matching token', () => {
    const result = findOrCreateToken(
      mockStyle,
      'fontFamily',
      'Inter',
      mockTokenArray,
      TokenTypes.FONT_FAMILIES,
      mockVariables,
    );

    expect(result).toEqual({
      name: 'brand.primary',
      value: 'Inter',
      type: TokenTypes.FONT_FAMILIES,
    });
    expect(mockTokenArray).toHaveLength(1);
  });

  it('should create new token with default naming when no bound variable', () => {
    const styleWithoutBoundVar = { boundVariables: {} } as any;

    const result = findOrCreateToken(
      styleWithoutBoundVar,
      'fontSize',
      '24',
      mockTokenArray,
      TokenTypes.FONT_SIZES,
      mockVariables,
    );

    expect(result).toEqual({
      name: 'fontsizes.0',
      value: '24',
      type: TokenTypes.FONT_SIZES,
    });
    expect(mockTokenArray).toHaveLength(1);
  });

  it('should return existing token by value when no bound variable', () => {
    // Setup: Add existing token with same value
    const existingToken = {
      name: 'fontsizes.0',
      value: '24',
      type: TokenTypes.FONT_SIZES,
    };
    mockTokenArray.push(existingToken);

    const styleWithoutBoundVar = { boundVariables: {} } as any;

    const result = findOrCreateToken(
      styleWithoutBoundVar,
      'fontSize',
      '24',
      mockTokenArray,
      TokenTypes.FONT_SIZES,
      mockVariables,
    );

    expect(result).toBe(existingToken);
    expect(mockTokenArray).toHaveLength(1); // No new token added
  });

  it('should handle bound variable that references non-existent variable', () => {
    const styleWithInvalidVar = {
      boundVariables: {
        fontFamily: { id: 'var-nonexistent' },
      },
    } as any;

    const result = findOrCreateToken(
      styleWithInvalidVar,
      'fontFamily',
      'Inter',
      mockTokenArray,
      TokenTypes.FONT_FAMILIES,
      mockVariables,
    );

    expect(result).toEqual({
      name: 'fontfamilies.0',
      value: 'Inter',
      type: TokenTypes.FONT_FAMILIES,
    });
    expect(mockTokenArray).toHaveLength(1);
  });
});
