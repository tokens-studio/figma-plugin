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
      expect(result.header).toBe('JSON Parsing Error');
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

  describe('connectivity errors', () => {
    it('should categorize network errors', () => {
      const error = new Error('Network request failed');
      const result = categorizeError(error);

      expect(result.type).toBe('connectivity');
      expect(result.message).toBe('Network request failed');
    });

    it('should categorize connection timeout errors', () => {
      const error = new Error('Connection timeout');
      const result = categorizeError(error);

      expect(result.type).toBe('connectivity');
      expect(result.message).toBe('Connection timeout');
    });

    it('should categorize fetch failed errors', () => {
      const error = new Error('Failed to fetch');
      const result = categorizeError(error);

      expect(result.type).toBe('connectivity');
      expect(result.message).toBe('Failed to fetch');
    });

    it('should categorize 500 server errors', () => {
      const error = new Error('500 Internal Server Error');
      const result = categorizeError(error);

      expect(result.type).toBe('connectivity');
      expect(result.message).toBe('500 Internal Server Error');
    });

    it('should categorize 503 service unavailable errors', () => {
      const error = new Error('503 Service Unavailable');
      const result = categorizeError(error);

      expect(result.type).toBe('connectivity');
      expect(result.message).toBe('503 Service Unavailable');
    });
  });

  describe('other errors', () => {
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
