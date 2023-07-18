import { MapValuesToTokensResult } from '@/types';
import { GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { isAutoLayout } from '@/utils/isAutoLayout';
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
import setBackgroundBlurOnTarget from './setBackgroundBlurOnTarget';
import setImageValuesOnTarget from './setImageValuesOnTarget';
import { defaultBaseFontSize } from '@/constants/defaultBaseFontSize';
import { isCompositeBorderValue } from '@/utils/is/isCompositeBorderValue';
import { setBorderColorValuesOnTarget } from './setBorderColorValuesOnTarget';
import removeValuesFromNode from './removeValuesFromNode';
import { Properties } from '@/constants/Properties';
import { getVariablesMap } from '@/utils/getVariablesMap';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';
import { ColorPaintType, tryApplyColorVariableId } from '@/utils/tryApplyColorVariableId';

// @README values typing is wrong

export default async function setValuesOnNode(
  node: BaseNode,
  values: MapValuesToTokensResult,
  data: NodeTokenRefMap,
  figmaStyleMaps: ReturnType<typeof getAllFigmaStyleMaps>,
  themeInfo: Omit<GetThemeInfoMessageResult, 'type'>,
  ignoreFirstPartForStyles = false,
  prefixStylesWithThemeName = false,
  baseFontSize = defaultBaseFontSize,
) {
  // Filter activeThemes e.g light, desktop
  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));
  const stylePathSlice = ignoreFirstPartForStyles ? 1 : 0;
  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : null;
  const figmaVariableMaps = getVariablesMap();

  // Store all figmaStyleReferences through all activeThemes (e.g {color.red: ['s.1234'], color.blue ['s.2345', 's.3456']})
  const figmaStyleReferences: Record<string, string> = {};
  const figmaVariableReferences: Record<string, string> = {};
  activeThemes?.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([token, variableId]) => {
      if (!figmaVariableReferences[token]) {
        figmaVariableReferences[token] = variableId;
      }
    });
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences[token]) {
        figmaStyleReferences[token] = styleId;
      }
    });
  });

  try {
    // BORDER RADIUS
    if (
      node.type !== 'CONNECTOR'
      && node.type !== 'SHAPE_WITH_TEXT'
      && node.type !== 'STICKY'
      && node.type !== 'CODE_BLOCK'
    ) {
      Object.entries(values).forEach(([key, value]) => {
        if (value === 'none') {
          removeValuesFromNode(node, key as Properties);
          delete values[key];
        }
      });
      // set border token
      if (values.border && isCompositeBorderValue(values.border)) {
        setBorderValuesOnTarget(node, { value: values.border }, baseFontSize);
      }
      if (values.borderTop && isCompositeBorderValue(values.borderTop)) {
        setBorderValuesOnTarget(node, { value: values.borderTop }, baseFontSize, 'top');
      }
      if (values.borderRight && isCompositeBorderValue(values.borderRight)) {
        setBorderValuesOnTarget(node, { value: values.borderRight }, baseFontSize, 'right');
      }
      if (values.borderBottom && isCompositeBorderValue(values.borderBottom)) {
        setBorderValuesOnTarget(node, { value: values.borderBottom }, baseFontSize, 'bottom');
      }
      if (values.borderLeft && isCompositeBorderValue(values.borderLeft)) {
        setBorderValuesOnTarget(node, { value: values.borderLeft }, baseFontSize, 'left');
      }

      // if applied border is just a string, it's the older version where border was just a color. apply color then.
      if (values.border && typeof values.border === 'string' && typeof data.border !== 'undefined') {
        setBorderColorValuesOnTarget({
          node, data: data.border, value: values.border, stylePathPrefix, stylePathSlice, styleReferences: figmaStyleReferences ?? {}, paintStyles: figmaStyleMaps.paintStyles, figmaVariableReferences, figmaVariableMaps,
        });
      }

      // Border Radius
      if (typeof values.borderRadius !== 'undefined' && typeof data.borderRadius !== 'undefined' && isPrimitiveValue(values.borderRadius)) {
        const individualBorderRadius = String(values.borderRadius).split(' ');
        switch (individualBorderRadius.length) {
          case 1:
            if ('cornerRadius' in node) {
              if (!(await tryApplyVariableId(node, 'topLeftRadius', data.borderRadius, figmaVariableReferences, figmaVariableMaps)
              && await tryApplyVariableId(node, 'topRightRadius', data.borderRadius, figmaVariableReferences, figmaVariableMaps)
              && await tryApplyVariableId(node, 'bottomRightRadius', data.borderRadius, figmaVariableReferences, figmaVariableMaps)
              && await tryApplyVariableId(node, 'bottomLeftRadius', data.borderRadius, figmaVariableReferences, figmaVariableMaps))) {
                node.cornerRadius = transformValue(String(values.borderRadius), 'borderRadius', baseFontSize);
              }
            }
            break;
          case 2:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
              node.bottomRightRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
            }
            break;
          case 3:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
              node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius', baseFontSize);
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
            }
            break;
          case 4:
            if ('topLeftRadius' in node) {
              node.topLeftRadius = transformValue(String(individualBorderRadius[0]), 'borderRadius', baseFontSize);
              node.topRightRadius = transformValue(String(individualBorderRadius[1]), 'borderRadius', baseFontSize);
              node.bottomRightRadius = transformValue(String(individualBorderRadius[2]), 'borderRadius', baseFontSize);
              node.bottomLeftRadius = transformValue(String(individualBorderRadius[3]), 'borderRadius', baseFontSize);
            }
            break;
          default:
            break;
        }
      }
      if (
        'topLeftRadius' in node
        && typeof values.borderRadiusTopLeft !== 'undefined'
        && typeof data.borderRadiusTopLeft !== 'undefined'
        && isPrimitiveValue(values.borderRadiusTopLeft)
      ) {
        if (!(await tryApplyVariableId(node, 'topLeftRadius', data.borderRadiusTopLeft, figmaVariableReferences, figmaVariableMaps))) {
          node.topLeftRadius = transformValue(String(values.borderRadiusTopLeft), 'borderRadius', baseFontSize);
        }
      }
      if (
        'topRightRadius' in node
        && typeof values.borderRadiusTopRight !== 'undefined'
        && typeof data.borderRadiusTopRight !== 'undefined'
        && isPrimitiveValue(values.borderRadiusTopRight)
      ) {
        if (!(await tryApplyVariableId(node, 'topRightRadius', data.borderRadiusTopRight, figmaVariableReferences, figmaVariableMaps))) {
          node.topRightRadius = transformValue(String(values.borderRadiusTopRight), 'borderRadius', baseFontSize);
        }
      }
      if (
        'bottomRightRadius' in node
        && typeof values.borderRadiusBottomRight !== 'undefined'
        && typeof data.borderRadiusBottomRight !== 'undefined'
        && isPrimitiveValue(values.borderRadiusBottomRight)
      ) {
        if (!(await tryApplyVariableId(node, 'bottomRightRadius', data.borderRadiusBottomRight, figmaVariableReferences, figmaVariableMaps))) {
          node.bottomRightRadius = transformValue(String(values.borderRadiusBottomRight), 'borderRadius', baseFontSize);
        }
      }
      if (
        'bottomLeftRadius' in node
        && typeof values.borderRadiusBottomLeft !== 'undefined'
        && typeof data.borderRadiusBottomLeft !== 'undefined'
        && isPrimitiveValue(values.borderRadiusBottomLeft)
      ) {
        if (!(await tryApplyVariableId(node, 'bottomLeftRadius', data.borderRadiusBottomLeft, figmaVariableReferences, figmaVariableMaps))) {
          node.bottomLeftRadius = transformValue(String(values.borderRadiusBottomLeft), 'borderRadius', baseFontSize);
        }
      }

      // BOX SHADOW
      if ('effects' in node && typeof values.boxShadow !== 'undefined' && data.boxShadow) {
        const pathname = convertTokenNameToPath(data.boxShadow, stylePathPrefix, stylePathSlice);
        let matchingStyleId = matchStyleName(
          data.boxShadow,
          pathname,
          figmaStyleReferences ?? {},
          figmaStyleMaps.effectStyles,
        );

        if (!matchingStyleId) {
          // Local style not found - look for matching non-local style:
          if (isSingleBoxShadowValue(values.boxShadow)) {
            const styleIdBackupKey = 'effectStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'effects');
            if (nonLocalStyle) {
              if (effectStyleMatchesBoxShadowToken(nonLocalStyle, values.boxShadow, baseFontSize)) {
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
            setEffectValuesOnTarget(node, { value: values.boxShadow }, baseFontSize);
          }
        }
      }

      // BACKGROUND BLUR
      if ('effects' in node && typeof values.backgroundBlur !== 'undefined' && isPrimitiveValue(values.backgroundBlur)) {
        setBackgroundBlurOnTarget(node, { value: String(values.backgroundBlur) }, baseFontSize);
      }

      // BORDER WIDTH
      if ('strokeWeight' in node && typeof values.borderWidth !== 'undefined' && isPrimitiveValue(values.borderWidth)) {
        node.strokeWeight = transformValue(String(values.borderWidth), 'borderWidth', baseFontSize);
      }

      if ('strokeTopWeight' in node && typeof values.borderWidthTop !== 'undefined') {
        node.strokeTopWeight = transformValue(String(values.borderWidthTop), 'borderWidthTop', baseFontSize);
      }

      if ('strokeRightWeight' in node && typeof values.borderWidthRight !== 'undefined') {
        node.strokeRightWeight = transformValue(String(values.borderWidthRight), 'borderWidthRight', baseFontSize);
      }

      if ('strokeBottomWeight' in node && typeof values.borderWidthBottom !== 'undefined') {
        node.strokeBottomWeight = transformValue(String(values.borderWidthBottom), 'borderWidthBottom', baseFontSize);
      }

      if ('strokeLeftWeight' in node && typeof values.borderWidthLeft !== 'undefined') {
        node.strokeLeftWeight = transformValue(String(values.borderWidthLeft), 'borderWidthLeft', baseFontSize);
      }

      // OPACITY
      if ('opacity' in node && typeof values.opacity !== 'undefined' && isPrimitiveValue(values.opacity)) {
        node.opacity = transformValue(String(values.opacity), 'opacity', baseFontSize);
      }

      // SIZING: BOTH
      if ('resize' in node && typeof values.sizing !== 'undefined' && typeof data.sizing !== 'undefined' && isPrimitiveValue(values.sizing)) {
        if (!((await tryApplyVariableId(node, 'width', data.sizing, figmaVariableReferences, figmaVariableMaps))
        && (await tryApplyVariableId(node, 'height', data.sizing, figmaVariableReferences, figmaVariableMaps)))) {
          const size = transformValue(String(values.sizing), 'sizing', baseFontSize);
          node.resize(size, size);
        }
      }

      // SIZING: WIDTH
      if ('resize' in node && typeof values.width !== 'undefined' && typeof data.width !== 'undefined' && isPrimitiveValue(values.width)) {
        if (!(await tryApplyVariableId(node, 'width', data.width, figmaVariableReferences, figmaVariableMaps))) {
          node.resize(transformValue(String(values.width), 'sizing', baseFontSize), node.height);
        }
      }

      // SIZING: HEIGHT
      if ('resize' in node && typeof values.height !== 'undefined' && typeof data.height !== 'undefined' && isPrimitiveValue(values.height)) {
        if (!(await tryApplyVariableId(node, 'height', data.height, figmaVariableReferences, figmaVariableMaps))) {
          node.resize(node.width, transformValue(String(values.height), 'sizing', baseFontSize));
        }
      }

      // min width, max width, min height, max height only are applicable to autolayout frames or their direct children
      if (node.type !== 'DOCUMENT' && node.type !== 'PAGE' && (isAutoLayout(node) || (node.parent && node.parent.type !== 'DOCUMENT' && node.parent.type !== 'PAGE' && isAutoLayout(node.parent)))) {
        // SIZING: MIN WIDTH
        if ('minWidth' in node && typeof values.minWidth !== 'undefined' && typeof data.minWidth !== 'undefined' && isPrimitiveValue(values.minWidth)) {
          if (!(await tryApplyVariableId(node, 'minWidth', data.minWidth, figmaVariableReferences, figmaVariableMaps))) {
            node.minWidth = transformValue(String(values.minWidth), 'sizing', baseFontSize);
          }
        }

        // SIZING: MAX WIDTH
        if ('maxWidth' in node && typeof values.maxWidth !== 'undefined' && typeof data.maxWidth !== 'undefined' && isPrimitiveValue(values.maxWidth)) {
          if (!(await tryApplyVariableId(node, 'maxWidth', data.maxWidth, figmaVariableReferences, figmaVariableMaps))) {
            node.maxWidth = transformValue(String(values.maxWidth), 'sizing', baseFontSize);
          }
        }

        // SIZING: MIN HEIGHT
        if ('minHeight' in node && typeof values.minHeight !== 'undefined' && typeof data.minHeight !== 'undefined' && isPrimitiveValue(values.minHeight)) {
          if (!(await tryApplyVariableId(node, 'minHeight', data.minHeight, figmaVariableReferences, figmaVariableMaps))) {
            node.minHeight = transformValue(String(values.minHeight), 'sizing', baseFontSize);
          }
        }

        // SIZING: MAX HEIGHT
        if ('maxHeight' in node && typeof values.maxHeight !== 'undefined' && typeof data.maxHeight !== 'undefined' && isPrimitiveValue(values.maxHeight)) {
          if (!(await tryApplyVariableId(node, 'maxHeight', data.maxHeight, figmaVariableReferences, figmaVariableMaps))) {
            node.maxHeight = transformValue(String(values.maxHeight), 'sizing', baseFontSize);
          }
        }
      }

      // FILL
      if (values.fill && typeof values.fill === 'string') {
        if ('fills' in node && data.fill) {
          if (!(await tryApplyColorVariableId(node, data.fill, figmaVariableReferences, figmaVariableMaps, ColorPaintType.FILLS))) {
            const pathname = convertTokenNameToPath(data.fill, stylePathPrefix, stylePathSlice);
            let matchingStyleId = matchStyleName(
              data.fill,
              pathname,
              figmaStyleReferences ?? {},
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
      }

      // TYPOGRAPHY
      // Either set typography or individual values, if typography is present we prefer that.
      if (values.typography) {
        if (node.type === 'TEXT' && data.typography) {
          const pathname = convertTokenNameToPath(data.typography, stylePathPrefix, stylePathSlice);
          let matchingStyleId = matchStyleName(
            data.typography,
            pathname,
            figmaStyleReferences ?? {},
            figmaStyleMaps.textStyles,
          );

          if (!matchingStyleId && isSingleTypographyValue(values.typography)) {
            // Local style not found - look for matching non-local style:
            const styleIdBackupKey = 'textStyleId_original';
            const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'typography');
            if (nonLocalStyle) {
              if (textStyleMatchesTypographyToken(nonLocalStyle, values.typography, baseFontSize)) {
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
              setTextValuesOnTarget(node, { value: values.typography }, baseFontSize);
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
          }, baseFontSize);
        }
      }

      // BORDER COLOR
      if (typeof values.borderColor !== 'undefined' && typeof values.borderColor === 'string') {
        if ('strokes' in node && data.borderColor) {
          setBorderColorValuesOnTarget({
            node, data: data.borderColor, value: values.borderColor, stylePathPrefix, stylePathSlice, styleReferences: figmaStyleReferences ?? {}, paintStyles: figmaStyleMaps.paintStyles, figmaVariableReferences, figmaVariableMaps,
          });
        }
      }

      // SPACING
      if ('paddingLeft' in node && typeof values.spacing !== 'undefined' && typeof data.spacing !== 'undefined' && isPrimitiveValue(values.spacing)) {
        const individualSpacing = String(values.spacing).split(' ');
        const spacing = transformValue(String(values.spacing), 'spacing', baseFontSize);
        switch (individualSpacing.length) {
          case 1:
            if (!(await tryApplyVariableId(node, 'paddingLeft', data.spacing, figmaVariableReferences, figmaVariableMaps)
            && await tryApplyVariableId(node, 'paddingRight', data.spacing, figmaVariableReferences, figmaVariableMaps)
            && await tryApplyVariableId(node, 'paddingTop', data.spacing, figmaVariableReferences, figmaVariableMaps)
            && await tryApplyVariableId(node, 'paddingBottom', data.spacing, figmaVariableReferences, figmaVariableMaps))) {
              node.paddingLeft = spacing;
              node.paddingRight = spacing;
              node.paddingTop = spacing;
              node.paddingBottom = spacing;
            }
            break;
          case 2:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
            node.paddingBottom = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
            node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
            break;
          case 3:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
            node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing', baseFontSize);
            node.paddingLeft = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
            break;
          case 4:
            node.paddingTop = transformValue(String(individualSpacing[0]), 'spacing', baseFontSize);
            node.paddingRight = transformValue(String(individualSpacing[1]), 'spacing', baseFontSize);
            node.paddingBottom = transformValue(String(individualSpacing[2]), 'spacing', baseFontSize);
            node.paddingLeft = transformValue(String(individualSpacing[3]), 'spacing', baseFontSize);
            break;
          default:
            break;
        }
      }
      if (
        'paddingLeft' in node
        && typeof values.horizontalPadding !== 'undefined'
        && typeof data.horizontalPadding !== 'undefined'
        && isPrimitiveValue(values.horizontalPadding)
      ) {
        if (!(await tryApplyVariableId(node, 'paddingLeft', data.horizontalPadding, figmaVariableReferences, figmaVariableMaps)
        && await tryApplyVariableId(node, 'paddingRight', data.horizontalPadding, figmaVariableReferences, figmaVariableMaps))) {
          const horizontalPadding = transformValue(String(values.horizontalPadding), 'spacing', baseFontSize);
          node.paddingLeft = horizontalPadding;
          node.paddingRight = horizontalPadding;
        }
      }
      if (
        'paddingTop' in node
        && typeof values.verticalPadding !== 'undefined'
        && typeof data.verticalPadding !== 'undefined'
        && isPrimitiveValue(values.verticalPadding)
      ) {
        if (!(await tryApplyVariableId(node, 'paddingTop', data.verticalPadding, figmaVariableReferences, figmaVariableMaps)
        && await tryApplyVariableId(node, 'paddingBottom', data.verticalPadding, figmaVariableReferences, figmaVariableMaps))) {
          const verticalPadding = transformValue(String(values.verticalPadding), 'spacing', baseFontSize);
          node.paddingTop = verticalPadding;
          node.paddingBottom = verticalPadding;
        }
      }

      if ('itemSpacing' in node && typeof values.itemSpacing !== 'undefined' && typeof data.itemSpacing !== 'undefined' && isPrimitiveValue(values.itemSpacing)) {
        if (String(values.itemSpacing) === 'AUTO') {
          node.primaryAxisAlignItems = 'SPACE_BETWEEN';
        } else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
          node.primaryAxisAlignItems = 'MIN';
        }
        if (!(await tryApplyVariableId(node, 'itemSpacing', data.itemSpacing, figmaVariableReferences, figmaVariableMaps))) {
          node.itemSpacing = transformValue(String(values.itemSpacing), 'spacing', baseFontSize);
        }
      }

      if ('counterAxisSpacing' in node && typeof values.counterAxisSpacing !== 'undefined' && typeof data.counterAxisSpacing !== 'undefined' && isPrimitiveValue(values.counterAxisSpacing)) {
        if (!(await tryApplyVariableId(node, 'counterAxisSpacing', data.counterAxisSpacing, figmaVariableReferences, figmaVariableMaps))) {
          node.counterAxisSpacing = transformValue(String(values.counterAxisSpacing), 'spacing', baseFontSize);
        }
      }

      if ('paddingTop' in node && typeof values.paddingTop !== 'undefined' && typeof data.paddingTop !== 'undefined' && isPrimitiveValue(values.paddingTop)) {
        if (!(await tryApplyVariableId(node, 'paddingTop', data.paddingTop, figmaVariableReferences, figmaVariableMaps))) {
          node.paddingTop = transformValue(String(values.paddingTop), 'spacing', baseFontSize);
        }
      }
      if (
        'paddingRight' in node
        && typeof values.paddingRight !== 'undefined'
        && typeof data.paddingRight !== 'undefined'
        && isPrimitiveValue(values.paddingRight)
      ) {
        if (!(await tryApplyVariableId(node, 'paddingRight', data.paddingRight, figmaVariableReferences, figmaVariableMaps))) {
          node.paddingRight = transformValue(String(values.paddingRight), 'spacing', baseFontSize);
        }
      }

      if (
        'paddingBottom' in node
        && typeof values.paddingBottom !== 'undefined'
        && typeof data.paddingBottom !== 'undefined'
        && isPrimitiveValue(values.paddingBottom)
      ) {
        if (!(await tryApplyVariableId(node, 'paddingBottom', data.paddingBottom, figmaVariableReferences, figmaVariableMaps))) {
          node.paddingBottom = transformValue(String(values.paddingBottom), 'spacing', baseFontSize);
        }
      }

      if ('paddingLeft' in node && typeof values.paddingLeft !== 'undefined' && typeof data.paddingLeft !== 'undefined' && isPrimitiveValue(values.paddingLeft)) {
        if (!(await tryApplyVariableId(node, 'paddingLeft', data.paddingLeft, figmaVariableReferences, figmaVariableMaps))) {
          node.paddingLeft = transformValue(String(values.paddingLeft), 'spacing', baseFontSize);
        }
      }

      if (values.asset && typeof values.asset === 'string') {
        if ('fills' in node) {
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
        && typeof data.dimension !== 'undefined'
        && isPrimitiveValue(values.dimension)
      ) {
        if ('itemSpacing' in node) {
          if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
            node.primaryAxisAlignItems = 'MIN';
          }

          if (!(await tryApplyVariableId(node, 'itemSpacing', data.dimension, figmaVariableReferences, figmaVariableMaps))) {
            node.itemSpacing = transformValue(String(values.dimension), 'spacing', baseFontSize);
          }
        } else if ('resize' in node) {
          if (!(await tryApplyVariableId(node, 'width', data.dimension, figmaVariableReferences, figmaVariableMaps)
            && await tryApplyVariableId(node, 'height', data.dimension, figmaVariableReferences, figmaVariableMaps))) {
            const size = transformValue(String(values.dimension), 'sizing', baseFontSize);
            node.resize(size, size);
          }
        }
      }

      if (
        typeof values.number !== 'undefined'
        && typeof data.number !== 'undefined'
        && isPrimitiveValue(values.number)
      ) {
        if ('itemSpacing' in node) {
          if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
            node.primaryAxisAlignItems = 'MIN';
          }

          if (!(await tryApplyVariableId(node, 'itemSpacing', data.number, figmaVariableReferences, figmaVariableMaps))) {
            node.itemSpacing = transformValue(String(values.number), 'spacing', baseFontSize);
          }
        } else if ('resize' in node) {
          if (!(await tryApplyVariableId(node, 'width', data.number, figmaVariableReferences, figmaVariableMaps)
            && await tryApplyVariableId(node, 'height', data.number, figmaVariableReferences, figmaVariableMaps))) {
            const size = transformValue(String(values.number), 'sizing', baseFontSize);
            node.resize(size, size);
          }
        }
      }

      if ('visible' in node && typeof values.visibility === 'string' && typeof data.visibility !== 'undefined') {
        if (!(await tryApplyVariableId(node, 'visible', data.visibility, figmaVariableReferences, figmaVariableMaps))) {
          if (values.visibility === 'true') {
            node.visible = true;
          } else if (values.visibility === 'false') {
            node.visible = false;
          }
        }
      }

      if ('characters' in node && node.fontName !== figma.mixed && typeof values.text === 'string' && typeof data.text !== 'undefined') {
        if (!(await tryApplyVariableId(node, 'characters', data.text, figmaVariableReferences, figmaVariableMaps))) {
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
  } catch (e) {
    console.log('Error setting data on node', e);
  }
}
