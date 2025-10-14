import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList } from '@/types';
import { notifyUI, notifyException } from '../notifiers';

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
  // Find the active theme object
  const activeThemeId = Object.values(activeTheme)[0];
  const activeThemeObject = themes.find((theme) => theme.id === activeThemeId);

  if (!activeThemeObject || !activeThemeObject.$figmaCollectionId || !activeThemeObject.$figmaModeId) {
    // No Figma collection/mode information available for this theme
    return;
  }

  const { $figmaCollectionId: collectionId, $figmaModeId: modeId } = activeThemeObject;

  // Validate that the collection exists and contains the mode
  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  if (!collection) {
    console.warn(`Variable collection with ID ${collectionId} no longer exists. Cannot swap modes.`);
    notifyUI('The variable collection linked to this theme no longer exists', { error: true });
    return;
  }

  const modeExists = collection.modes.some((mode) => mode.modeId === modeId);
  if (!modeExists) {
    console.warn(`Mode ${modeId} no longer exists in collection ${collection.name}. Cannot swap modes.`);
    notifyUI(`The mode linked to this theme no longer exists in collection "${collection.name}"`, { error: true });
    return;
  }

  // Get the root nodes based on update mode
  const rootNodes = getRootNode(updateMode);

  // Apply the mode to each root node
  rootNodes.forEach((node) => {
    try {
      // Pass the collection object instead of ID (new API)
      node.setExplicitVariableModeForCollection(collection, modeId);
    } catch (error) {
      // Catch any remaining errors we didn't anticipate - report to Sentry
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to set variable mode for node ${node.name}:`, error);
      notifyException(`Unexpected error in swapFigmaModes for node ${node.name}: ${errorMessage}`, {
        collectionId,
        modeId,
        nodeType: node.type,
      });
    }
  });
}
