export function convertTokenNameToPath(name: string, skip = 0) {
  const splitKey = name.split('.').slice(skip).map((part) => part.trim());
  if (splitKey[splitKey.length - 1] === 'value') {
    splitKey.pop();
  }
  const trimmedKey = splitKey.join('/');
  return trimmedKey;
}
