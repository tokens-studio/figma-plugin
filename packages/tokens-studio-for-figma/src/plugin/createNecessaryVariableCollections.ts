import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';
import { resolveThemeDependencies, getParentTheme } from './resolveThemeDependencies';
import { isExtendedCollection, getParentVariableCollectionId } from './extendedCollectionHelpers';

/**
 * Finds a parent collection for a theme that extends another theme.
 * Looks in both processed collections (acc) and all existing Figma collections.
 */
function findParentCollection(
  parentTheme: ThemeObjectsList[number],
  processedCollections: VariableCollection[],
  allCollections: VariableCollection[],
): VariableCollection | undefined {
  const parentCollectionName = truncateCollectionName(parentTheme.group ?? parentTheme.name);
  const originalParentName = parentTheme.group ?? parentTheme.name;

  // First look in already-processed collections (from current batch)
  let parentCollection = processedCollections.find(
    (c) => c.id === parentTheme.$figmaCollectionId
      || c.name === parentCollectionName
      || c.name === originalParentName,
  );

  // Then look in all existing collections
  if (!parentCollection) {
    parentCollection = allCollections.find(
      (c) => c.id === parentTheme.$figmaCollectionId
        || c.name === parentCollectionName
        || c.name === originalParentName,
    );
  }

  return parentCollection;
}

/**
 * Creates an extended collection using the parent's .extend() method.
 * Falls back to regular collection creation if .extend() is not available.
 */
function createExtendedCollection(
  parentCollection: VariableCollection,
  collectionName: string,
): VariableCollection {
  // Check if .extend() method is available
  if (typeof parentCollection.extend === 'function') {
    return parentCollection.extend(collectionName);
  }
  // Fallback: create regular collection (without inheritance)
  // This handles cases where the Figma API doesn't support .extend()
  return figma.variables.createVariableCollection(collectionName);
}

// Takes a given theme input and creates required variable collections with modes, or updates existing ones and renames / adds modes
export async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[]): Promise<VariableCollection[]> {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  // Sort themes so parents are processed before children
  const sortedThemes = resolveThemeDependencies(collectionsToCreateOrUpdate);

  return sortedThemes.reduce<VariableCollection[]>((acc, currentTheme) => {
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

    // If no existing collection is found, create a new one
    // Check if this theme extends another theme - if so, create an extended collection
    const parentTheme = currentTheme.$extendsThemeId
      ? getParentTheme(currentTheme, themes)
      : undefined;

    let newCollection: VariableCollection;

    if (parentTheme) {
      // Theme extends another theme - try to create extended collection
      const parentCollection = findParentCollection(parentTheme, acc, allCollections);

      if (parentCollection) {
        newCollection = createExtendedCollection(parentCollection, nameOfCollection);
        // Store parent collection ID on theme for reference
        // Note: This mutates the theme object - caller should persist this change
        // eslint-disable-next-line no-param-reassign
        currentTheme.$figmaParentCollectionId = parentCollection.id;
      } else {
        // Parent collection not found - create regular collection with warning
        console.warn(`Parent collection for theme "${currentTheme.name}" not found. Creating standalone collection.`);
        newCollection = figma.variables.createVariableCollection(nameOfCollection);
      }
    } else {
      // Regular theme (no inheritance) - create standard collection
      newCollection = figma.variables.createVariableCollection(nameOfCollection);
    }

    newCollection.renameMode(newCollection.modes[0].modeId, truncateModeName(currentTheme.name));
    acc.push(newCollection);
    return acc;
  }, []);
}
