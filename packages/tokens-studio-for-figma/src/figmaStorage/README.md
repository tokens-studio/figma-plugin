# Figma Storage

This directory contains the implementation of the storage mechanism used to store token data in Figma.

## FigmaStorageProperty

The `FigmaStorageProperty` class is the core of the storage mechanism. It provides a way to read and write data to Figma's storage, either using client storage or shared plugin data.

### Chunking

As of version X.X.X, the `FigmaStorageProperty` class automatically handles chunking of large data when using shared plugin data. This is necessary because Figma has a 100KB size limit per individual call to `figma.root.setSharedPluginData(namespace, key, value)`.

When writing data that exceeds the safe limit (95KB), the data is automatically split into multiple chunks and stored under separate keys. Metadata is also stored to keep track of the chunks and facilitate reassembly when reading the data.

### Usage

```typescript
// Create a property for storing values
const ValuesProperty = new FigmaStorageProperty<string>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.values}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<string>(() => (
    value ? JSON.parse(value) : {}
  ), ''),
);

// Write data - chunking happens automatically if needed
await ValuesProperty.write(largeData);

// Read data - chunks are automatically reassembled if needed
const data = await ValuesProperty.read();
```

### Compression

For token data, we also use compression with `lz-string` to reduce the size of the data before storing it. This is handled separately from the chunking mechanism:

```typescript
import { compressToUTF16 } from 'lz-string';

// Compress the data
const compressedData = compressToUTF16(JSON.stringify(data));

// Store the compressed data (chunking happens automatically if needed)
await ValuesProperty.write(compressedData);
```

When reading the data, we need to decompress it:

```typescript
import { decompressFromUTF16 } from 'lz-string';

// Read the data (chunks are automatically reassembled if needed)
const compressedData = await ValuesProperty.read();

// Decompress the data
const data = JSON.parse(decompressFromUTF16(compressedData));
```

## Backward Compatibility

The chunking mechanism is designed to be backward compatible with existing data. When reading data, it first checks if there's metadata indicating chunked data. If not, it falls back to reading the data directly.

This means that existing data will continue to work without any changes, and new data will be automatically chunked if needed.
