import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

// Generic function to apply text character values to a node, useful for documentation purposes where users want to apply certain metadata of a token to their layers
export async function applyTextCharacterValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
) {
  // Raw value for text layers
  if (values.tokenValue) {
    if ('characters' in node && node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);

      // If we're inserting an object, stringify that
      const value = typeof values.tokenValue === 'object' ? JSON.stringify(values.tokenValue) : values.tokenValue;
      node.characters = String(value);
    }
  }

  // When a text token is applied we want to apply the token value
  if (
    'characters' in node &&
    node.fontName !== figma.mixed &&
    typeof values.text === 'string' &&
    typeof data.text !== 'undefined'
  ) {
    if (!(await tryApplyVariableId(node, 'characters', data.text))) {
      await figma.loadFontAsync(node.fontName);
      node.characters = values.text;
    }
  }
  // Real value for text layers
  if ('value' in values) {
    if ('characters' in node && node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);
      // If we're inserting an object, stringify that
      const value = typeof values.value === 'object' ? JSON.stringify(values.value) : values.value;
      node.characters = String(value);
    }
  }

  // Name value for text layers
  if (values.tokenName) {
    if ('characters' in node && node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);
      node.characters = String(values.tokenName);
    }
  }

  // Name value for text layers
  if (values.description) {
    if ('characters' in node && node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);
      node.characters = String(values.description);
    }
  }
}
