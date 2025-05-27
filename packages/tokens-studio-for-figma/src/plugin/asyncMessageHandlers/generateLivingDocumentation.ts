import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokensSharedDataHandler } from '../SharedDataHandler';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { getTokenData } from '../node';
import { notifyUI } from '../notifiers';

export const generateLivingDocumentation: AsyncMessageChannelHandlers[AsyncMessageTypes.GENERATE_LIVING_DOCUMENTATION] = async (msg) => {
  try {
    const { tokenSet, startsWith } = msg;

    // Get the template layer from current selection
    if (figma.currentPage.selection.length !== 1) {
      throw new Error('Please select exactly one layer to use as a template');
    }

    const templateLayer = figma.currentPage.selection[0];
    if (!templateLayer) {
      throw new Error('Template layer not found');
    }

    // Get token data from plugin storage
    const tokenData = await getTokenData();
    if (!tokenData || !tokenData.values[tokenSet]) {
      throw new Error(`Token set "${tokenSet}" not found`);
    }

    // Filter tokens by startsWith criteria
    const filteredTokens = tokenData.values[tokenSet].filter(token =>
      token.name.startsWith(startsWith)
    );

    if (filteredTokens.length === 0) {
      throw new Error(`No tokens found starting with "${startsWith}" in set "${tokenSet}"`);
    }

    // Create main documentation frame
    const documentationFrame = figma.createFrame();
    documentationFrame.name = `Living Documentation - ${tokenSet}`;
    documentationFrame.layoutMode = 'VERTICAL';
    documentationFrame.itemSpacing = 16;
    documentationFrame.paddingTop = 32;
    documentationFrame.paddingRight = 32;
    documentationFrame.paddingBottom = 32;
    documentationFrame.paddingLeft = 32;
    documentationFrame.primaryAxisSizingMode = 'AUTO';
    documentationFrame.counterAxisSizingMode = 'AUTO';
    documentationFrame.fills = [];

    // Position the frame near the current viewport
    const viewport = figma.viewport.center;
    documentationFrame.x = viewport.x;
    documentationFrame.y = viewport.y;

    // Process each filtered token
    for (const token of filteredTokens) {
      // Duplicate the template layer
      const duplicatedLayer = templateLayer.clone();
      duplicatedLayer.name = token.name;

      // Add to documentation frame
      documentationFrame.appendChild(duplicatedLayer);

      // Find all layers with names starting with "__" (template placeholders)
      const findPlaceholderLayers = (node: SceneNode): SceneNode[] => {
        const placeholders: SceneNode[] = [];

        if (node.name.startsWith('__')) {
          placeholders.push(node);
        }

        if ('children' in node) {
          for (const child of node.children) {
            placeholders.push(...findPlaceholderLayers(child));
          }
        }

        return placeholders;
      };

      const placeholderLayers = findPlaceholderLayers(duplicatedLayer);

      // Process each placeholder layer
      for (const placeholderLayer of placeholderLayers) {
        const property = placeholderLayer.name.replace('__', '');

        // Set text content if it's a text layer
        if (placeholderLayer.type === 'TEXT') {
          await figma.loadFontAsync(placeholderLayer.fontName as FontName);
          placeholderLayer.characters = token.name;
        }

        // Set plugin data on the layer
        const value = token.name;
        placeholderLayer.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, property, `"${value}"`);
      }
    }

    notifyUI(`Living documentation generated with ${filteredTokens.length} tokens`, { error: false });

    return {
      success: true,
      frameId: documentationFrame.id,
    };
  } catch (error) {
    console.error('Error generating living documentation:', error);
    notifyUI(`Error generating living documentation: ${error.message}`, { error: true });
    return {
      success: false,
    };
  }
};
