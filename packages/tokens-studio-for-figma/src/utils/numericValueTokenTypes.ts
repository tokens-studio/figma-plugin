import { TokenTypes } from '@/constants/TokenTypes';

export const NUMERIC_VALUE_TOKEN_TYPES: TokenTypes[] = [
  TokenTypes.NUMBER,
  TokenTypes.FONT_WEIGHTS,
];

export function isNumericValueToken(tokenType: string | undefined): boolean {
  return NUMERIC_VALUE_TOKEN_TYPES.includes(tokenType as TokenTypes);
}

const PLAIN_NUMBER_PATTERN = /^-?(?:(?:0|[1-9]\d*)(?:\.\d+)?|\.\d+)$/;

export function toNumericTokenValue(value: unknown): number | string {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && PLAIN_NUMBER_PATTERN.test(value)) {
    return Number(value);
  }
  return value as string;
}
