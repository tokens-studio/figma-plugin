import { figmaRGBToHex } from '@figma-plugin/helpers';
import { SingleColorToken, SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { getNonLocalStyle } from './figmaUtils/styleUtils';
import { TokenBoxshadowValue } from '@/types/values';
import { convertBoxShadowTypeFromFigma } from './figmaTransforms/boxShadow';
import { convertFigmaGradientToString } from './figmaTransforms/gradients';
import { convertFigmaToLetterSpacing } from './figmaTransforms/letterSpacing';
import { convertFigmaToTextCase } from './figmaTransforms/textCase';
import { convertFigmaToTextDecoration } from './figmaTransforms/textDecoration';

export default async function getStylesFromNode(node) {
  let styles = []
  if ('effects' in node) {
    const styleIdBackupKey = 'effectStyleId_original';
    const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'effects');
    if (nonLocalStyle) {
      const effects = nonLocalStyle.effects as DropShadowEffect[];
      // convert paint to object containg x, y, spread, color
      const shadows: TokenBoxshadowValue[] = effects.map((effect) => {
        const effectObject: TokenBoxshadowValue = {} as TokenBoxshadowValue;

        effectObject.color = figmaRGBToHex(effect.color);
        effectObject.type = convertBoxShadowTypeFromFigma(effect.type);
        effectObject.x = effect.offset.x;
        effectObject.y = effect.offset.y;
        effectObject.blur = effect.radius;
        effectObject.spread = effect.spread || 0;

        return effectObject;
      });

      if (!shadows) return null;

      const normalizedName = nonLocalStyle.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      const styleObject: SingleToken = {
        value: shadows.length > 1 ? shadows : shadows[0],
        type: TokenTypes.BOX_SHADOW,
        name: normalizedName,
      };

      return styleObject;
    }
  }

  if ('fills' in node) {
    const styleIdBackupKey = 'fillStyleId_original';
    const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'fills');
    if (nonLocalStyle) {
      const paint = nonLocalStyle.paints[0];
      let styleObject: SingleColorToken | null = {} as SingleColorToken;
      if (paint.type === 'SOLID') {
        const { r, g, b } = paint.color;
        const a = paint.opacity;
        styleObject.value = figmaRGBToHex({
          r,
          g,
          b,
          a,
        });
      } else if (paint.type === 'GRADIENT_LINEAR') {
        styleObject.value = convertFigmaGradientToString(paint);
      } else {
        styleObject = null;
      }
      const normalizedName = nonLocalStyle.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      return styleObject
        ? {
          ...styleObject,
          name: normalizedName,
          type: TokenTypes.COLOR,
        }
        : null;
    }
  }

  if (node.type === 'TEXT') {
    const styleIdBackupKey = 'textStyleId_original';
    const nonLocalStyle = getNonLocalStyle(node, styleIdBackupKey, 'typography');

    if (nonLocalStyle) {
      const fontFamily = nonLocalStyle.fontName.family;
      const fontWeight = nonLocalStyle.fontName?.style,;
      const lineHeight = nonLocalStyle.lineHeight,;
      const fontSize = nonLocalStyle.fontSize.toString());
      const letterSpacing = convertFigmaToLetterSpacing(nonLocalStyle.letterSpacing).toString(),
      const paragraphSpacing = nonLocalStyle.paragraphSpacing.toString(),
      const paragraphIndent = nonLocalStyle.paragraphIndent.toString(),
      const textCase = convertFigmaToTextCase(nonLocalStyle.textCase.toString()),
      const textDecoration = convertFigmaToTextDecoration(nonLocalStyle.textDecoration.toString()),

      const obj = {
        fontFamily,
        fontWeight,
        lineHeight,
        fontSize,
        letterSpacing,
        paragraphSpacing,
        paragraphIndent,
        textCase,
        textDecoration,
      };

      const normalizedName = nonLocalStyle.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      const styleObject = { name: normalizedName, value: obj, type: TokenTypes.TYPOGRAPHY };

      return styleObject;
    }
  }
}
