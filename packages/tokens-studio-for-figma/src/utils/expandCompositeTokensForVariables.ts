import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from './tokenHelpers';
import { convertToDefaultProperty } from './convertToDefaultProperty';

/**
 * Maps property strings to their corresponding TokenTypes enum values.
 * The convertToDefaultProperty function returns string values that should map to TokenTypes.
 */
function mapPropertyToTokenType(propertyString: string): TokenTypes {
  // Direct mappings from property strings to TokenTypes enum values
  const propertyToTypeMap: Record<string, TokenTypes> = {
    color: TokenTypes.COLOR,
    borderWidth: TokenTypes.BORDER_WIDTH,
    fontFamilies: TokenTypes.FONT_FAMILIES,
    fontSizes: TokenTypes.FONT_SIZES,
    fontWeights: TokenTypes.FONT_WEIGHTS,
    lineHeights: TokenTypes.LINE_HEIGHTS,
    letterSpacing: TokenTypes.LETTER_SPACING,
    paragraphSpacing: TokenTypes.PARAGRAPH_SPACING,
    paragraphIndent: TokenTypes.PARAGRAPH_INDENT,
    dimension: TokenTypes.DIMENSION,
    sizing: TokenTypes.SIZING,
    spacing: TokenTypes.SPACING,
    borderRadius: TokenTypes.BORDER_RADIUS,
    opacity: TokenTypes.OPACITY,
    textCase: TokenTypes.TEXT_CASE,
    textDecoration: TokenTypes.TEXT_DECORATION,
  };

  return propertyToTypeMap[propertyString] || (propertyString as TokenTypes);
}

/**
 * Maps property keys to their appropriate token types based on the parent composite token type
 */
function getPropertyType(parentType: TokenTypes, propertyKey: string): TokenTypes {
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

  // For other composite types, use the default conversion and map to TokenTypes
  const propertyString = convertToDefaultProperty(propertyKey);
  return mapPropertyToTokenType(propertyString);
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
