import { Properties } from '@/constants/Properties';

export default function removeValuesFromNode(node: BaseNode, prop: Properties) {
  // BORDER RADIUS
  switch (prop) {
    case 'borderRadius':
      if (
        'cornerRadius' in node
        && typeof node.cornerRadius !== 'undefined'
        && node.type !== 'SHAPE_WITH_TEXT'
        && node.type !== 'CONNECTOR'
      ) {
        node.cornerRadius = 0;
      }
      break;
    case 'borderRadiusTopLeft':
      if ('topLeftRadius' in node && typeof node.topLeftRadius !== 'undefined') {
        node.topLeftRadius = 0;
      }
      break;
    case 'borderRadiusTopRight':
      if ('topRightRadius' in node && typeof node.topRightRadius !== 'undefined') {
        node.topRightRadius = 0;
      }
      break;
    case 'borderRadiusBottomRight':
      if ('bottomRightRadius' in node && typeof node.bottomRightRadius !== 'undefined') {
        node.bottomRightRadius = 0;
      }
      break;
    case 'borderRadiusBottomLeft':
      if ('bottomLeftRadius' in node && typeof node.bottomLeftRadius !== 'undefined') {
        node.bottomLeftRadius = 0;
      }
      break;
    case 'borderWidth':
      if ('strokeWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      break;
    case 'borderWidthTop':
      if ('strokeTopWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      break;
    case 'borderWidthRight':
      if ('strokeRightWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      break;
    case 'borderWidthBottom':
      if ('strokeBottomWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      break;
    case 'borderWidthLeft':
      if ('strokeLeftWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      break;
    case 'boxShadow':
      if ('effects' in node && typeof node.effects !== 'undefined') {
        node.effects = node.effects.filter((effect) => effect.type !== 'DROP_SHADOW');
      }
      break;
    case 'opacity':
      if (
        'opacity' in node
        && typeof node.opacity !== 'undefined'
        && node.type !== 'STICKY'
        && node.type !== 'SHAPE_WITH_TEXT'
        && node.type !== 'CODE_BLOCK'
        && node.type !== 'CONNECTOR'
      ) {
        node.opacity = 1;
      }
      break;
    case 'fill':
      if ('fills' in node && typeof node.fills !== 'undefined') {
        node.fills = [];
      }
      break;
    case 'borderColor':
      if ('strokes' in node && typeof node.strokes !== 'undefined') {
        node.strokes = [];
      }
      break;
    case 'spacing':
      if ('paddingLeft' in node && typeof node.paddingLeft !== 'undefined') {
        node.paddingLeft = 0;
        node.paddingRight = 0;
        node.paddingTop = 0;
        node.paddingBottom = 0;
        node.itemSpacing = 0;
      }
      break;
    case 'paddingTop':
      if ('paddingTop' in node && typeof node.paddingTop !== 'undefined') {
        node.paddingTop = 0;
      }
      break;
    case 'paddingRight':
      if ('paddingRight' in node && typeof node.paddingRight !== 'undefined') {
        node.paddingRight = 0;
      }
      break;
    case 'paddingBottom':
      if ('paddingBottom' in node && typeof node.paddingBottom !== 'undefined') {
        node.paddingBottom = 0;
      }
      break;
    case 'paddingLeft':
      if ('paddingLeft' in node && typeof node.paddingLeft !== 'undefined') {
        node.paddingLeft = 0;
      }
      break;
    case 'horizontalPadding':
      if ('paddingLeft' in node && typeof node.paddingLeft !== 'undefined') {
        node.paddingLeft = 0;
        node.paddingRight = 0;
      }
      break;
    case 'verticalPadding':
      if ('paddingTop' in node && typeof node.paddingTop !== 'undefined') {
        node.paddingTop = 0;
        node.paddingBottom = 0;
      }
      break;
    case 'itemSpacing':
      if ('itemSpacing' in node && typeof node.itemSpacing !== 'undefined') {
        node.itemSpacing = 0;
      }
      break;
    case 'asset':
      if ('fills' in node && typeof node.fills !== 'undefined') {
        node.fills = [];
      }
      break;
    case 'border':
      if ('strokes' in node && typeof node.strokes !== 'undefined') {
        node.strokes = [];
      }
      if ('strokeWeight' in node && typeof node.strokeWeight !== 'undefined') {
        node.strokeWeight = 0;
      }
      if ('dashPattern' in node && typeof node.dashPattern !== 'undefined') {
        node.dashPattern = [0, 0];
      }
      break;
    case 'textDecoration':
      if ('textDecoration' in node && typeof node.textDecoration !== 'undefined') {
        console.log('hehe');
        node.textDecoration = 'NONE';
      }
      break;
    default:
      break;
  }
}
