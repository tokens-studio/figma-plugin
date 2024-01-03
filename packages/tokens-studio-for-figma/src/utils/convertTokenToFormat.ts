import { TokenFormat } from '@/plugin/store';

export function convertTokenToFormat(token, isExpanded = false) {
  const {
    type, value, description, ...remainingTokenValues
  } = token;
  if (isExpanded) {
    const returnedToken = {};
    Object.entries(token).forEach(([key, val]) => {
      returnedToken[key] = convertTokenToFormat(val);
    });
    return returnedToken;
  }
  if ((typeof value === 'undefined')) return token;
  return {
    ...remainingTokenValues,
    ...(value ? { [TokenFormat.tokenValueKey]: value } : {}),
    ...(type ? { [TokenFormat.tokenTypeKey]: type } : {}),
    ...(description ? { [TokenFormat.tokenDescriptionKey]: description } : {}),
  };
}
