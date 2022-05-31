import { figmaRGBToHex } from '@figma-plugin/helpers';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import { tokensSharedDataHandler } from './SharedDataHandler';

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
        } else if (node.effectStyleId === '') { // only set raw token value if node isn't linked to a Figma style:
          setEffectValuesOnTarget(node, { value: values.boxShadow });
        }
      }

      // BORDER WIDTH
      if ('strokeWeight' in node && typeof values.borderWidth !== 'undefined') {
        node.strokeWeight = transformValue(values.borderWidth, 'borderWidth');
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
          let matchingStyle = figmaStyleMaps.paintStyles.get(pathname);

          if (!matchingStyle) {
            const fillStyleIdBackupKey = 'fillStyleId_original';
            let hasMatchingNonLocalStyle = false;
            const fillStyleIdOriginal = tokensSharedDataHandler.get(node, fillStyleIdBackupKey, (val) => (val ? JSON.parse(val) as string : val));
            const fillStyleId = fillStyleIdOriginal || (typeof node.fillStyleId === 'string' && node.fillStyleId);

            if (fillStyleId) {
              // console.log('setValuesOnNode -> looking for non-local style:', fillStyleId);
              const nonLocalStyle = figma.getStyleById(fillStyleId);
              if (nonLocalStyle?.type === 'PAINT') {
                // console.log('setValuesOnNode -> node has nonLocalStyle:', nonLocalStyle.name);

                const existingPaint = (nonLocalStyle as PaintStyle).paints[0] ?? null;
                if (existingPaint && existingPaint.type === 'SOLID') {
                  const { color, opacity } = convertToFigmaColor(values.fill);
                  const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
                  // Comparison using isPaintEqual doesn't work as Figma's hexToFigmaRGB has a rounding issue,
                  // that doesn't produce same RGB floats as the existing paint :(
                  // hasMatchingNonLocalStyle = isPaintEqual(newPaint, existingPaint);
                  // Compare using hex instead for now:
                  const existingHex = figmaRGBToHex(existingPaint.color);
                  const newHex = figmaRGBToHex(newPaint.color);
                  hasMatchingNonLocalStyle = existingHex === newHex;
                  if (hasMatchingNonLocalStyle) {
                    // console.log('setValuesOnNode -> hasMatchingNonLocalStyle=true so re-set it to linked style:', nonLocalStyle.name);
                    matchingStyle = nonLocalStyle as PaintStyle;
                    // Remove fillStyleId backup:
                    tokensSharedDataHandler.set(node, fillStyleIdBackupKey, '');
                  } else {
                    // console.log('setValuesOnNode -> hasMatchingNonLocalStyle=false so back up fillStyleId to restore later:', node.fillStyleId);
                    tokensSharedDataHandler.set(node, fillStyleIdBackupKey, JSON.stringify(fillStyleId));
                  }
                }
              }
            }
          }

          if (matchingStyle) {
            // matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
            // console.log('setValuesOnNode -> matching style found:', matchingStyle, ', node name:', node.name);
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
          } else if (node.textStyleId === '') { // only set raw token value if node isn't linked to a Figma style:
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
          } else if (node.strokeStyleId === '') { // only set raw token value if node isn't linked to a Figma style:
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
      if (values.value) {
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
