import { TokenTypes } from '@/constants/TokenTypes';

export function isTokenType(input: string | TokenTypes): input is TokenTypes {
  return Object.values<string>(TokenTypes).includes(input);
}
