export function getUTF16StringSize(str: string): number {
  return str.length * 2; // UTF-16 uses 2 bytes per character
}
