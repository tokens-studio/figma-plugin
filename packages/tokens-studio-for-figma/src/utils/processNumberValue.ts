import { SingleToken } from '@/types/tokens';
import { toNumericTokenValue } from './numericValueTokenTypes';

/**
 * Processes a token value and converts it to a number if it's a plain numeric string,
 * otherwise returns the trimmed string value.
 *
 * @param value - The token value to process
 * @returns A number if the value is numeric, otherwise a trimmed string
 */
export function processNumberValue(value: SingleToken['value']): number | string {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue === '') return trimmedValue;
    return toNumericTokenValue(trimmedValue);
  }
  return toNumericTokenValue(value);
}
