# Figma shared node data

The following data is being saved on nodes (or on the document itself).
Any data saved this way is technically publicly accessible. More about the shared plugin data system can be found [here](https://www.figma.com/plugin-docs/api/properties/nodes-setsharedplugindata/).

| Key                    | Type                               | Description                                                                                                                                                                                            |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `version`              | `string`                           | This is the current plugin version. It is saved on the document level (`figma.root`), but also on each node which has tokens. This is important to be able to migrate data in the future if necessary |
| `updatedAt`            | `string`                           | This is property saved the last updated timestamp and it's only saved on `figma.root`                                                                                                                  |
| `values`               | `Record<string, AnyTokenSet>`      | This is key stores the actual token values (if remote storage is not enabled). This is also saved on `figma.root`                                                                                      |
| `storageType`          | `StorageType`                      | This key saves the currently selected (remote) storage provider. This value will never include the API secret of the provider                                                                          |
| `usedTokenSet`         | `UsedTokenSetsMap`                 | This is the map used to determine the selected token sets. This used to be a `string[]` array but is being migrated to a map                                                                           |
| `activeTheme`          | `string`                           | This is used to keep track of which theme was activated                                                                                                                                                |
| `themes`               | `ThemeObjectsList`                 | This key saves all the available themes. (only if remote storage is not enabled)                                                                                                                       |
| `{Property}`           | `any`                              | Each property will have it's own key to store the assigned token value                                                                                                                                 |
