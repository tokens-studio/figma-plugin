export function parseIntOrDefault(input: string | null | undefined, def: number) {
  if (input) {
    return parseInt(input, 10);
  }
  return def;
}
