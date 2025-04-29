export enum FigmaStorageType {
  CLIENT_STORAGE = 'client_storage',
  SHARED_PLUGIN_DATA = 'shared_plugin_data',
}

// Maximum size for a single chunk in bytes (95KB to stay safely under Figma's 100KB limit)
const MAX_CHUNK_SIZE = 95 * 1024; // 95KB

// Metadata suffix for storing information about chunked data
const METADATA_SUFFIX = '_meta';

// Chunk suffix prefix for chunk keys
const CHUNK_SUFFIX_PREFIX = '_chunk_';

/**
 * Gets the byte length of a string
 * @param str String to measure
 * @returns Length in bytes
 */
function getByteLength(str: string): number {
  try {
    // Try to use TextEncoder if available
    return new TextEncoder().encode(str).length;
  } catch (e) {
    // Fallback method for environments where TextEncoder is not available
    // This is an approximation that works for ASCII and common Unicode characters
    let length = 0;
    for (let i = 0; i < str.length; i += 1) {
      const code = str.charCodeAt(i);
      // Count bytes based on character code ranges
      if (code <= 0x7F) {
        length += 1; // ASCII character (1 byte)
      } else if (code <= 0x7FF) {
        length += 2; // 2-byte character
      } else if (code >= 0xD800 && code <= 0xDFFF) {
        // Surrogate pair (4 bytes for the pair)
        length += 2; // Add 2 here, and 2 more for the next character
        i += 1; // Skip the next character as it's part of the surrogate pair
      } else {
        length += 3; // 3-byte character
      }
    }
    return length;
  }
}

/**
 * Splits a string into chunks of specified maximum byte size
 * @param str String to split
 * @param maxBytes Maximum bytes per chunk
 * @returns Array of string chunks
 */
