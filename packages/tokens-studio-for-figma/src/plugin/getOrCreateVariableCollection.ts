import createVariableMode from './createVariableMode';


export function getOrCreateVariableCollection(collectionName: string, modeName: string, allCollections: VariableCollection[]): { collection: VariableCollection; modeId: string; } {
  const existingCollection = allCollections.find((vr) => vr.name === collectionName);
  let collection;
  let modeId: string;

  if (existingCollection) {
    const mode = existingCollection.modes.find((m) => m.name === modeName);
    modeId = mode?.modeId ?? createVariableMode(existingCollection, modeName);
  } else {
    collection = figma.variables.createVariableCollection(collectionName);
    collection.renameMode(collection.modes[0].modeId, modeName);
    modeId = collection.modes[0].modeId;
  }

  return { collection, modeId };
}
