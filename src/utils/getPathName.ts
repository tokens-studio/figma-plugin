export function getPathName(ref: string) {
  if (ref.startsWith('{')) {
    return ref.slice(1, ref.length - 1);
  }
  return ref.substring(1);
}
