import { findBoundVariable } from '../findBoundVariable';
import { StyleToCreateToken } from '@/types/payloads';

describe('findBoundVariable', () => {
  const mockCompareValue = jest.fn().mockReturnValue(true);
  
  beforeEach(() => {
    mockCompareValue.mockClear();
  });
  
  it('returns a function that checks for bound variables', () => {
    const result = findBoundVariable(
      {} as TextStyle,
      'fontSize',
      [],
      mockCompareValue,
    );
    
    expect(typeof result).toBe('function');
  });
  
  it('checks for bound variable and returns true if found', () => {
    const mockStyle = {
      boundVariables: {
        fontSize: { id: 'var1' },
      },
    } as unknown as TextStyle;
    
    const mockLocalVariables = [
      { id: 'var1', name: 'font-size/54' } as Variable,
    ];
    
    const result = findBoundVariable(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockCompareValue,
    );
    
    const mockToken = { name: 'font-size.54' } as StyleToCreateToken;
    
    expect(result(mockToken)).toBe(true);
    expect(mockCompareValue).not.toHaveBeenCalled();
  });
  
  it('falls back to compareValue when bound variable is not found', () => {
    const mockStyle = {
      boundVariables: {
        fontSize: { id: 'var1' },
      },
    } as unknown as TextStyle;
    
    const mockLocalVariables = [
      { id: 'var2', name: 'font-size/other' } as Variable,
    ];
    
    const result = findBoundVariable(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockCompareValue,
    );
    
    const mockToken = { name: 'some-token' } as StyleToCreateToken;
    
    expect(result(mockToken)).toBe(true);
    expect(mockCompareValue).toHaveBeenCalledWith(mockToken);
  });
  
  it('handles errors gracefully and falls back to compareValue', () => {
    const mockStyle = {
      boundVariables: {
        fontSize: { id: 'var1' },
      },
    } as unknown as TextStyle;
    
    // This will cause an error when trying to access properties
    const mockLocalVariables = null as unknown as Variable[];
    
    const result = findBoundVariable(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockCompareValue,
    );
    
    const mockToken = { name: 'some-token' } as StyleToCreateToken;
    
    expect(result(mockToken)).toBe(true);
    expect(mockCompareValue).toHaveBeenCalledWith(mockToken);
  });
});