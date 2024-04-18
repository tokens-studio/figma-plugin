import { convertFontFamilyToFigma } from './convertFontFamilyToFigma';

describe('convertFontFamilyToFigma', () => {
  it('should return the same value when shouldOutputForVariables is false', () => {
    const value = 'Arial, sans-serif';
    const result = convertFontFamilyToFigma(value, false);
    expect(result).toBe(value);
  });

  it('should return the first font family when shouldOutputForVariables is true', () => {
    const value = 'Arial, sans-serif';
    const result = convertFontFamilyToFigma(value, true);
    expect(result).toBe('Arial');
  });

  it('should return the same value when there is no comma and shouldOutputForVariables is true', () => {
    const value = 'Arial';
    const result = convertFontFamilyToFigma(value, true);
    expect(result).toBe(value);
  });

  it('trims space at end', () => {
    const value = 'Arial ,sans-serif';
    const result = convertFontFamilyToFigma(value, true);
    expect(result).toBe('Arial');
  });

  it('trims space in beginning', () => {
    const value = 'Arial, sans-serif';
    const result = convertFontFamilyToFigma(value, true);
    expect(result).toBe('Arial');
  });

  it('should return the first font family when there are multiple font families', () => {
    const value = "'Arial', sans-serif, 'George'";
    const result = convertFontFamilyToFigma(value, true);
    expect(result).toBe('Arial');
  });
});
