import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Properties } from '@/constants/Properties';

export const validateLivingDocumentationSelection: AsyncMessageChannelHandlers[AsyncMessageTypes.VALIDATE_LIVING_DOCUMENTATION_SELECTION] = async () => {
  const { selection } = figma.currentPage;

  // Check selection count
  if (selection.length === 0) {
    return {
      isValid: false,
      selectedCount: 0,
      validLayers: [],
      errorMessage: 'Please select a template frame.',
    };
  }

  if (selection.length > 1) {
    return {
      isValid: false,
      selectedCount: selection.length,
      validLayers: [],
      errorMessage: 'Please select only one template frame.',
    };
  }

  const selectedNode = selection[0];

  // Check if it's a frame
  if (selectedNode.type !== 'FRAME') {
    return {
      isValid: false,
      selectedCount: 1,
      validLayers: [],
      errorMessage: 'Please select a frame as your template.',
    };
  }

  // Get all valid property names from Properties enum
  const validProperties = Object.values(Properties);

  // Find layers with valid naming pattern
  const validLayers: string[] = [];

  function checkNode(node: SceneNode) {
    if ('name' in node && node.name.startsWith('__')) {
      const propertyName = node.name.substring(2); // Remove __ prefix
      if (validProperties.includes(propertyName as Properties)) {
        validLayers.push(node.name);
      }
    }

    // Recursively check children
    if ('children' in node) {
      node.children.forEach(checkNode);
    }
  }

  selectedNode.children.forEach(checkNode);

  if (validLayers.length === 0) {
    return {
      isValid: false,
      selectedCount: 1,
      validLayers: [],
      errorMessage: 'The selected frame does not contain any layers with valid property names (like __tokenName, __value, __tokenValue, etc.).',
    };
  }

  return {
    isValid: true,
    selectedCount: 1,
    validLayers,
  };
};
