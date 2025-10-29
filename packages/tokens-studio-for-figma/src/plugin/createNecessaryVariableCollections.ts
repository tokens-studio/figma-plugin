import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(
  themes: ThemeObjectsList,
  selectedThemes: string[],
): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  return collectionsToCreateOrUpdate.reduce<VariableCollection[]>((acc, currentTheme) => {
    const nameOfCollection = currentTheme.group ?? currentTheme.name; // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const existingCollection =
      acc.find((collection) => collection.name === nameOfCollection) ||
      allCollections.find((vr) => vr.id === currentTheme.$figmaCollectionId || vr.name === nameOfCollection);

    if (existingCollection) {
      // Check if we already have a collection with the same name, if not find one by the id of $themes or as a fallback by name
      // We do this because we might've found the collection by id, but the name might've changed
      if (existingCollection.name !== nameOfCollection) {
        existingCollection.name = nameOfCollection;
      }
      // If we found an existing collection, check if the mode exists, if not create it
      const mode = existingCollection.modes.find(
        (m) => m.modeId === currentTheme.$figmaModeId || m.name === currentTheme.name,
      );

      if (mode) {
        if (mode.name !== currentTheme.name) {
          existingCollection.renameMode(mode.modeId, currentTheme.name);
        }
      } else {
        createVariableMode(existingCollection, currentTheme.name);
      }
      acc.push(existingCollection);
      return acc;
    }
    // If no existing collection is found, create a new one and rename the default mode
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);

    newCollection.renameMode(newCollection.modes[0].modeId, currentTheme.name);
    acc.push(newCollection);
    return acc;
  }, []);
}
