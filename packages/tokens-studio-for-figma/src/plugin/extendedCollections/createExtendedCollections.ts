import { ThemeObject } from '@/types';
import { truncateCollectionName, truncateModeName } from '@/utils/truncateName';

function updateExistingExtendedCollection(
  collection: VariableCollection,
  truncatedChildName: string,
  currentTheme: ThemeObject,
): VariableCollection {
  if (collection.name !== truncatedChildName) {
    collection.name = truncatedChildName;
  }

  const truncatedModeName = truncateModeName(currentTheme.name);
  const mode = collection.modes.find(
    (m) => m.modeId === currentTheme.$figmaModeId || m.name === truncatedModeName,
  );

  if (mode && mode.name !== truncatedModeName) {
    collection.renameMode(mode.modeId, truncatedModeName);
  }

  return collection;
}

function createNewExtendedCollection(
  parentCollection: VariableCollection,
  truncatedChildName: string,
  currentTheme: ThemeObject,
): VariableCollection | null {
  try {
    const extendedCollection = (parentCollection as any).extend(truncatedChildName);

    extendedCollection.renameMode(
      extendedCollection.modes[0].modeId,
      truncateModeName(currentTheme.name),
    );

    return extendedCollection;
  } catch (error) {
    console.warn(`Cannot create extended collection "${truncatedChildName}":`, error);
    console.warn('Extended collections require Figma Enterprise plan. Falling back to regular collection.');
    return null;
  }
}

export async function createExtendedVariableCollection(
  currentTheme: ThemeObject,
  parentCollection: VariableCollection,
  allCollections: VariableCollection[],
  accumulatedCollections: VariableCollection[],
): Promise<VariableCollection | null> {
  const childCollectionName = currentTheme.group?.split('/').pop() || currentTheme.name;
  const truncatedChildName = truncateCollectionName(childCollectionName);

  const existingExtendedCollection = accumulatedCollections.find((c) => c.id === currentTheme.$figmaCollectionId)
        || allCollections.find((c) => c.id === currentTheme.$figmaCollectionId);

  if (existingExtendedCollection) {
    return updateExistingExtendedCollection(existingExtendedCollection, truncatedChildName, currentTheme);
  }

  return createNewExtendedCollection(parentCollection, truncatedChildName, currentTheme);
}

export function findParentCollection(
  currentTheme: ThemeObject,
  accumulatedCollections: VariableCollection[],
  allCollections: VariableCollection[],
): VariableCollection | null {
  if (!currentTheme.$figmaParentCollectionId) {
    return null;
  }

  return (
    accumulatedCollections.find((c) => c.id === currentTheme.$figmaParentCollectionId)
        || allCollections.find((c) => c.id === currentTheme.$figmaParentCollectionId)
        || null
  );
}

export function isExtendedCollectionTheme(theme: ThemeObject): boolean {
  return Boolean(theme.$figmaIsExtension && theme.$figmaParentCollectionId);
}
