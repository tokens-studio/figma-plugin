import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';

export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[]) {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  return collectionsToCreateOrUpdate.map((theme) => {
    const nameOfCollection = theme.group ?? theme.name; // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const existingCollection = allCollections.find((vr) => vr.name === nameOfCollection);
    if (existingCollection) {
      const mode = existingCollection.modes.find((m) => m.name === theme.name);
      if (!mode) createVariableMode(existingCollection, theme.name);
      return existingCollection;
    }
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);
    newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
    return newCollection;
  });
}
