// Given an array of collections and a mode name and collection name, this function will return the collection and modeId if it exists
export function findCollectionAndModeIdForTheme(collectionName: string, modeName: string, allCollections: VariableCollection[]): { collection: VariableCollection; modeId: string; } {
  const existingCollection = allCollections.find((vr) => vr.name === collectionName);
  let collection;
  let modeId;

  if (existingCollection) {
    collection = existingCollection;
    const mode = existingCollection.modes.find((m) => m.name === modeName);
    modeId = mode?.modeId;
  }

  return { collection, modeId };
}
