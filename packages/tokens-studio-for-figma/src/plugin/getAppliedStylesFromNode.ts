import { figmaRGBToHex } from '@figma-plugin/helpers';
import { SingleColorToken, SingleToken } from '@/types/tokens';
import { getLocalStyle } from './figmaUtils/styleUtils';
import { TokenBoxshadowValue } from '@/types/values';
import { convertBoxShadowTypeFromFigma } from './figmaTransforms/boxShadow';
import { convertFigmaGradientToString } from './figmaTransforms/gradients';
import { convertFigmaToLetterSpacing } from './figmaTransforms/letterSpacing';
import { convertFigmaToTextCase } from './figmaTransforms/textCase';
import { convertFigmaToTextDecoration } from './figmaTransforms/textDecoration';
import { Properties } from '@/constants/Properties';
import { convertFigmaToLineHeight } from './figmaTransforms/lineHeight';

export type SelectionStyle = {
  name: string;
  value: SingleToken['value'];
  type: Properties
};

function getStyleFromNode(node: BaseNode, styleIdBackupKey: string, styleType: 'fills' | 'strokes'): SelectionStyle[] {
  const localStyles: SelectionStyle[] = [];

  const localStyle = getLocalStyle(node, styleIdBackupKey, styleType);
  if (localStyle) {
    const paint = localStyle.paints[0];
    let styleObject: SingleColorToken | null = {} as SingleColorToken;
    if (paint.type === 'SOLID') {
      const { r, g, b } = paint.color;
      const a = paint.opacity;
      styleObject.value = figmaRGBToHex({
        r, g, b, a,
      });
    } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
      styleObject.value = convertFigmaGradientToString(paint);
    } else {
      styleObject = null;
    }
    const normalizedName = localStyle.name.split('/').map((section) => section.trim()).join('.');
    if (styleObject) {
      const styleTypeConstant = styleType === 'fills' ? Properties.fill : Properties.borderColor;
      localStyles.push({ ...styleObject, name: normalizedName, type: styleTypeConstant });
    }
  }

  return localStyles;
}

export default function getAppliedStylesFromNode(node: BaseNode): SelectionStyle[] {
  const localStyles: SelectionStyle[] = [];
  if ('effects' in node) {
    const styleIdBackupKey = 'effectStyleId_original';
    const localStyle = getLocalStyle(node, styleIdBackupKey, 'effects');
    if (localStyle && localStyle.effects.every((effect) => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')) {
      const effects = localStyle.effects as Effect[];
      // convert paint to object containg x, y, spread, color
      const shadows: TokenBoxshadowValue[] = effects.map((effect) => {
        const rootEffect = effect as DropShadowEffect | InnerShadowEffect;
        const effectObject: TokenBoxshadowValue = {} as TokenBoxshadowValue;

        effectObject.color = figmaRGBToHex(rootEffect.color);
        effectObject.type = convertBoxShadowTypeFromFigma(rootEffect.type);
        effectObject.x = rootEffect.offset.x;
        effectObject.y = rootEffect.offset.y;
        effectObject.blur = rootEffect.radius;
        effectObject.spread = rootEffect.spread || 0;

        return effectObject;
      });

      if (shadows.length > 0) {
        const normalizedName = localStyle.name
          .split('/')
          .map((section) => section.trim())
          .join('.');

        const styleObject: SelectionStyle = {
          value: shadows.length > 1 ? shadows : shadows[0],
          type: Properties.boxShadow,
          name: normalizedName,
        };

        localStyles.push(styleObject);
      }
    }
  }

  if ('fills' in node) {
    const styleIdBackupKey = 'fillStyleId_original';
    localStyles.push(...getStyleFromNode(node, styleIdBackupKey, 'fills'));
  }

  if ('strokes' in node) {
    const styleIdBackupKey = 'strokeStyleId_original';
    localStyles.push(...getStyleFromNode(node, styleIdBackupKey, 'strokes'));
  }

  if (node.type === 'TEXT') {
    const styleIdBackupKey = 'textStyleId_original';
    const localStyle = getLocalStyle(node, styleIdBackupKey, 'typography');

    if (localStyle) {
      const fontFamily = localStyle.fontName.family;
      const fontWeight = localStyle.fontName?.style;
      const lineHeight = convertFigmaToLineHeight(localStyle.lineHeight).toString();
      const fontSize = localStyle.fontSize.toString();
      const letterSpacing = convertFigmaToLetterSpacing(localStyle.letterSpacing).toString();
      const paragraphSpacing = localStyle.paragraphSpacing.toString();
      const paragraphIndent = localStyle.paragraphIndent.toString();
      const textCase = convertFigmaToTextCase(localStyle.textCase.toString());
      const textDecoration = convertFigmaToTextDecoration(localStyle.textDecoration.toString());

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

      const normalizedName = localStyle.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      const styleObject = { name: normalizedName, value: obj, type: Properties.typography };
      localStyles.push(styleObject);
    }
  }

  return localStyles;
}
