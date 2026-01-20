// Given an array of collections and a mode name and collection name, this function will return the collection and modeId if it exists
export function findCollectionAndModeIdForTheme(collectionName: string, modeName: string, allCollections: VariableCollection[]): { collection: VariableCollection; modeId: string; } {
  // For extended collections, collectionName might be "ParentGroup/ExtendedGroup"
  // But the actual extended collection name is just "ExtendedGroup"
  // So we need to extract the last part if it contains a slash
  const actualCollectionName = collectionName.includes('/')
    ? collectionName.split('/').pop() || collectionName
    : collectionName;

  const existingCollection = allCollections.find((vr) => vr.name === actualCollectionName);
  let collection;
  let modeId;

  if (existingCollection) {
    collection = existingCollection;
    const mode = existingCollection.modes.find((m) => m.name === modeName);
    modeId = mode?.modeId;
  }

  return { collection, modeId };
}
