export function normalizeVariableName(name: string) {
  const splitKey = name.split('/').map((part) => part.trim());
  const normalizedVariableName = splitKey.join('.');
  return normalizedVariableName;
}
