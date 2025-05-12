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
 * Reads data from Figma's shared plugin data, automatically handling chunked data if present
 * @param namespace The namespace to read from
 * @param key The key to read from
 * @param node The node to read from (defaults to figma.root)
 * @returns The data as a string or null if no data is found
 */
export async function readSharedPluginData(
  namespace: string,
  key: string,
  node: BaseNode = figma.root,
): Promise<string | null> {
  // For any properties other than values and themes, use regular read, no chunking
  if (!['values', 'themes'].includes(key)) {
    const value = node?.getSharedPluginData(namespace, key);
    return value || null;
  }

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
        return value || null;
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

        // Join chunks and return
        return chunks.join('');
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
  return value || null;
}
