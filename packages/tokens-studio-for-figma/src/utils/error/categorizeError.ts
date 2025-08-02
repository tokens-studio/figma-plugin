import { ErrorMessages } from '@/constants/ErrorMessages';

/**
 * Categorizes an error to determine if it's a JSON parsing error, credential error, connectivity error, or other
 * @param error - The error object or string
 * @returns Object with error type and appropriate error message
 */
export function categorizeError(error: any): {
  type: 'credential' | 'parsing' | 'connectivity' | 'other';
  message: string;
} {
  const errorString = String(error);
  const errorMessage = error?.message || errorString;

  // Check if it's a JSON parsing error
  if (
    errorMessage.includes('JSON')
    || errorMessage.includes('parse')
    || errorMessage.includes('Unexpected token')
    || errorMessage.includes('Unexpected end of JSON input')
    || errorMessage.includes('Invalid JSON')
    || errorString.includes('SyntaxError')
  ) {
    return {
      type: 'parsing',
      message: `${ErrorMessages.JSON_PARSE_ERROR}: ${errorMessage}`,
    };
  }

  if (
    errorMessage.includes('Network')
    || errorMessage.includes('network')
    || errorMessage.includes('ENOTFOUND')
    || errorMessage.includes('ECONNREFUSED')
    || errorMessage.includes('ETIMEDOUT')
    || errorMessage.includes('timeout')
    || errorMessage.includes('Connection')
    || errorMessage.includes('connection')
    || errorMessage.includes('unreachable')
    || errorMessage.includes('offline')
    || errorMessage.includes('Failed to fetch')
    || errorMessage.includes('fetch failed')
    || errorMessage.includes('ERR_NETWORK')
    || errorMessage.includes('ERR_INTERNET_DISCONNECTED')
    || errorMessage.includes('500')
    || errorMessage.includes('502')
    || errorMessage.includes('503')
    || errorMessage.includes('504')
    || errorMessage.includes('Internal Server Error')
    || errorMessage.includes('Bad Gateway')
    || errorMessage.includes('Service Unavailable')
    || errorMessage.includes('Gateway Timeout')
  ) {
    return {
      type: 'connectivity',
      message: errorMessage,
    };
  }

  // Check if it's a credential-related error
  if (
    errorMessage.includes('401')
    || errorMessage.includes('403')
    || errorMessage.includes('Unauthorized')
    || errorMessage.includes('Forbidden')
    || errorMessage.includes('credential')
    || errorMessage.includes('authentication')
    || errorMessage.includes('Authentication')
    || errorMessage.includes('permission')
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
