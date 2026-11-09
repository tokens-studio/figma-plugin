// Returns the token name inside a pure alias like `{color.red}`, or undefined for anything else
// (raw values, math expressions or strings that only contain a reference).
export function getReferencedTokenName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.trim().match(/^\{([^{}]+)\}$/);
  return match ? match[1] : undefined;
}
