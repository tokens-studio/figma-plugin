import { TokenTypes } from '@/constants/TokenTypes';

export function normalizeTokenType(type: string | undefined): string | undefined {
  if (!type) return type;
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case 'space':
    case 'spacing':
      return TokenTypes.SPACING;
    case 'size':
    case 'sizing':
      return TokenTypes.SIZING;
    case 'radius':
    case 'borderradius':
      return TokenTypes.BORDER_RADIUS;
    case 'width':
    case 'borderwidth':
      return TokenTypes.BORDER_WIDTH;
    case 'shadow':
    case 'boxshadow':
      return TokenTypes.BOX_SHADOW;
    case 'fontfamily':
    case 'fontfamilies':
      return TokenTypes.FONT_FAMILIES;
    case 'fontweight':
    case 'fontweights':
      return TokenTypes.FONT_WEIGHTS;
    case 'lineheight':
    case 'lineheights':
      return TokenTypes.LINE_HEIGHTS;
    case 'fontsize':
    case 'fontsizes':
      return TokenTypes.FONT_SIZES;
    case 'letterspacing':
      return TokenTypes.LETTER_SPACING;
    case 'paragraphspacing':
      return TokenTypes.PARAGRAPH_SPACING;
    case 'paragraphindent':
      return TokenTypes.PARAGRAPH_INDENT;
    default:
      return type;
  }
}
