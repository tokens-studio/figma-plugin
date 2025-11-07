import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList, ThemeObject } from '@/types';
import { notifyUI, notifyException } from '../notifiers';

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

    // Validate that the collection exists and contains the mode
    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
    if (!collection) {
      // eslint-disable-next-line no-console
      console.warn(`Variable collection with ID ${collectionId} no longer exists. Skipping this theme dimension.`);
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
