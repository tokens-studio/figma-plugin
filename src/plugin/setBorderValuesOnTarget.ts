/* eslint-disable no-param-reassign */
import { SingleBorderToken } from '@/types/tokens';
import { isPrimitiveValue } from '@/utils/is';
import { transformValue } from './helpers';
import getFigmaDashPattern from './getFigmaDashPattern';

export default function setBorderValuesOnTarget(target: BaseNode, token: Pick<SingleBorderToken, 'value'>, baseFontSize: string, side?: 'top' | 'right' | 'bottom' | 'left') {
  const { value } = token;
  const { width, style } = value;
  try {
    if ('strokeWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && !side) {
      target.strokeWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if ('strokeTopWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'top') {
      target.strokeTopWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if ('strokeRightWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'right') {
      target.strokeRightWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if ('strokeBottomWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'bottom') {
      target.strokeBottomWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }
    if ('strokeLeftWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'left') {
      target.strokeLeftWeight = transformValue(String(width), 'borderWidth', baseFontSize);
    }

    if (typeof style !== 'undefined' && typeof style === 'string' && 'dashPattern' in target) {
      let newDashPattern = [0, 0];
      switch (style) {
        case 'solid':
          newDashPattern = [0, 0];
          break;
        case 'dashed':
          newDashPattern = getFigmaDashPattern(transformValue(String(width), 'borderWidth', baseFontSize));
          break;
        default:
          break;
      }
      target.dashPattern = newDashPattern;
    }
  } catch (e) {
    console.log('error setting border token', e);
  }
}
