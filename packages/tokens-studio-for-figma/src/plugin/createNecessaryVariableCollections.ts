import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[]): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  const updatedCollections = collectionsToCreateOrUpdate.reduce((acc, currentTheme) => {
    const nameOfCollection = currentTheme.group ?? currentTheme.name; // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const existingCollection = acc[nameOfCollection] || allCollections.find((vr) => vr.name === nameOfCollection);

    // If we found an existing collection, check if the mode exists, if not create it
    if (existingCollection) {
      const mode = existingCollection.modes.find((m) => m.name === currentTheme.name);

      if (!mode) {
        createVariableMode(existingCollection, currentTheme.name);
      }
      acc[nameOfCollection] = existingCollection;
      return acc;
    }
    // If no existing collection is found, create a new one and rename the default mode
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);

    newCollection.renameMode(newCollection.modes[0].modeId, currentTheme.name);
    acc[nameOfCollection] = newCollection;
    return acc;
  }, {});
  return Object.values(updatedCollections);
}
