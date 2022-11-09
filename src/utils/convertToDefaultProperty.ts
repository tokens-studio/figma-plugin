import { Properties } from '@/constants/Properties';

export function convertToDefaultProperty(property: string): string {
  let type: string = '';
  switch (property) {
    case Properties.width:
    case Properties.height:
      type = Properties.sizing;
      break;
    case Properties.itemSpacing:
    case Properties.verticalPadding:
    case Properties.horizontalPadding:
    case Properties.paddingTop:
    case Properties.paddingLeft:
    case Properties.paddingBottom:
    case Properties.paddingRight:
      type = Properties.spacing;
      break;
    case Properties.borderRadiusTopLeft:
    case Properties.borderRadiusTopRight:
    case Properties.borderRadiusBottomLeft:
    case Properties.borderRadiusBottomRight:
      type = Properties.borderRadius;
      break;
    case Properties.border:
      type = Properties.fill;
      break;
    case Properties.borderWidthTop:
    case Properties.borderWidthLeft:
    case Properties.borderWidthRight:
    case Properties.borderWidthBottom:
      type = Properties.borderWidth;
      break;
    case 'fontFamily':
      type = Properties.fontFamilies;
      break;
    case 'fontSize':
      type = Properties.fontSizes;
      break;
    case 'fontWeight':
      type = Properties.fontWeights;
      break;
    case 'lineHeights':
      type = Properties.lineHeights;
      break;
    default:
      type = property;
      break;
  }
  return type;
}
