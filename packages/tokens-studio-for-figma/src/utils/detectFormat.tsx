import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { Tokens } from './convertTokens';

export function detectFormat(tokens: Tokens, shouldSet: boolean) {
  const stringifiedTokens = JSON.stringify(tokens);
  if (stringifiedTokens.includes('$value')) {
    if (shouldSet) TokenFormat.setFormat(TokenFormatOptions.DTCG);
    return TokenFormatOptions.DTCG;
  }
  if (shouldSet) TokenFormat.setFormat(TokenFormatOptions.Legacy);
  return TokenFormatOptions.Legacy;
}
