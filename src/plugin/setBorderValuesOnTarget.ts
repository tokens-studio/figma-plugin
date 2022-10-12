/* eslint-disable no-param-reassign */
import { SingleBorderToken } from '@/types/tokens';
import { isPrimitiveValue } from '@/utils/is';
import { transformValue } from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';

export default async function setBorderValuesOnTarget(
  target: BaseNode,
  token: Pick<SingleBorderToken, 'value'>,
) {
  const { value } = token;
  const { color, width, style } = value;
  try {
    if ('strokeWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width)) {
      target.strokeWeight = transformValue(String(width), 'borderWidth');
    }
    if (typeof color !== 'undefined' && typeof color === 'string') {
      setColorValuesOnTarget(target, { value: color }, 'strokes');
    }
    if (typeof style !== 'undefined' && typeof style === 'string' && 'strokes' in target) {
      const existingStroke = target.strokes[0];
      const newStroke = JSON.parse(JSON.stringify(existingStroke));
      newStroke.type = style;
      target.strokes = [newStroke];
    }
  } catch (e) {
    console.log('error setting border token', e);
  }
}
