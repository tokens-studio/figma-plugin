import { MapValuesToTokensResult } from '@/types';
import { GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import {
  effectStyleMatchesBoxShadowToken,
  paintStyleMatchesColorToken,
  textStyleMatchesTypographyToken,
} from './figmaUtils/styleMatchers';
import { clearStyleIdBackup, getNonLocalStyle, setStyleIdBackup } from './figmaUtils/styleUtils';
import {
  isPrimitiveValue, isSingleBoxShadowValue, isSingleTypographyValue,
} from '@/utils/is';
import { matchStyleName } from '@/utils/matchStyleName';
import { trySetStyleId } from '@/utils/trySetStyleId';
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';
import setBorderValuesOnTarget from './setBorderValuesOnTarget';
import { isSingleBorderValue } from '@/utils/is/isSingleBorderValue';
import setImageValuesOnTarget from './setImageValuesOnTarget';

// @README values typing is wrong

export default async function setValuesOnNode(
  node: BaseNode,
  values: MapValuesToTokensResult,
  data: NodeTokenRefMap,
  figmaStyleMaps: ReturnType<typeof getAllFigmaStyleMaps>,
  themeInfo: Omit<GetThemeInfoMessageResult, 'type'>,
  ignoreFirstPartForStyles = false,
  prefixStylesWithThemeName = false,
) {
  const activeThemeObject = themeInfo.activeTheme
    ? themeInfo.themes.find(({ id }) => themeInfo.activeTheme === id) ?? null
    : null;
  const stylePathSlice = ignoreFirstPartForStyles ? 1 : 0;
  const stylePathPrefix = prefixStylesWithThemeName && activeThemeObject ? activeThemeObject.name : null;
  try {
    // BORDER RADIUS
    if (
      node.type !== 'CONNECTOR'
      && node.type !== 'SHAPE_WITH_TEXT'
      && node.type !== 'STICKY'
      && node.type !== 'CODE_BLOCK'
    ) {
      // set border token
      if (values.border && isSingleBorderValue(values.border)) {
        setBorderValuesOnTarget(node, { value: values.border });
      }

      if (typeof values.borderRadius !== 'undefined' && isPrimitiveValue(values.borderRadius)) {
        const individualBorderRadius = String(values.borderRadius).split(' ');
        switch (individualBorderRadius.length) {
          case 1:
            if ('cornerRadius' in node) {
              node.cornerRadius = transformValue(String(values.borderRadius), 'borderRadius');
            }
            break;
          case 2:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius');
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius');
              node.bottomRightRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius');
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius');
            }
            break;
          case 3:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius');
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius');
              node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius');
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius');
            }
            break;
          case 4:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius');
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius');
              node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius');
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[3]), 'borderRadius');
            }
            break;
          default:
            break;
        }
      }
      if (
        'topLeftRadius' in node
        && typeof values.borderRadiusTopLeft !== 'undefined'
        && isPrimitiveValue(values.borderRadiusTopLeft)
      ) {
        node.topLeftRadius = transformValue(String(values.borderRadiusTopLeft), 'borderRadius');
      }
      if (
        'topRightRadius' in node
        && typeof values.borderRadiusTopRight !== 'undefined'
        && isPrimitiveValue(values.borderRadiusTopRight)
      ) {
        node.topRightRadius = transformValue(String(values.borderRadiusTopRight), 'borderRadius');
      }
      if (
        'bottomRightRadius' in node
        && typeof values.borderRadiusBottomRight !== 'undefined'
        && isPrimitiveValue(values.borderRadiusBottomRight)
      ) {
        node.bottomRightRadius = transformValue(String(values.borderRadiusBottomRight), 'borderRadius');
      }
      if (
        'bottomLeftRadius' in node
        && typeof values.borderRadiusBottomLeft !== 'undefined'
        && isPrimitiveValue(values.borderRadiusBottomLeft)
      ) {
        node.bottomLeftRadius = transformValue(String(values.borderRadiusBottomLeft), 'borderRadius');
      }

      // BOX SHADOW
      if ('effects' in node && typeof values.boxShadow !== 'undefined' && data.boxShadow) {
        const pathname = convertTokenNameToPath(data.boxShadow, stylePathPrefix, stylePathSlice);
        let matchingStyleId = matchStyleName(
          data.boxShadow,
          pathname,
          activeThemeObject?.$figmaStyleReferences ?? {},
          figmaStyleMaps.effectStyles,
        );

        if (!matchingStyleId) {
          // Local style not found - look for matching non-local style:
          if (isSingleBoxShadowValue(values.boxShadow)) {
            const styleIdBackupKey = 'effectStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'effects');
            if (nonLocalStyle) {
              if (effectStyleMatchesBoxShadowToken(nonLocalStyle, values.boxShadow)) {
                // Non-local style matches - use this and clear style id backup:
                matchingStyleId = nonLocalStyle.id;
                clearStyleIdBackup(node, styleIdBackupKey);
              } else if (pathname === nonLocalStyle.name) {
                // Non-local style does NOT match, but style name and token path does,
                // so we assume selected token value is an override (e.g. dark theme)
                // Now backup up style id before overwriting with raw token value, so we
                // can re-link the non-local style, when the token value matches again:
                setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
              }
            }
          }
        }

        if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'effect', matchingStyleId)))) {
          if (isSingleBoxShadowValue(values.boxShadow)) {
            setEffectValuesOnTarget(node, { value: values.boxShadow });
          }
        }
      }

      // BORDER WIDTH
      if ('strokeWeight' in node && typeof values.borderWidth !== 'undefined' && isPrimitiveValue(values.borderWidth)) {
        node.strokeWeight = transformValue(String(values.borderWidth), 'borderWidth');
      }

      if ('strokeTopWeight' in node && typeof values.borderWidthTop !== 'undefined') {
        node.strokeTopWeight = transformValue(String(values.borderWidthTop), 'borderWidthTop');
      }

      if ('strokeRightWeight' in node && typeof values.borderWidthRight !== 'undefined') {
        node.strokeRightWeight = transformValue(String(values.borderWidthRight), 'borderWidthRight');
      }

      if ('strokeBottomWeight' in node && typeof values.borderWidthBottom !== 'undefined') {
        node.strokeBottomWeight = transformValue(String(values.borderWidthBottom), 'borderWidthBottom');
      }

      if ('strokeLeftWeight' in node && typeof values.borderWidthLeft !== 'undefined') {
        node.strokeLeftWeight = transformValue(String(values.borderWidthLeft), 'borderWidthLeft');
      }

      // OPACITY
      if ('opacity' in node && typeof values.opacity !== 'undefined' && isPrimitiveValue(values.opacity)) {
        node.opacity = transformValue(String(values.opacity), 'opacity');
      }

      // SIZING: BOTH
      if ('resize' in node && typeof values.sizing !== 'undefined' && isPrimitiveValue(values.sizing)) {
        const size = transformValue(String(values.sizing), 'sizing');
        node.resize(size, size);
      }

      // SIZING: WIDTH
      if ('resize' in node && typeof values.width !== 'undefined' && isPrimitiveValue(values.width)) {
        node.resize(transformValue(String(values.width), 'sizing'), node.height);
      }

      // SIZING: HEIGHT
      if ('resize' in node && typeof values.height !== 'undefined' && isPrimitiveValue(values.height)) {
        node.resize(node.width, transformValue(String(values.height), 'sizing'));
      }

      // FILL
      if (values.fill && typeof values.fill === 'string') {
        if ('fills' in node && data.fill) {
          const pathname = convertTokenNameToPath(data.fill, stylePathPrefix, stylePathSlice);
          let matchingStyleId = matchStyleName(
            data.fill,
            pathname,
            activeThemeObject?.$figmaStyleReferences ?? {},
            figmaStyleMaps.paintStyles,
          );

          if (!matchingStyleId) {
            // Local style not found - look for matching non-local style:
            const styleIdBackupKey = 'fillStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'fills');
            if (nonLocalStyle) {
              if (paintStyleMatchesColorToken(nonLocalStyle, values.fill)) {
                // Non-local style matches - use this and clear style id backup:
                matchingStyleId = nonLocalStyle.id;
                clearStyleIdBackup(node, styleIdBackupKey);
              } else if (pathname === nonLocalStyle.name) {
                // Non-local style does NOT match, but style name and token path does,
                // so we assume selected token value is an override (e.g. dark theme)
                // Now backup up style id before overwriting with raw token value, so we
                // can re-link the non-local style, when the token value matches again:
                setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
              }
            }
          }

          if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'fill', matchingStyleId)))) {
            setColorValuesOnTarget(node, { value: values.fill }, 'fills');
          }
        }
      }

      // TYPOGRAPHY
      // Either set typography or individual values, if typography is present we prefer that.
      if (values.typography) {
        if (node.type === 'TEXT' && data.typography) {
          const pathname = convertTokenNameToPath(data.typography, stylePathPrefix, stylePathSlice);
          let matchingStyleId = matchStyleName(
            data.typography,
            pathname,
            activeThemeObject?.$figmaStyleReferences ?? {},
            figmaStyleMaps.textStyles,
          );

          if (!matchingStyleId && isSingleTypographyValue(values.typography)) {
            // Local style not found - look for matching non-local style:
            const styleIdBackupKey = 'textStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'typography');
            if (nonLocalStyle) {
              if (textStyleMatchesTypographyToken(nonLocalStyle, values.typography)) {
                // Non-local style matches - use this and clear style id backup:
                matchingStyleId = nonLocalStyle.id;
                clearStyleIdBackup(node, styleIdBackupKey);
              } else if (pathname === nonLocalStyle.name) {
                // Non-local style does NOT match, but style name and token path does,
                // so we assume selected token value is an override (e.g. dark theme)
                // Now backup up style id before overwriting with raw token value, so we
                // can re-link the non-local style, when the token value matches again:
                setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
              }
            }
          }

          if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'text', matchingStyleId)))) {
            if (isSingleTypographyValue(values.typography)) {
              setTextValuesOnTarget(node, { value: values.typography });
            }
          }
        }
      }
      if (
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
              fontFamily: isPrimitiveValue(values.fontFamilies) ? String(values.fontFamilies) : undefined,
              fontWeight: isPrimitiveValue(values.fontWeights) ? String(values.fontWeights) : undefined,
              lineHeight: isPrimitiveValue(values.lineHeights) ? String(values.lineHeights) : undefined,
              fontSize: isPrimitiveValue(values.fontSizes) ? String(values.fontSizes) : undefined,
              letterSpacing: isPrimitiveValue(values.letterSpacing) ? String(values.letterSpacing) : undefined,
              paragraphSpacing: isPrimitiveValue(values.paragraphSpacing) ? String(values.paragraphSpacing) : undefined,
              textCase: isPrimitiveValue(values.textCase) ? String(values.textCase) : undefined,
              textDecoration: isPrimitiveValue(values.textDecoration) ? String(values.textDecoration) : undefined,
            },
          });
        }
      }

      // BORDER COLOR
      if (typeof values.borderColor !== 'undefined' && typeof values.borderColor === 'string') {
        if ('strokes' in node && data.borderColor) {
          const pathname = convertTokenNameToPath(data.borderColor, stylePathPrefix, stylePathSlice);
          let matchingStyleId = matchStyleName(
            data.borderColor,
            pathname,
            activeThemeObject?.$figmaStyleReferences ?? {},
            figmaStyleMaps.paintStyles,
          );

          if (!matchingStyleId) {
            // Local style not found - look for matching non-local style:
            const styleIdBackupKey = 'strokeStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'strokes');
            if (nonLocalStyle) {
              if (paintStyleMatchesColorToken(nonLocalStyle, values.borderColor)) {
                // Non-local style matches - use this and clear style id backup:
                matchingStyleId = nonLocalStyle.id;
                clearStyleIdBackup(node, styleIdBackupKey);
              } else if (pathname === nonLocalStyle.name) {
                // Non-local style does NOT match, but style name and token path does,
                // so we assume selected token value is an override (e.g. dark theme)
                // Now backup up style id before overwriting with raw token value, so we
                // can re-link the non-local style, when the token value matches again:
                setStyleIdBackup(node, styleIdBackupKey, nonLocalStyle.id);
              }
            }
          }

          if (!matchingStyleId || (matchingStyleId && !(await trySetStyleId(node, 'stroke', matchingStyleId)))) {
            setColorValuesOnTarget(node, { value: values.borderColor }, 'strokes');
          }
        }
      }

      // SPACING
      if ('paddingLeft' in node && typeof values.spacing !== 'undefined' && isPrimitiveValue(values.spacing)) {
        const individualSpacing = String(values.spacing).split(' ');
        const spacing = transformValue(String(values.spacing), 'spacing');
        switch (individualSpacing.length) {
          case 1:
            node.paddingLeft = spacing;
            node.paddingRight = spacing;
            node.paddingTop = spacing;
            node.paddingBottom = spacing;
            break;
          case 2:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing');
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing');
            node.paddingBottom = transformValue(String(individualSpacing[0]), 'spacing');
            node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing');
            break;
          case 3:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing');
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing');
            node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing');
            node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing');
            break;
          case 4:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing');
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing');
            node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing');
            node.paddingLeft = transformValue(String(individualSpacing[3]), 'spacing');
            break;
          default:
            break;
        }
      }
      if (
        'paddingLeft' in node
        && typeof values.horizontalPadding !== 'undefined'
        && isPrimitiveValue(values.horizontalPadding)
      ) {
        const horizontalPadding = transformValue(String(values.horizontalPadding), 'spacing');
        node.paddingLeft = horizontalPadding;
        node.paddingRight = horizontalPadding;
      }
      if (
        'paddingTop' in node
        && typeof values.verticalPadding !== 'undefined'
        && isPrimitiveValue(values.verticalPadding)
      ) {
        const verticalPadding = transformValue(String(values.verticalPadding), 'spacing');
        node.paddingTop = verticalPadding;
        node.paddingBottom = verticalPadding;
      }

      if ('itemSpacing' in node && typeof values.itemSpacing !== 'undefined' && isPrimitiveValue(values.itemSpacing)) {
        if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
          node.primaryAxisAlignItems = 'MIN';
        }
        node.itemSpacing = transformValue(String(values.itemSpacing), 'spacing');
      }

      if ('paddingTop' in node && typeof values.paddingTop !== 'undefined' && isPrimitiveValue(values.paddingTop)) {
        node.paddingTop = transformValue(String(values.paddingTop), 'spacing');
      }
      if (
        'paddingRight' in node
        && typeof values.paddingRight !== 'undefined'
        && isPrimitiveValue(values.paddingRight)
      ) {
        node.paddingRight = transformValue(String(values.paddingRight), 'spacing');
      }

      if (
        'paddingBottom' in node
        && typeof values.paddingBottom !== 'undefined'
        && isPrimitiveValue(values.paddingBottom)
      ) {
        node.paddingBottom = transformValue(String(values.paddingBottom), 'spacing');
      }

      if ('paddingLeft' in node && typeof values.paddingLeft !== 'undefined' && isPrimitiveValue(values.paddingLeft)) {
        node.paddingLeft = transformValue(String(values.paddingLeft), 'spacing');
      }

      if (values.asset && typeof values.asset === 'string') {
        if ('fills' in node && data.asset) {
          await setImageValuesOnTarget(node, { value: values.asset });
        }
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

      if (
        typeof values.dimension !== 'undefined'
        && isPrimitiveValue(values.dimension)
      ) {
        if ('itemSpacing' in node) {
          if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
            node.primaryAxisAlignItems = 'MIN';
          }
          node.itemSpacing = transformValue(String(values.dimension), 'spacing');
        } else if ('resize' in node) {
          const size = transformValue(String(values.dimension), 'sizing');
          node.resize(size, size);
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
