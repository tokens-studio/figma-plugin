import set from 'set-value';
import omit from 'just-omit';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, SingleToken } from '@/types/tokens';

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
  ignoreTokenIdInJsonEditor: boolean,
): string {
  const tokenObj = {};
  tokens[activeTokenSet]?.forEach((token) => {
    let tokenWithType = appendTypeToToken(token);
    if (ignoreTokenIdInJsonEditor && tokenWithType.$extensions) {
      tokenWithType = {
        ...tokenWithType,
        $extensions: {
          ...omit(tokenWithType?.$extensions, 'id'),
        },
      };
      if (Object.keys(tokenWithType.$extensions ?? {}).length < 1) {
        tokenWithType = omit(tokenWithType, '$extensions') as SingleToken;
      }
    }
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
