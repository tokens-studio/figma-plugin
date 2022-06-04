# Storage providers and credentials
Storage providers and API credentials are stored in 2 parts.
1. The current storage type for the document is saved on the `figma.root` node as shared plugin data. (externally accessible). This way other team members will be prompted to use the same provider.
2. API credentials for different storage providers are stored on the client to ensure they remain private.

On startup the plugin will read the current storage provider and check whether there is a matching API credential stored on the client.