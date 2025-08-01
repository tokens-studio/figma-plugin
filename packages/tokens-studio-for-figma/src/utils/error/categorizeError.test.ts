import { categorizeError } from './categorizeError';
import { ErrorMessages } from '@/constants/ErrorMessages';

describe('categorizeError', () => {
  describe('JSON parsing errors', () => {
    it('should categorize JSON syntax errors', () => {
      const error = new SyntaxError('Unexpected token } in JSON at position 10');
      const result = categorizeError(error);

      expect(result.type).toBe('parsing');
      expect(result.message).toContain(ErrorMessages.JSON_PARSE_ERROR);
      expect(result.message).toContain('Unexpected token } in JSON at position 10');
    });

    it('should categorize unexpected end of JSON input', () => {
      const error = new Error('Unexpected end of JSON input');
      const result = categorizeError(error);

      expect(result.type).toBe('parsing');
      expect(result.message).toContain(ErrorMessages.JSON_PARSE_ERROR);
    });

    it('should categorize JSON parse errors', () => {
      const error = new Error('Failed to parse JSON');
      const result = categorizeError(error);

      expect(result.type).toBe('parsing');
      expect(result.message).toContain(ErrorMessages.JSON_PARSE_ERROR);
    });
  });

  describe('credential errors', () => {
    it('should categorize 401 errors', () => {
      const error = new Error('401 Unauthorized');
      const result = categorizeError(error);

      expect(result.type).toBe('credential');
      expect(result.message).toBe('401 Unauthorized');
    });

    it('should categorize 403 errors', () => {
      const error = new Error('403 Forbidden');
      const result = categorizeError(error);

      expect(result.type).toBe('credential');
      expect(result.message).toBe('403 Forbidden');
    });

    it('should categorize authentication errors', () => {
      const error = new Error('Authentication failed');
      const result = categorizeError(error);

      expect(result.type).toBe('credential');
      expect(result.message).toBe('Authentication failed');
    });
  });

  describe('other errors', () => {
    it('should categorize network errors as other', () => {
      const error = new Error('Network request failed');
      const result = categorizeError(error);

      expect(result.type).toBe('other');
      expect(result.message).toBe('Network request failed');
    });

    it('should handle string errors', () => {
      const error = 'Something went wrong';
      const result = categorizeError(error);

      expect(result.type).toBe('other');
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle errors without message property', () => {
      const error = { toString: () => 'Custom error' };
      const result = categorizeError(error);

      expect(result.type).toBe('other');
      expect(result.message).toBe('Custom error');
    });
  });
});
