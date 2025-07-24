# Figma `clientStorage` data

The following data is being saved on the client of Figma.
Read more about Figma's client storage [here](https://www.figma.com/plugin-docs/api/figma-clientStorage/).

| Key                           | Type                        | Description                                                                                                                             |
| ----------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `userId`                      | `string`                    | This is an auto generated ID to identify users.                                                                                         |
| `licenseKey`                  | `string`                    | This is the license key for the plugin. This is coming from our licensing tool (`keygen.sh`)                                            |
| `lastOpened`                  | `number`                    | This is the last opened timestamp of the plugin (`Date.now()`)                                                                          |
| `apiProviders`                | `StorageTypeCredentials[]`  | These are the locally saved storage providers / API credentials. These will include their secrets (api keys/personal access tokens...)  |
| `{fileKey}/tokens/values`     | `string` (compressed JSON)  | Token values for a specific file, compressed with lz-string.                                                                            |
| `{fileKey}/tokens/themes`     | `string` (compressed JSON)  | Theme configurations for a specific file, compressed with lz-string.                                                                    |
| `{fileKey}/tokens/checkForChanges` | `string` (compressed JSON) | Flag indicating whether to check for changes in tokens for a specific file.                                                         |

## FileKey

The `fileKey` is a unique identifier generated for each Figma file when the plugin is first used in that file. It's a 24-character string that persists across sessions and is stored as shared plugin data on the root node of the Figma document. This allows the plugin to:

1. Associate client-side stored data with specific Figma files
2. Maintain file-specific settings and tokens even when accessed from different devices
3. Ensure data consistency when multiple users collaborate on the same file

The fileKey is generated using the `generateId` utility and is saved to the Figma file itself, making it consistent for all users of that file.

## Storage Management

The plugin uses client storage to save tokens and themes for each Figma file. Since Figma's client storage has a 5MB limit, the plugin implements a storage management strategy:

1. Data is compressed using lz-string's compressToUTF16 before storing
2. When adding new data would exceed the safe limit (4MB), the plugin automatically cleans up data from other files
3. The current file's data is always preserved, while older files' data may be removed

This approach ensures the plugin can continue to function even with large token sets, while prioritizing the current file's data.
