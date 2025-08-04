import { SingleToken } from '@/types/tokens';

/**
 * Processes a token value and converts it to a number if it's a valid numeric string,
 * otherwise returns the trimmed string value.
 *
 * @param value - The token value to process
 * @returns A number if the value is numeric, otherwise a trimmed string
 */
export function processNumberValue(value: SingleToken['value']): number | string {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    const numericValue = Number(trimmedValue);
    // Check if the value is a valid number and not empty
    if (!isNaN(numericValue) && isFinite(numericValue) && trimmedValue !== '') {
      // Use regex to ensure it's a proper numeric format (optional minus, digits, optional decimal point, digits)
      // This prevents conversion of values like "1e5", "0x10", "Infinity", etc.
      if (/^-?\d*\.?\d+$/.test(trimmedValue)) {
        return numericValue;
      }
    }
    return trimmedValue;
  }

  return value as string;
}
