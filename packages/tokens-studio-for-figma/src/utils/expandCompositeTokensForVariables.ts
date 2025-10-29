import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';
import { ResolveTokenValuesResult } from './tokenHelpers';
import { convertToDefaultProperty } from './convertToDefaultProperty';

/**
 * Maps property keys to their appropriate token types based on the parent composite token type
 */
function getPropertyType(parentType: TokenTypes, propertyKey: string): TokenTypes | string {
  // Handle border-specific properties
  if (parentType === TokenTypes.BORDER) {
    if (propertyKey === 'width') {
      return TokenTypes.BORDER_WIDTH;
    }
    if (propertyKey === 'color') {
      return TokenTypes.COLOR;
    }
  }

  // Handle boxShadow-specific properties
  if (parentType === TokenTypes.BOX_SHADOW) {
    if (propertyKey === 'color') {
      return TokenTypes.COLOR;
    }
  }

  // For other composite types, use the default conversion
  const defaultProperty = convertToDefaultProperty(propertyKey);
  
  // Map Properties enum values to TokenTypes enum values
  // The convertToDefaultProperty returns string values that match TokenTypes enum values
  return defaultProperty as TokenTypes;
}

/**
 * Expands composite tokens (typography, border, boxShadow, composition) into individual property tokens
 * that can be exported as variables
 */
export function expandCompositeTokensForVariables(
  tokens: ResolveTokenValuesResult[],
): ResolveTokenValuesResult[] {
  const expandedTokens: ResolveTokenValuesResult[] = [];

  tokens.forEach((token) => {
    const isCompositeToken = [
      TokenTypes.TYPOGRAPHY,
      TokenTypes.BORDER,
      TokenTypes.BOX_SHADOW,
      TokenTypes.COMPOSITION,
    ].includes(token.type);

    if (isCompositeToken && typeof token.value === 'object' && token.value !== null) {
      // Expand composite token into individual properties
      Object.entries(token.value).forEach(([propertyKey, propertyValue]) => {
        if (typeof propertyValue === 'string' || typeof propertyValue === 'number') {
          const propertyType = getPropertyType(token.type, propertyKey);

          expandedTokens.push({
            ...token,
            name: `${token.name}.${propertyKey}`,
            type: propertyType,
            value: propertyValue,
          } as ResolveTokenValuesResult);
        }
      });
    } else {
      // Keep non-composite tokens as-is
      expandedTokens.push(token);
    }
  });

  return expandedTokens;
}
