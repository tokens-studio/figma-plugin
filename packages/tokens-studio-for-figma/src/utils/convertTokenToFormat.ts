import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

export function convertTokenToFormat(token, isExpanded = false) {
  if (token.inheritTypeLevel) delete token.type;
  const { type, value, description, ...remainingTokenValues } = token;
  if (isExpanded) {
    const returnedToken = {};
    Object.entries(token).forEach(([key, val]) => {
      returnedToken[key] = convertTokenToFormat(val);
    });
    return returnedToken;
  }
  if (typeof value === 'undefined') return token;
  const returnValue = {
    ...remainingTokenValues,
    ...(value ? { [TokenFormat.tokenValueKey]: value } : {}),
    ...(type ? { [TokenFormat.tokenTypeKey]: type } : {}),
    ...(description ? { [TokenFormat.tokenDescriptionKey]: description } : {}),
  };
  delete returnValue.inheritTypeLevel;
  return returnValue;
}
