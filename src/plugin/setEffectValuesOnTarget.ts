/* eslint-disable no-param-reassign */
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertTypographyNumberToFigma } from './figmaTransforms/generic';
import convertOffsetToFigma from './figmaTransforms/offset';

export default function setEffectValuesOnTarget(
  // @TODO update this typing
  target,
  token: SingleToken,
  key = 'effects',
) {
  if (token.type === TokenTypes.BOX_SHADOW) {
    try {
      const { description, value } = token;

      if (Array.isArray(value)) {
        target[key] = value.map((v) => {
          const { color, opacity: a } = convertToFigmaColor(v.color);
          const { r, g, b } = color;
          return {
            color: {
              r,
              g,
              b,
              a,
            },
            type: convertBoxShadowTypeToFigma(v.type),
            spread: convertTypographyNumberToFigma(v.spread.toString()),
            radius: convertTypographyNumberToFigma(v.blur.toString()),
            offset: convertOffsetToFigma(convertTypographyNumberToFigma(v.x.toString()), convertTypographyNumberToFigma(v.y.toString())),
            blendMode: v.blendMode || 'NORMAL',
            visible: true,
          };
        });
      } else {
        const { color, opacity: a } = convertToFigmaColor(value.color);
        const { r, g, b } = color;
        target[key] = [
          {
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
            blendMode: value.blendMode || 'NORMAL',
            visible: true,
          },
        ];
      }

      if (description) {
        target.description = description;
      }
    } catch (e) {
      console.error('Error setting color', e);
    }
  }
}
