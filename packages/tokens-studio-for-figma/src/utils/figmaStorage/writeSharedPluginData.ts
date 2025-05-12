import { getUTF16StringSize } from '@/utils/getUTF16StringSize';
import { splitIntoChunks } from '@/utils/splitIntoChunks';

// Maximum size for a single chunk in bytes (95KB to stay safely under Figma's 100KB limit)
const MAX_CHUNK_SIZE = 95 * 1024; // 95KB

// Metadata suffix for storing information about chunked data
const METADATA_SUFFIX = '_meta';

// Chunk suffix prefix for chunk keys
const CHUNK_SUFFIX_PREFIX = '_chunk_';

/**
 * Metadata structure for chunked data
 */
type ChunkedDataMetadata = {
  type: 'single' | 'chunked';
  count?: number;
};

/**
 * Writes data to Figma's shared plugin data, automatically chunking if needed
 * @param namespace The namespace to write to
 * @param key The key to write to
 * @param value The value to write
 * @param node The node to write to (defaults to figma.root)
 * @returns Promise that resolves when the write is complete
 */
export async function writeSharedPluginData(
  namespace: string,
  key: string,
  value: string | null,
  node: BaseNode = figma.root,
): Promise<void> {
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

  if (!['values', 'themes'].includes(key)) {
    node?.setSharedPluginData(namespace, key, value);
    return;
  }

  // Get the byte length
  const byteLength = getUTF16StringSize(value);
  // If the value is small enough, store it directly
  if (byteLength <= MAX_CHUNK_SIZE) {
    // Set metadata to indicate single storage
    const metaKey = `${key}${METADATA_SUFFIX}`;
    node?.setSharedPluginData(namespace, metaKey, JSON.stringify({ type: 'single' }));

    // Store the data
    node?.setSharedPluginData(namespace, key, value);

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
    const chunks = splitIntoChunks(value, MAX_CHUNK_SIZE);
    const numChunks = chunks.length;

    // Set metadata to indicate chunked storage
    const metaKey = `${key}${METADATA_SUFFIX}`;
    node?.setSharedPluginData(
      namespace,
      metaKey,
      JSON.stringify({
        type: 'chunked',
        count: numChunks,
      }),
    );

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
