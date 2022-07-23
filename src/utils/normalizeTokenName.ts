// @deprecated remove
export function normalizeTokenName(name: string) {
  const splitKey = name.split('.').map((part) => part.trim());
  if (splitKey[splitKey.length - 1] === 'value') {
    splitKey.pop();
  }
  const trimmedKey = splitKey.join('/');
  return trimmedKey;
}
