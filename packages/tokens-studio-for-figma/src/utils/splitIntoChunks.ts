/**
 * Splits a string into chunks of specified maximum byte size
 * @param str String to split
 * @param maxBytes Maximum bytes per chunk
 * @returns Array of string chunks
 */
export function splitIntoChunks(str: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  let currentLength = 0;
  const maxChars = Math.floor(maxBytes / 2); // Convert bytes to character count for UTF-16

  // Process the string character by character
  for (let i = 0; i < str.length; i += 1) {
    const char = str[i];

    // If adding this character would exceed the limit, start a new chunk
    if (currentLength + 1 > maxChars) {
      chunks.push(currentChunk);
      currentChunk = char;
      currentLength = 1;
    } else {
      currentChunk += char;
      currentLength += 1;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
