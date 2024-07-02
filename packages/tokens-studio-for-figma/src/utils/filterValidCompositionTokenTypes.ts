import { Properties } from '@/constants/Properties';

export function filterValidCompositionTokenTypes(tokenTypes: string[]): string[] {
  return tokenTypes.filter((item) => !([Properties.composition, Properties.description, Properties.value, Properties.tokenName, Properties.tokenValue].includes(item as Properties)));
}
