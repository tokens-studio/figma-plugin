import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';

export function getGroupTypeName(tokenName: string, groupLevel: number): string {
  if (tokenName.includes('.')) {
    const lastDotPosition = tokenName.split('.', groupLevel - 1).join('.').length;
    return `${tokenName.slice(0, lastDotPosition)}.type`;
  }
  return 'type';
}

export default function stringifyTokens(
  tokens: Record<string, AnyTokenList>,
  activeTokenSet: string,
): string {
  const tokenObj = {};
  tokens[activeTokenSet]?.forEach((token) => {
    const tokenWithType = appendTypeToToken(token);
    const { name, ...tokenWithoutName } = tokenWithType;
    if (tokenWithoutName.inheritTypeLevel) {
      const {
        type, inheritTypeLevel, ...tokenWithoutType
      } = tokenWithoutName;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.type);
      set(tokenObj, token.name, tokenWithoutType);
    } else {
      set(tokenObj, token.name, tokenWithoutName);
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
