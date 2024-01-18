export function convertTokenNameToPath(name: string, prefix: string | null = null, skip = 0) {
  const splitKey = name.split('.').slice(skip).map((part) => part.trim());
  if (splitKey[splitKey.length - 1] === 'value') {
    splitKey.pop();
  }
  const trimmedKey = splitKey.join('/');

  if (prefix) {
    return `${prefix}/${trimmedKey}`;
  }

  return trimmedKey;
}
