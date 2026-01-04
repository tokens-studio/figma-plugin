import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';
import {
  createExtendedVariableCollection,
  findParentCollection,
  isExtendedCollectionTheme,
} from './extendedCollections';

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[]): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  return collectionsToCreateOrUpdate.reduce<VariableCollection[]>((acc, currentTheme) => {
    // Handle extended collections
    if (currentTheme.$figmaIsExtension && currentTheme.$figmaParentCollectionId) {
      // Find parent collection first
      const parentCollection = acc.find(
        (c) => c.id === currentTheme.$figmaParentCollectionId,
      ) || allCollections.find(
        (c) => c.id === currentTheme.$figmaParentCollectionId,
      );

      if (parentCollection) {
        // Extract child collection name from hierarchical group
        // group format: "ParentCollection/ChildCollection"
        const childCollectionName = currentTheme.group?.split('/').pop() || currentTheme.name;
        const truncatedChildName = truncateCollectionName(childCollectionName);

        // Check if extended collection already exists
        const existingExtendedCollection = acc.find((c) => c.id === currentTheme.$figmaCollectionId)
          || allCollections.find((c) => c.id === currentTheme.$figmaCollectionId);

        if (existingExtendedCollection) {
          // Update existing extended collection
          if (existingExtendedCollection.name !== truncatedChildName) {
            existingExtendedCollection.name = truncatedChildName;
          }
          const truncatedModeName = truncateModeName(currentTheme.name);
          const mode = existingExtendedCollection.modes.find(
            (m) => m.modeId === currentTheme.$figmaModeId || m.name === truncatedModeName,
          );
          if (mode && mode.name !== truncatedModeName) {
            existingExtendedCollection.renameMode(mode.modeId, truncatedModeName);
          }
          acc.push(existingExtendedCollection);
          return acc;
        }

        // Create new extended collection
        try {
          const extendedCollection = (parentCollection as any).extend(truncatedChildName);
          // Rename the default mode
          extendedCollection.renameMode(extendedCollection.modes[0].modeId, truncateModeName(currentTheme.name));
          acc.push(extendedCollection);
          return acc;
        } catch (error) {
          // Handle Enterprise plan limitation or other errors
          console.warn(`Cannot create extended collection "${truncatedChildName}":`, error);
          console.warn('Falling back to creating regular collection. Extended collections require Figma Enterprise plan.');
          // Fall through to create regular collection
        }
      }
    }

    // Regular collection logic (original behavior)
    const nameOfCollection = truncateCollectionName(currentTheme.group ?? currentTheme.name); // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const originalNameOfCollection = currentTheme.group ?? currentTheme.name; // Keep original for finding existing collections
    const existingCollection = acc.find((collection) => collection.name === nameOfCollection || collection.name === originalNameOfCollection)
      || allCollections.find((vr) => vr.id === currentTheme.$figmaCollectionId
        || vr.name === nameOfCollection || vr.name === originalNameOfCollection);

    if (existingCollection) {
      // Check if we already have a collection with the same name, if not find one by the id of $themes or as a fallback by name
      // We do this because we might've found the collection by id, but the name might've changed
      if (existingCollection.name !== nameOfCollection) {
        existingCollection.name = nameOfCollection;
      }
      // If we found an existing collection, check if the mode exists, if not create it
      const truncatedModeName = truncateModeName(currentTheme.name);
      const mode = existingCollection.modes.find((m) => m.modeId === currentTheme.$figmaModeId || m.name === currentTheme.name || m.name === truncatedModeName);

      if (mode) {
        if (mode.name !== truncatedModeName) {
          existingCollection.renameMode(mode.modeId, truncatedModeName);
        }
      } else {
        createVariableMode(existingCollection, currentTheme.name);
      }
      acc.push(existingCollection);
      return acc;
    }
    // If no existing collection is found, create a new one and rename the default mode
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);

    newCollection.renameMode(newCollection.modes[0].modeId, truncateModeName(currentTheme.name));
    acc.push(newCollection);
    return acc;
  }, []);
}
