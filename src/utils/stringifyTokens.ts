import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';

export default function stringifyTokens(
  tokens: Record<string, AnyTokenList>,
  activeTokenSet: string,
): string {
  const tokenObj = {};
  console.log('tokensactive', tokens[activeTokenSet]);
  tokens[activeTokenSet]?.forEach((token) => {
    const tokenWithType = appendTypeToToken(token);
    const { name, ...tokenWithoutName } = tokenWithType;
    console.log('name', name, 'token.name', token.name, tokenWithoutName);
    if ('inheritType' in tokenWithoutName) {
      const { type, inheritType, ...tokenWithoutType } = tokenWithoutName;
      set(tokenObj, `${token.name.slice(0, token.name.indexOf('.'))}.type`, tokenWithoutName.inheritType);
      set(tokenObj, token.name, tokenWithoutType);
    } else {
      set(tokenObj, token.name, tokenWithoutName);
    }
  });

  console.log('tokenObj', tokenObj);
  return JSON.stringify(tokenObj, null, 2);
}
