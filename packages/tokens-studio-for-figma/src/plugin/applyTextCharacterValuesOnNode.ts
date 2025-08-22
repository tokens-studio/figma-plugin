import { MapValuesToTokensResult } from '@/types';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

// Utility function to format objects and arrays nicely for display
function formatValueForDisplay(value: any): string {
  try {
    // Handle null and undefined gracefully
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '';

      // For arrays, format each item on a new line with proper indentation
      const formattedItems = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const formattedItem = formatValueForDisplay(item);
          return formattedItem;
        }
        return `${item}`;
      });

      return formattedItems.join('\n\n');
    }

    if (typeof value === 'object' && value !== null) {
      // For objects, format each property on a new line with proper indentation
      const entries = Object.entries(value);
      if (entries.length === 0) return '';

      const formattedProps = entries.map(([key, propValue]) => {
        if (typeof propValue === 'object' && propValue !== null) {
          const formattedProp = formatValueForDisplay(propValue);
          return `${key}: ${formattedProp}`;
        }
        return `${key}: ${propValue}`;
      });

      return formattedProps.join('\n');
    }

    // For primitive values, return as string
    return String(value);
  } catch (e) {
    // Fallback to JSON.stringify if formatting fails
    return JSON.stringify(value);
  }
}

// Generic function to apply text character values to a node, useful for documentation purposes where users want to apply certain metadata of a token to their layers
export async function applyTextCharacterValuesOnNode(
  node: BaseNode,
  data: NodeTokenRefMap,
  values: MapValuesToTokensResult,
) {
  // Raw value for text layers
  if ('tokenValue' in values) {
    if ('characters' in node && node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName);

      // Use formatted display for objects and arrays, fallback to string for primitives
      const value = typeof values.tokenValue === 'object' ? formatValueForDisplay(values.tokenValue) : values.tokenValue;
      node.characters = String(value);
    }
  }

  // When a text token is applied we want to apply the token value
  if (
    'characters' in node
    && node.fontName !== figma.mixed
    && typeof values.text === 'string'
    && typeof data.text !== 'undefined'
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
      // Use formatted display for objects and arrays, fallback to string for primitives
      const value = typeof values.value === 'object' ? formatValueForDisplay(values.value) : values.value;
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
