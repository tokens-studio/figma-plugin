export function tryParseJson<V = any>(value: string): V | null {
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error(err);
  }
  return null;
}
