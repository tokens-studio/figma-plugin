import { getUTF16StringSize } from '@/utils/getUTF16StringSize';

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
 * Splits a string into chunks of specified maximum byte size
 * @param str String to split
 * @param maxBytes Maximum bytes per chunk
 * @returns Array of string chunks
 */
function splitIntoChunks(str: string, maxBytes: number): string[] {
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

  protected stringify: (value: V, isCompressed?: boolean) => string = (value) => String(value);

  protected parse: (value: string, isCompressed?: boolean) => V | null = (value) => value as unknown as V;

  constructor(
    storageType: FigmaStorageType,
    key: string,
    stringify?: (value: V, isCompressed?: boolean) => string,
    parse?: (value: string, isCompressed?: boolean) => V | null,
  ) {
    this.storageType = storageType;
    this.key = key;
    if (stringify) this.stringify = stringify;
    if (parse) this.parse = parse;
  }

  /**
   * Reads data from storage, automatically handling chunked data if present
   * @param node The node to read from (defaults to figma.root)
   * @param isCompressed Whether the data is compressed
   * @returns The parsed value or null if no data is found
   */
  public async read(node: BaseNode = figma.root, isCompressed = false): Promise<V | null> {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      const value = await figma.clientStorage.getAsync(this.key);
      return value ? this.parse(value, isCompressed) : null;
    } if (this.storageType === FigmaStorageType.SHARED_PLUGIN_DATA) {
      const keyParts = this.key.split('/');
      const namespace = keyParts[0];
      const key = keyParts.slice(1).join('/');

      // First, check if there's metadata for chunked data
      const metaKey = `${key}${METADATA_SUFFIX}`;
      const metaValue = node?.getSharedPluginData(namespace, metaKey);

      if (metaValue) {
        try {
          // Parse the metadata
          const metadata = JSON.parse(metaValue) as ChunkedDataMetadata;

          if (metadata.type === 'single') {
            // If it's a single chunk, just read the data
            const value = node?.getSharedPluginData(namespace, key);
            return value ? this.parse(value, isCompressed) : null;
          }

          if (metadata.type === 'chunked' && metadata.count) {
            // Create an array of promises to read all chunks
            const chunkPromises = Array.from({ length: metadata.count }, (_, i) => {
              const chunkKey = `${key}${CHUNK_SUFFIX_PREFIX}${i}`;
              return node?.getSharedPluginData(namespace, chunkKey);
            });

            // Wait for all chunks to be read
            const chunks = await Promise.all(chunkPromises);

            // Check if any chunks are missing
            if (chunks.some((chunk) => !chunk)) {
              console.error('One or more chunks are missing');
              return null;
            }

            // Join chunks and parse
            const value = chunks.join('');
            return value ? this.parse(value, isCompressed) : null;
          }

          console.error('Unknown metadata type or missing count:', metadata);
          return null;
        } catch (err) {
          console.error('Error parsing metadata:', err);
          return null;
        }
      }

      // If no metadata is found, try reading the data directly (for backward compatibility)
      const value = node?.getSharedPluginData(namespace, key);
      return value ? this.parse(value, isCompressed) : null;
    }

    return null;
  }

  /**
   * Writes data to storage, automatically chunking if needed
   * @param value The value to write
   * @param node The node to write to (defaults to figma.root)
   * @param isCompressed Whether the data is compressed
   */
  public async write(value: V | null, node: BaseNode = figma.root, isCompressed = false) {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      await figma.clientStorage.setAsync(this.key, value ? this.stringify(value, isCompressed) : null);
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
      const stringValue = this.stringify(value, isCompressed);

      // Get the byte length
      const byteLength = getUTF16StringSize(stringValue);

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
