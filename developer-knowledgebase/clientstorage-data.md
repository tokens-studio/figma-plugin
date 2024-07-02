# Figma `clientStorage` data

The following data is being saved on the client of Figma.
Read more about Figma's client storage [here](https://www.figma.com/plugin-docs/api/figma-clientStorage/).

| Key            | Type                        | Description                                                                                                                             |
| -------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `userId`       | `string`                    | This is an auto generated ID to identify users.                                                                                         |
| `licenseKey`   | `string`                    | This is the license key for the plugin. This is coming from our licensing tool (`keygen.sh`)                                              |
| `lastOpened`   | `number`                    | This is the last opened timestamp of the plugin (`Date.now()`)                                                                          |
| `apiProviders` | `StorageTypeCredentials[]` | These are the locally saved storage providers / API credentials. These will include their secrets (api keys/personal access tokens...) |
