import { ErrorMessages } from '@/constants/ErrorMessages';

/**
 * Categorizes an error to determine if it's a JSON parsing error or a credential error
 * @param error - The error object or string
 * @returns Object with error type and appropriate error message
 */
export function categorizeError(error: any): {
  type: 'credential' | 'parsing' | 'other';
  message: string;
} {
  const errorString = String(error);
  const errorMessage = error?.message || errorString;

  // Check if it's a JSON parsing error
  if (
    errorMessage.includes('JSON') ||
    errorMessage.includes('parse') ||
    errorMessage.includes('Unexpected token') ||
    errorMessage.includes('Unexpected end of JSON input') ||
    errorMessage.includes('Invalid JSON') ||
    errorString.includes('SyntaxError')
  ) {
    return {
      type: 'parsing',
      message: `${ErrorMessages.JSON_PARSE_ERROR}: ${errorMessage}`,
    };
  }

  // Check if it's a credential-related error
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('403') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('credential') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('Authentication') ||
    errorMessage.includes('permission')
  ) {
    return {
      type: 'credential',
      message: errorMessage,
    };
  }

  // For other errors, return the original message
  return {
    type: 'other',
    message: errorMessage,
  };
}