function splitIntoChunks(str: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  let currentByteLength = 0;

  // Process the string character by character
  for (let i = 0; i < str.length; i += 1) {
    const char = str[i];
    const charByteLength = getByteLength(char);

    // If adding this character would exceed the limit, start a new chunk
    if (currentByteLength + charByteLength > maxBytes) {
      chunks.push(currentChunk);
      currentChunk = char;
      currentByteLength = charByteLength;
    } else {
      currentChunk += char;
      currentByteLength += charByteLength;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Metadata structure for chunked data
 */
type ChunkedDataMetadata = {
  type: 'single' | 'chunked';
  count?: number;
};

export class FigmaStorageProperty<V = string> {
  protected storageType: FigmaStorageType = FigmaStorageType.CLIENT_STORAGE;

  protected key: string;

  protected stringify: (value: V) => string = (value) => String(value);

  protected parse: (value: string) => V | null = (value) => value as unknown as V;

  constructor(
    storageType: FigmaStorageType,
    key: string,
    stringify?: (value: V) => string,
    parse?: (value: string) => V | null,
  ) {
    this.storageType = storageType;
    this.key = key;
    if (stringify) this.stringify = stringify;
    if (parse) this.parse = parse;
  }

  /**
   * Reads data from storage, automatically handling chunked data if present
   * @param node The node to read from (defaults to figma.root)
   * @returns The parsed value or null if no data is found
   */
  public async read(node: BaseNode = figma.root): Promise<V | null> {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      const value = await figma.clientStorage.getAsync(this.key);
      return value ? this.parse(value) : null;
    }

    if (this.storageType === FigmaStorageType.SHARED_PLUGIN_DATA) {
      const [namespace, ...keyParts] = this.key.split('/');
      const key = keyParts.join('/');

      // Try reading the data directly first (most common case)
      const directValue = node?.getSharedPluginData(namespace, key);
      if (directValue) {
        return this.parse(directValue);
      }

      // Only check for chunked data if direct read fails
      const metaKey = `${key}${METADATA_SUFFIX}`;
      const metaValue = node?.getSharedPluginData(namespace, metaKey);
      if (!metaValue) return null;

      let metadata: ChunkedDataMetadata;
      try {
        metadata = JSON.parse(metaValue);
      } catch {
        return null;
      }

      // Single chunk case
      if (metadata.type === 'single') {
        const value = node?.getSharedPluginData(namespace, key);
        return value ? this.parse(value) : null;
      }

      // Chunked case
      if (metadata.type === 'chunked' && metadata.count) {
        // Pre-allocate array for better performance
        const chunks = new Array<string>(metadata.count);

        // Read all chunks in parallel
        const chunkPromises = Array.from({ length: metadata.count }, async (_, i) => {
          const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
          const chunk = node?.getSharedPluginData(namespace, chunkKey);
          if (!chunk) {
            throw new Error(`Missing chunk ${i}`);
          }
          chunks[i] = chunk;
        });

        try {
          await Promise.all(chunkPromises);
          return this.parse(chunks.join(''));
        } catch (err) {
          console.error(`Error reading chunks for key ${key}:`, err);
          return null;
        }
      }
    }

    return null;
  }

  /**
   * Writes data to storage, automatically chunking if needed
   * @param value The value to write
   * @param node The node to write to (defaults to figma.root)
   */
  public async write(value: V | null, node: BaseNode = figma.root) {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      await figma.clientStorage.setAsync(this.key, value ? this.stringify(value) : null);
      return;
    }

    if (this.storageType === FigmaStorageType.SHARED_PLUGIN_DATA) {
      const keyParts = this.key.split('/');
      const namespace = keyParts[0];
      const key = keyParts.slice(1).join('/');

      if (!value) {
        // If value is null, clear the data
        node?.setSharedPluginData(namespace, key, '');

        // Also clear metadata and any chunks
        const metaKey = `${key}${METADATA_SUFFIX}`;
        node?.setSharedPluginData(namespace, metaKey, '');

        // Try to read metadata to see if there were chunks
        try {
          const metaValue = node?.getSharedPluginData(namespace, metaKey);
          if (metaValue) {
            const metadata = JSON.parse(metaValue) as ChunkedDataMetadata;
            if (metadata.type === 'chunked' && metadata.count) {
              // Clear all chunks
              for (let i = 0; i < metadata.count; i += 1) {
                const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
                node?.setSharedPluginData(namespace, chunkKey, '');
              }
            }
          }
        } catch (err) {
          // Ignore errors when clearing
        }

        return;
      }

      // Stringify the value
      const stringValue = this.stringify(value);

      // Get the byte length
      const byteLength = getByteLength(stringValue);

      // If the value is small enough, store it directly
      if (byteLength <= MAX_CHUNK_SIZE) {
        // Set metadata to indicate single storage
        const metaKey = `${key}${METADATA_SUFFIX}`;
        node?.setSharedPluginData(namespace, metaKey, JSON.stringify({ type: 'single' }));

        // Store the data
        node?.setSharedPluginData(namespace, key, stringValue);

        // Try to clean up any old chunks
        try {
          const metaValue = node?.getSharedPluginData(namespace, metaKey);
          if (metaValue) {
            const metadata = JSON.parse(metaValue) as ChunkedDataMetadata;
            if (metadata.type === 'chunked' && metadata.count) {
              // Clear all old chunks
              for (let i = 0; i < metadata.count; i += 1) {
                const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
                node?.setSharedPluginData(namespace, chunkKey, '');
              }
            }
          }
        } catch (err) {
          // Ignore errors when clearing
        }
      } else {
        // Split the data into chunks
        const chunks = splitIntoChunks(stringValue, MAX_CHUNK_SIZE);
        const numChunks = chunks.length;

        // Set metadata to indicate chunked storage
        const metaKey = `${key}${METADATA_SUFFIX}`;
        node?.setSharedPluginData(namespace, metaKey, JSON.stringify({
          type: 'chunked',
          count: numChunks,
        }));

        // Store each chunk
        for (let i = 0; i < numChunks; i += 1) {
          const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
          node?.setSharedPluginData(namespace, chunkKey, chunks[i]);
        }

        // Clear the main key to avoid confusion
        node?.setSharedPluginData(namespace, key, '');

        // Clean up any obsolete chunks
        try {
          const metaValue = node?.getSharedPluginData(namespace, metaKey);
          if (metaValue) {
            const metadata = JSON.parse(metaValue) as ChunkedDataMetadata;
            if (metadata.type === 'chunked' && metadata.count && metadata.count > numChunks) {
              // Clear obsolete chunks
              for (let i = numChunks; i < metadata.count; i += 1) {
                const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
                node?.setSharedPluginData(namespace, chunkKey, '');
              }
            }
          }
        } catch (err) {
          // Ignore errors when clearing
        }
      }
    }
  }
}
