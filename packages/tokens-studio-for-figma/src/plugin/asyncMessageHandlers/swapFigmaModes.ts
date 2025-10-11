import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList } from '@/types';

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

  // Get the root nodes based on update mode
  const rootNodes = getRootNode(updateMode);

  // Apply the mode to each root node
  rootNodes.forEach((node) => {
    try {
      node.setExplicitVariableModeForCollection(collectionId, modeId);
    } catch (error) {
      // Silently fail if the collection doesn't exist or the node doesn't support variable modes
      console.warn(`Failed to set variable mode for node ${node.name}:`, error);
    }
  });
}
