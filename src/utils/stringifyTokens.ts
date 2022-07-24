import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';

function getNthPosition(string: string, subString: string, index: number = 0): number {
  return string.split(subString, index).join(subString).length;
}

function getGroupTypeName(tokenName: string, groupLevel: number): string {
  return `${tokenName.slice(0, getNthPosition(tokenName, '.', groupLevel - 1))}.type`;
}

export default function stringifyTokens(
  tokens: Record<string, AnyTokenList>,
  activeTokenSet: string,
): string {
  const tokenObj = {};

  tokens[activeTokenSet]?.forEach((token) => {
    const tokenWithType = appendTypeToToken(token);
    const { name, ...tokenWithoutName } = tokenWithType;
    if (tokenWithoutName.inheritType && tokenWithoutName.inheritTypeLevel) {
      const {
        type, inheritType, inheritTypeLevel, ...tokenWithoutType
      } = tokenWithoutName;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.inheritType);
      set(tokenObj, token.name, tokenWithoutType);
    } else {
      set(tokenObj, token.name, tokenWithoutName);
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
