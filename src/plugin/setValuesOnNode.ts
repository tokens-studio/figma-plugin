import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default async function setValuesOnNode(
  node: BaseNode,
  values: Partial<Record<Properties, string>>,
  data: NodeTokenRefMap,
  figmaStyleMaps: ReturnType<typeof getAllFigmaStyleMaps>,
  ignoreFirstPartForStyles = false,
) {
  try {
    // BORDER RADIUS
    if (
      node.type !== 'CONNECTOR'
      && node.type !== 'SHAPE_WITH_TEXT'
      && node.type !== 'STICKY'
      && node.type !== 'CODE_BLOCK'
    ) {
      if ('cornerRadius' in node && typeof values.borderRadius !== 'undefined') {
        node.cornerRadius = transformValue(values.borderRadius, 'borderRadius');
      }
      if ('topLeftRadius' in node && typeof values.borderRadiusTopLeft !== 'undefined') {
        node.topLeftRadius = transformValue(values.borderRadiusTopLeft, 'borderRadius');
      }
      if ('topRightRadius' in node && typeof values.borderRadiusTopRight !== 'undefined') {
        node.topRightRadius = transformValue(values.borderRadiusTopRight, 'borderRadius');
      }
      if ('bottomRightRadius' in node && typeof values.borderRadiusBottomRight !== 'undefined') {
        node.bottomRightRadius = transformValue(values.borderRadiusBottomRight, 'borderRadius');
      }
      if ('bottomLeftRadius' in node && typeof values.borderRadiusBottomLeft !== 'undefined') {
        node.bottomLeftRadius = transformValue(values.borderRadiusBottomLeft, 'borderRadius');
      }

      // BOX SHADOW
      if ('effects' in node && typeof values.boxShadow !== 'undefined' && data.boxShadow) {
        const path = data.boxShadow.split('.');
        const pathname = path.slice(ignoreFirstPartForStyles ? 1 : 0, path.length).join('/');
        const matchingStyle = figmaStyleMaps.effectStyles.get(pathname);
        if (matchingStyle) {
          node.effectStyleId = matchingStyle.id;
        } else {
          setEffectValuesOnTarget(node, { value: values.boxShadow });
        }
      }

      // BORDER WIDTH
      if ('strokeWeight' in node && typeof values.borderWidth !== 'undefined') {
        node.strokeWeight = transformValue(values.borderWidth, 'borderWidth');
      }

      if ('strokeTopWeight' in node && typeof values.borderWidthTop !== 'undefined') {
        node.strokeTopWeight = transformValue(values.borderWidthTop, 'borderWidthTop');
      }

      if ('strokeRightWeight' in node && typeof values.borderWidthRight !== 'undefined') {
        node.strokeRightWeight = transformValue(values.borderWidthRight, 'borderWidthRight');
      }

      if ('strokeBottomWeight' in node && typeof values.borderWidthBottom !== 'undefined') {
        node.strokeBottomWeight = transformValue(values.borderWidthBottom, 'borderWidthBottom');
      }

      if ('strokeLeftWeight' in node && typeof values.borderWidthLeft !== 'undefined') {
        node.strokeLeftWeight = transformValue(values.borderWidthLeft, 'borderWidthLeft');
      }

      // OPACITY
      if ('opacity' in node && typeof values.opacity !== 'undefined') {
        node.opacity = transformValue(values.opacity, 'opacity');
      }

      // SIZING: BOTH
      if ('resize' in node && typeof values.sizing !== 'undefined') {
        node.resize(transformValue(values.sizing, 'sizing'), transformValue(values.sizing, 'sizing'));
      }

      // SIZING: WIDTH
      if ('resize' in node && typeof values.width !== 'undefined') {
        node.resize(transformValue(values.width, 'sizing'), node.height);
      }

      // SIZING: HEIGHT
      if ('resize' in node && typeof values.height !== 'undefined') {
        node.resize(node.width, transformValue(values.height, 'sizing'));
      }

      // FILL
      if (values.fill && typeof values.fill === 'string') {
        if ('fills' in node && data.fill) {
          const path = data.fill.split('.');
          const pathname = path.slice(ignoreFirstPartForStyles ? 1 : 0, path.length).join('/');
          const matchingStyle = figmaStyleMaps.paintStyles.get(pathname);
          if (matchingStyle) {
            // matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
            node.fillStyleId = matchingStyle.id;
          } else {
            setColorValuesOnTarget(node, { value: values.fill }, 'fills');
          }
        }
      }

      // TYPOGRAPHY
      // Either set typography or individual values, if typography is present we prefer that.
      if (values.typography) {
        if (node.type === 'TEXT' && data.typography) {
          const path = data.typography.split('.'); // extract to helper fn
          const pathname = path.slice(ignoreFirstPartForStyles ? 1 : 0, path.length).join('/');
          const matchingStyle = figmaStyleMaps.textStyles.get(pathname);
          if (matchingStyle) {
            node.textStyleId = matchingStyle.id;
          } else {
            setTextValuesOnTarget(node, { value: values.typography });
          }
        }
      } else if (
        values.fontFamilies
        || values.fontWeights
        || values.lineHeights
        || values.fontSizes
        || values.letterSpacing
        || values.paragraphSpacing
        || values.textCase
        || values.textDecoration
      ) {
        if (node.type === 'TEXT') {
          setTextValuesOnTarget(node, {
            value: {
              fontFamily: values.fontFamilies,
              fontWeight: values.fontWeights,
              lineHeight: values.lineHeights,
              fontSize: values.fontSizes,
              letterSpacing: values.letterSpacing,
              paragraphSpacing: values.paragraphSpacing,
              textCase: values.textCase,
              textDecoration: values.textDecoration,
            },
          });
        }
      }

      // BORDER COLOR
      if (typeof values.border !== 'undefined') {
        if ('strokes' in node && data.border) {
          const path = data.border.split('.');
          const pathname = path.slice(ignoreFirstPartForStyles ? 1 : 0, path.length).join('/');
          const matchingStyle = figmaStyleMaps.paintStyles.get(pathname);
          if (matchingStyle) {
            node.strokeStyleId = matchingStyle.id;
          } else {
            setColorValuesOnTarget(node, { value: values.border }, 'strokes');
          }
        }
      }

      // SPACING
      if ('paddingLeft' in node && typeof values.spacing !== 'undefined') {
        node.paddingLeft = transformValue(values.spacing, 'spacing');
        node.paddingRight = transformValue(values.spacing, 'spacing');
        node.paddingTop = transformValue(values.spacing, 'spacing');
        node.paddingBottom = transformValue(values.spacing, 'spacing');
        node.itemSpacing = transformValue(values.spacing, 'spacing');
      }
      if ('paddingLeft' in node && typeof values.horizontalPadding !== 'undefined') {
        node.paddingLeft = transformValue(values.horizontalPadding, 'spacing');
        node.paddingRight = transformValue(values.horizontalPadding, 'spacing');
      }
      if ('paddingTop' in node && typeof values.verticalPadding !== 'undefined') {
        node.paddingTop = transformValue(values.verticalPadding, 'spacing');
        node.paddingBottom = transformValue(values.verticalPadding, 'spacing');
      }
      if ('itemSpacing' in node && typeof values.itemSpacing !== 'undefined') {
        node.itemSpacing = transformValue(values.itemSpacing, 'spacing');
      }

      if ('paddingTop' in node && typeof values.paddingTop !== 'undefined') {
        node.paddingTop = transformValue(values.paddingTop, 'spacing');
      }
      if ('paddingRight' in node && typeof values.paddingRight !== 'undefined') {
        node.paddingRight = transformValue(values.paddingRight, 'spacing');
      }
      if ('paddingBottom' in node && typeof values.paddingBottom !== 'undefined') {
        node.paddingBottom = transformValue(values.paddingBottom, 'spacing');
      }
      if ('paddingLeft' in node && typeof values.paddingLeft !== 'undefined') {
        node.paddingLeft = transformValue(values.paddingLeft, 'spacing');
      }

      // Raw value for text layers
      if (values.tokenValue) {
        if ('characters' in node && node.fontName !== figma.mixed) {
          await figma.loadFontAsync(node.fontName);

          // If we're inserting an object, stringify that
          const value = typeof values.tokenValue === 'object' ? JSON.stringify(values.tokenValue) : values.tokenValue;
          node.characters = String(value);
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
  } catch (e) {
    console.log('Error setting data on node', e);
  }
}
