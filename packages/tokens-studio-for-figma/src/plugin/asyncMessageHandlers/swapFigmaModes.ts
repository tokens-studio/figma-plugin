import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList, ThemeObject } from '@/types';
import { notifyUI, notifyException } from '../notifiers';

// Cache for imported remote collections to avoid re-importing
const remoteCollectionCache = new Map<string, VariableCollection>();

// Type predicate to check for Figma theme with collection and mode IDs
function isFigmaThemeWithCollectionAndMode(
  theme: ThemeObject | undefined,
): theme is ThemeObject & { $figmaCollectionId: string; $figmaModeId: string } {
  return (
    theme != null
    && typeof theme.$figmaCollectionId === 'string'
    && typeof theme.$figmaModeId === 'string'
  );
}

/**
 * Attempts to import a remote variable collection by finding and importing one of its variables.
 * This is necessary for external/library collections that haven't been imported yet.
 * @param collectionId The ID of the collection to import
 * @returns The VariableCollection object if successfully imported, null otherwise
 */
async function importRemoteVariableCollection(collectionId: string): Promise<VariableCollection | null> {
  // Check cache first
  if (remoteCollectionCache.has(collectionId)) {
    return remoteCollectionCache.get(collectionId)!;
  }

  try {
    // Get all available remote library collections
    const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

    // Try each library collection to find the one with matching ID
    for (const libraryCollection of libraryCollections) {
      try {
        // Get variables in this remote collection
        const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollection.key);

        if (variables.length === 0) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // Import the first variable to bring the collection into local context
        const importedVariable = await figma.variables.importVariableByKeyAsync(variables[0].key);

        // Check if this is the collection we're looking for
        if (importedVariable.variableCollectionId === collectionId) {
          // Get the full collection object
          const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
          if (collection) {
            // Cache the collection for future use
            remoteCollectionCache.set(collectionId, collection);
            return collection;
          }
        }
      } catch (error) {
        // If we can't import from this library collection, try the next one
        // eslint-disable-next-line no-console
        console.warn(`Failed to import variable from library collection ${libraryCollection.key}:`, error);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to access remote library collections:', error);
  }

  return null;
}

function getRootNode(updateMode: UpdateMode) {
  const rootNode: (SceneNode | PageNode)[] = [];
  switch (updateMode) {
    case UpdateMode.PAGE:
      // Set mode on the page itself instead of its children
      rootNode.push(figma.currentPage);
      break;
    case UpdateMode.SELECTION:
      if (figma.currentPage.selection) rootNode.push(...figma.currentPage.selection);
      break;
    case UpdateMode.DOCUMENT:
      // Set mode on each page instead of all their children
      rootNode.push(...figma.root.children);
      break;
    default:
      rootNode.push(figma.currentPage);
      break;
  }
  return rootNode;
}

// Switch Figma's native theme mode for nodes based on active theme
export async function swapFigmaModes(activeTheme: Record<string, string>, themes: ThemeObjectsList, updateMode: UpdateMode) {
  // Find all active theme objects with Figma metadata
  const activeThemeIds = Object.values(activeTheme);
  const activeThemeObjects = activeThemeIds
    .map((id) => themes.find((theme) => theme.id === id))
    .filter(isFigmaThemeWithCollectionAndMode);

  if (activeThemeObjects.length === 0) {
    // No Figma collection/mode information available for any active theme
    return;
  }

  // Validate all collections and modes, collecting valid ones
  const validCollectionModePairs: Array<{ collection: VariableCollection; modeId: string }> = [];

  for (const themeObject of activeThemeObjects) {
    const { $figmaCollectionId: collectionId, $figmaModeId: modeId } = themeObject;

    // Try to get the collection - first try as a local collection
    let collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);

    // If not found locally, try to import it from remote libraries
    if (!collection) {
      collection = await importRemoteVariableCollection(collectionId);
    }

    if (!collection) {
      // eslint-disable-next-line no-console
      console.warn(`Variable collection with ID ${collectionId} not found in local file or remote libraries. Skipping this theme dimension.`);
      notifyUI('One of the variable collections linked to this theme no longer exists', { error: true });
      // eslint-disable-next-line no-continue
      continue;
    }

    const modeExists = collection.modes.some((mode) => mode.modeId === modeId);
    if (!modeExists) {
      // eslint-disable-next-line no-console
      console.warn(`Mode ${modeId} no longer exists in collection ${collection.name}. Skipping this theme dimension.`);
      notifyUI(`One of the modes linked to this theme no longer exists in collection "${collection.name}"`, { error: true });
      // eslint-disable-next-line no-continue
      continue;
    }

    validCollectionModePairs.push({ collection, modeId });
  }

  if (validCollectionModePairs.length === 0) {
    // No valid collection/mode pairs found
    return;
  }

  // Get the root nodes based on update mode
  const rootNodes = getRootNode(updateMode);

  // Apply all valid collection/mode pairs to each root node
  // Batch operations to reduce iterations: apply all collections to a node at once
  for (const node of rootNodes) {
    for (const { collection, modeId } of validCollectionModePairs) {
      try {
        // Pass the collection object instead of ID (new API)
        node.setExplicitVariableModeForCollection(collection, modeId);
      } catch (error) {
        // Catch any remaining errors we didn't anticipate - report to Sentry
        const errorMessage = error instanceof Error ? error.message : String(error);
        // eslint-disable-next-line no-console
        console.warn(`Failed to set variable mode for node ${node.name}:`, error);
        notifyException(`Unexpected error in swapFigmaModes for node ${node.name}: ${errorMessage}`, {
          collectionId: collection.id,
          modeId,
          nodeType: node.type,
        });
      }
    }
  }
}
