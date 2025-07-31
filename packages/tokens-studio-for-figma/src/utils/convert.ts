import set from 'set-value';
import { SingleToken } from '@/types/tokens';

export interface DTCGToken {
  $name: string;
  $type: NonNullable<SingleToken['type']>;
  $description: string | undefined;
  $value: NonNullable<SingleToken['value']>;
  $extensions: Record<string, unknown> | undefined;
}

export const singleTokenToDTCGToken = (token: SingleToken): DTCGToken => ({
  $name: token.name,
  $description: token.description,
  // again, assuming these are present, without changing the function signature
  $value: token.value as NonNullable<SingleToken['value']>,
  $type: token.type as NonNullable<SingleToken['type']>,
  $extensions: token.$extensions,
});

/**
 *
 * @param tokens
 * @param convertToDTCG Set to true to convert to DTCG format
 * @returns
 */
export const singleTokensToRawTokenSet = (tokens: SingleToken[], convertToDTCG: boolean = false) => tokens.reduce((acc, token) => {
  set(acc, token.name?.split('.') || '', convertToDTCG ? singleTokenToDTCGToken(token) : token);
  return acc;
}, {});
