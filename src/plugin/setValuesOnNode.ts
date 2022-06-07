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
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertTypographyNumberToFigma } from './figmaTransforms/generic';
import convertOffsetToFigma from './figmaTransforms/offset';

function figmaColorToHex(color: RGBA | RGB, opacity?: number): string {
  if ('a' in color) {
    return figmaRGBToHex(color);
  }
  const { r, g, b } = color;
  return figmaRGBToHex({
    r, g, b, a: opacity,
  });
}

function figmaPaintToHex(paint: SolidPaint): string {
  return figmaColorToHex(paint.color, paint.opacity);
}

function isColorEqual(color1: RGBA, color2: RGBA) {
  // Comparison using rgb doesn't work as Figma has a rounding issue,
  // that doesn't produce same RGB floats as the existing color :(
  // color1.r === color2.r
  // && color1.g === color2.g
  // && color1.b === color2.b
  // Compare using hex instead for now:
  const color1Hex = figmaColorToHex(color1);
  const color2Hex = figmaColorToHex(color2);
  return color1Hex === color2Hex;
}

function isPaintEqual(paint1: SolidPaint, paint2: SolidPaint) {
  if (paint1 && paint2) {
    if (paint1.type === paint2.type) {
      if (paint1.type === 'SOLID' && paint2.type === 'SOLID') {
        const paint1Hex = figmaPaintToHex(paint1);
        const paint2Hex = figmaPaintToHex(paint2);
        return (
          paint1.opacity === paint2.opacity
          // Comparison using rgb doesn't work as Figma has a rounding issue,
          // that doesn't produce same RGB floats as the existing color :(
          // && paint1.color.r === paint2.color.r
          // && paint1.color.g === paint2.color.g
          // && paint1.color.b === paint2.color.b
          // Compare using hex instead for now:
          && paint1Hex === paint2Hex
        );
      }
      // TODO: Compare gradients using hex...
      // if (paint1.type === 'GRADIENT_LINEAR' && paint2.type === 'GRADIENT_LINEAR') {
      //   ...
      // }
    }
  }
  return false;
}

function isEffectEqual(effect1?: Effect, effect2?: Effect) {
  if (effect1 && effect2) {
    if (effect1.type === effect2.type) {
      if (
        (effect1.type === 'DROP_SHADOW' && effect2.type === 'DROP_SHADOW')
        || (effect1.type === 'INNER_SHADOW' && effect2.type === 'INNER_SHADOW')
      ) {
        return (
          isColorEqual(effect1.color, effect2.color)
          && effect1.offset.x === effect2.offset.x
          && effect1.offset.y === effect2.offset.y
          && effect1.radius === effect2.radius
          && effect1.spread === effect2.spread
          && effect1.blendMode === effect2.blendMode
          // Token doesn't store this effect subvalue (yet) so omit from comparison:
          // && paint1.showShadowBehindNode === paint2.showShadowBehindNode
        );
      }
      if (
        (effect1.type === 'BACKGROUND_BLUR' && effect2.type === 'BACKGROUND_BLUR')
        || (effect1.type === 'LAYER_BLUR' && effect2.type === 'LAYER_BLUR')
      ) {
        return effect1.radius === effect2.radius;
      }
    }
  }
  return false;
}

function convertBoxShadowToFigmaEffect(value: TokenBoxshadowValue): Effect {
  const { color, opacity: a } = convertToFigmaColor(value.color);
  const { r, g, b } = color;
  return {
    color: {
      r,
      g,
      b,
      a,
    },
    type: convertBoxShadowTypeToFigma(value.type),
    spread: convertTypographyNumberToFigma(value.spread.toString()),
    radius: convertTypographyNumberToFigma(value.blur.toString()),
    offset: convertOffsetToFigma(convertTypographyNumberToFigma(value.x.toString()), convertTypographyNumberToFigma(value.y.toString())),
    blendMode: (value.blendMode || 'NORMAL') as BlendMode,
    visible: true,
  };
}

function findMatchingNonLocalPaintStyle(styleId: string, colorToken: string) {
  let matchingStyle: PaintStyle | undefined;

  if (styleId) {
    // console.log('setValuesOnNode -> looking for non-local style:', fillStyleId);
    const nonLocalStyle = figma.getStyleById(styleId);
    if (nonLocalStyle?.type === 'PAINT') {
      // console.log('setValuesOnNode -> node has nonLocalStyle:', nonLocalStyle.name);

      const stylePaint = (nonLocalStyle as PaintStyle).paints[0] ?? null;
      if (stylePaint?.type === 'SOLID') {
        const { color, opacity } = convertToFigmaColor(colorToken);
        const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
        if (isPaintEqual(stylePaint, tokenPaint)) {
          // console.log('setValuesOnNode -> hasMatchingNonLocalStyle=true so re-set it to linked style:', nonLocalStyle.name);
          matchingStyle = nonLocalStyle as PaintStyle;
        }
      }
    }
  }

  return matchingStyle;
}

