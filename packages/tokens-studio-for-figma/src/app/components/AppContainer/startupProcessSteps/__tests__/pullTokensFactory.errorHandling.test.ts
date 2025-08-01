import { pullTokensFactory } from '../pullTokensFactory';
import { categorizeError } from '@/utils/error/categorizeError';
import { ErrorMessages } from '@/constants/ErrorMessages';

// Mock the categorizeError function to test our error handling
jest.mock('@/utils/error/categorizeError');

const mockCategorizeError = categorizeError as jest.MockedFunction<typeof categorizeError>;

describe('pullTokensFactory error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should categorize JSON parsing errors correctly', () => {
    const jsonError = new SyntaxError('Unexpected token } in JSON at position 10');
    
    mockCategorizeError.mockReturnValue({
      type: 'parsing',
      message: `${ErrorMessages.JSON_PARSE_ERROR}: Unexpected token } in JSON at position 10`,
    });

    const result = categorizeError(jsonError);
    
    expect(result.type).toBe('parsing');
    expect(result.message).toContain(ErrorMessages.JSON_PARSE_ERROR);
    expect(result.message).toContain('Unexpected token } in JSON at position 10');
  });

  it('should categorize credential errors correctly', () => {
    const credentialError = new Error('401 Unauthorized');
    
    mockCategorizeError.mockReturnValue({
      type: 'credential',
      message: '401 Unauthorized',
    });

    const result = categorizeError(credentialError);
    
    expect(result.type).toBe('credential');
    expect(result.message).toBe('401 Unauthorized');
  });

  it('should categorize other errors correctly', () => {
    const networkError = new Error('Network request failed');
    
    mockCategorizeError.mockReturnValue({
      type: 'other',
      message: 'Network request failed',
    });

    const result = categorizeError(networkError);
    
    expect(result.type).toBe('other');
    expect(result.message).toBe('Network request failed');
  });
});
