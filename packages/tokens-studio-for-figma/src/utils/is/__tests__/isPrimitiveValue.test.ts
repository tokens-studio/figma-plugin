import { isPrimitiveValue } from '../isPrimitiveValue';

describe('isPrimitiveValue', () => {
  it('should return true', () => {
    expect(isPrimitiveValue('')).toBe(true);
  });

  it('should return false', () => {
    expect(isPrimitiveValue({})).toBe(false);
  });
});