function findMatchingNonLocalEffectStyle(styleId: string, boxShadowToken: string | TokenBoxshadowValue | TokenBoxshadowValue[]) {
  let matchingStyle: EffectStyle | undefined;

  if (styleId) {
    const nonLocalStyle = figma.getStyleById(styleId);
    if (typeof boxShadowToken !== 'string' && nonLocalStyle?.type === 'EFFECT') {
      const boxShadowTokenArr = Array.isArray(boxShadowToken) ? boxShadowToken : [boxShadowToken];
      const styleEffects = (nonLocalStyle as EffectStyle).effects;
      if (styleEffects.length === boxShadowTokenArr.length) {
        if (styleEffects.every((styleEffect, idx) => {
          const tokenEffect = convertBoxShadowToFigmaEffect(boxShadowTokenArr[idx]);
          return isEffectEqual(styleEffect, tokenEffect);
        })) {
          // console.log('findMatchingNonLocalEffectStyle -> hasMatchingNonLocalStyle=true);
          matchingStyle = nonLocalStyle as EffectStyle;
        }
      }
    }
  }

  return matchingStyle;
}

function findMatchingNonLocalTextStyle(styleId: string, typographyToken: string | TokenTypograpyValue, description?: string) {
  let matchingStyle: TextStyle | undefined;

  if (styleId) {
    const nonLocalStyle = figma.getStyleById(styleId);
    if (typeof typographyToken !== 'string' && nonLocalStyle?.type === 'TEXT') {
      const textStyle = (nonLocalStyle as TextStyle);
      matchingStyle = textStyle; // Assume match until it checks out otherwise below
      // console.log('findMatchingNonLocalTextStyle -> textStyle:', textStyle);

      const {
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        paragraphSpacing,
        textCase,
        textDecoration,
      } = typographyToken;

      if (textStyle.fontName.family !== fontFamily) {
        console.log('findMatchingNonLocalTextStyle -> fontFamily not matching! style: ', textStyle.fontName.family, ', token: ', fontFamily);
        matchingStyle = undefined;
      }
      if (textStyle.fontName.style !== fontWeight) {
        console.log('findMatchingNonLocalTextStyle -> fontWeight not matching! style: ', textStyle.fontName.style, ', token: ', fontWeight);
        matchingStyle = undefined;
      }
      if (fontSize === undefined || textStyle.fontSize !== transformValue(fontSize, 'fontSizes')) {
        console.log('findMatchingNonLocalTextStyle -> fontSize not matching! style: ', textStyle.fontSize, ', token: ', transformValue(String(fontSize), 'fontSizes'));
        matchingStyle = undefined;
      }
      const tokenLineHeight = transformValue(String(lineHeight), 'lineHeights'); // This will default to `{ unit: 'AUTO' }` if lineHeight token is not set
      if (tokenLineHeight?.unit !== textStyle.lineHeight.unit) {
        console.log('findMatchingNonLocalTextStyle -> lineHeight not matching! style: ', textStyle.lineHeight, ', token: ', tokenLineHeight);
        matchingStyle = undefined;
      } else if (tokenLineHeight.unit !== 'AUTO' && textStyle.lineHeight.unit !== 'AUTO') {
        if (tokenLineHeight.unit !== textStyle.lineHeight.unit || tokenLineHeight.value !== textStyle.lineHeight.value) {
          console.log('findMatchingNonLocalTextStyle -> lineHeight not matching! style: ', textStyle.lineHeight, ', token: ', tokenLineHeight);
          matchingStyle = undefined;
        }
      }
      const tokenLetterSpacing = transformValue(String(letterSpacing), 'letterSpacing'); // This will default to `null` if letterSpacing token is not set
      if (tokenLetterSpacing?.unit !== textStyle.letterSpacing.unit || tokenLetterSpacing?.value !== textStyle.letterSpacing.value) {
        console.log('findMatchingNonLocalTextStyle -> letterSpacing not matching! style: ', textStyle.letterSpacing, ', token: ', tokenLetterSpacing);
        matchingStyle = undefined;
      }
      if (paragraphSpacing === undefined || textStyle.paragraphSpacing !== transformValue(paragraphSpacing, 'paragraphSpacing')) {
        console.log('findMatchingNonLocalTextStyle -> paragraphSpacing not matching! style: ', textStyle.paragraphSpacing, ', token: ', transformValue(String(paragraphSpacing), 'paragraphSpacing'));
        matchingStyle = undefined;
      }
      const tokenTextCase = transformValue(String(textCase), 'textCase'); // This will default to `ORIGINAL` if textCase token is not set
      if (tokenTextCase !== textStyle.textCase) {
        console.log('findMatchingNonLocalTextStyle -> textCase not matching! style: ', textStyle.textCase, ', token: ', tokenTextCase);
        matchingStyle = undefined;
      }
      const tokenTextDecoration = transformValue(String(textDecoration), 'textDecoration'); // This will default to `NONE` if textDecoration token is not set
      if (tokenTextDecoration !== textStyle.textDecoration) {
        console.log('findMatchingNonLocalTextStyle -> textDecoration not matching! style: ', textStyle.textDecoration, ', token: ', transformValue(String(textDecoration), 'textDecoration'));
        matchingStyle = undefined;
      }
      // TODO: Should description also match? 🤷
      if (textStyle.description !== '' && textStyle.description !== description) {
        console.log('findMatchingNonLocalTextStyle -> description not matching! style: ', textStyle.description, ', token: ', description);
        // matchingStyle = undefined;
      }
    }
  }

  return matchingStyle;
}

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
        let matchingStyle = figmaStyleMaps.effectStyles.get(pathname);
        // Pretend we didn't find the style...
        // if (!matchingStyle) {
        if (matchingStyle?.name === 'shadows/default') {
          const effectStyleIdBackupKey = 'effectStyleId_original';
          let effectStyleId = tokensSharedDataHandler.get(node, effectStyleIdBackupKey, (val) => (val ? JSON.parse(val) as string : val));
          if (effectStyleId === '' && typeof node.effectStyleId === 'string') {
            effectStyleId = node.effectStyleId;
          }
          matchingStyle = findMatchingNonLocalEffectStyle(effectStyleId, values.boxShadow);
          let effectStyleIdBackup = ''; // Setting to empty string will delete the plugin data key if the style matches or doesn't exist
          if (effectStyleId && !matchingStyle) {
            effectStyleIdBackup = JSON.stringify(effectStyleId);
          }
          // console.log(`setValuesOnNode -> hasMatchingNonLocalStyle: ${!!matchingStyle}, effectStyleIdBackup: ${effectStyleIdBackup}, linked style: ${matchingStyle?.name}`);
          tokensSharedDataHandler.set(node, effectStyleIdBackupKey, effectStyleIdBackup);
        }
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
            let fillStyleId = tokensSharedDataHandler.get(node, fillStyleIdBackupKey, (val) => (val ? JSON.parse(val) as string : val));
            if (fillStyleId === '' && typeof node.fillStyleId === 'string') {
              fillStyleId = node.fillStyleId;
            }
            matchingStyle = findMatchingNonLocalPaintStyle(fillStyleId, values.fill);
            let fillStyleIdBackup = ''; // Setting to empty string will delete the plugin data key if the style matches or doesn't exist
            if (fillStyleId && !matchingStyle) {
              fillStyleIdBackup = JSON.stringify(fillStyleId);
            }
            console.log(`setValuesOnNode -> hasMatchingNonLocalStyle: ${!!matchingStyle}, fillStyleIdBackup: ${fillStyleIdBackup}, linked style: ${matchingStyle?.name}`);
            tokensSharedDataHandler.set(node, fillStyleIdBackupKey, fillStyleIdBackup);
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
          let matchingStyle = figmaStyleMaps.textStyles.get(pathname);
          // Pretend we didn't find the style...
          // if (!matchingStyle) {
          if (matchingStyle?.name === 'text/min/heading/01') {
            const textStyleIdBackupKey = 'textStyleId_original';
            let textStyleId = tokensSharedDataHandler.get(node, textStyleIdBackupKey, (val) => (val ? JSON.parse(val) as string : val));
            if (textStyleId === '' && typeof node.textStyleId === 'string') {
              textStyleId = node.textStyleId;
            }
            matchingStyle = findMatchingNonLocalTextStyle(textStyleId, values.typography, values.description);
            let textStyleIdBackup = ''; // Setting to empty string will delete the plugin data key if the style matches or doesn't exist
            if (textStyleId && !matchingStyle) {
              textStyleIdBackup = JSON.stringify(textStyleId);
            }
            console.log(`setValuesOnNode -> hasMatchingNonLocalStyle: ${!!matchingStyle}, textStyleIdBackup: ${textStyleIdBackup}, linked style: ${matchingStyle?.name}`);
            tokensSharedDataHandler.set(node, textStyleIdBackupKey, textStyleIdBackup);
          }
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
          let matchingStyle = figmaStyleMaps.paintStyles.get(pathname);

          if (!matchingStyle) {
            const strokeStyleIdBackupKey = 'strokeStyleId_original';
            let strokeStyleId = tokensSharedDataHandler.get(node, strokeStyleIdBackupKey, (val) => (val ? JSON.parse(val) as string : val));
            if (strokeStyleId === '' && typeof node.strokeStyleId === 'string') {
              strokeStyleId = node.strokeStyleId;
            }
            matchingStyle = findMatchingNonLocalPaintStyle(strokeStyleId, values.border);
            let strokeStyleIdBackup = ''; // Setting to empty string will delete the plugin data key if the style matches or doesn't exist
            if (strokeStyleId && !matchingStyle) {
              strokeStyleIdBackup = JSON.stringify(strokeStyleId);
            }
            console.log(`setValuesOnNode -> hasMatchingNonLocalStyle: ${!!matchingStyle}, strokeStyleIdBackup: ${strokeStyleIdBackup}, linked style: ${matchingStyle?.name}`);
            tokensSharedDataHandler.set(node, strokeStyleIdBackupKey, strokeStyleIdBackup);
          }

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
