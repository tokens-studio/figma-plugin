/* eslint-disable no-param-reassign */
import { SingleBorderToken } from '@/types/tokens';
import { isPrimitiveValue } from '@/utils/is';
import { transformValue } from './helpers';

export default function setBorderValuesOnTarget(target: BaseNode, token: Pick<SingleBorderToken, 'value'>, side?: 'top' | 'right' | 'bottom' | 'left') {
  // we don't apply borderColor here. we extract borderColor and apply as a normal borderColor token
  const { value } = token;
  const { width, style } = value;
  try {
    if ('strokeWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && !side) {
      target.strokeWeight = transformValue(String(width), 'borderWidth');
    }
    if ('strokeTopWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'top') {
      target.strokeTopWeight = transformValue(String(width), 'borderWidth');
    }
    if ('strokeRightWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'right') {
      target.strokeRightWeight = transformValue(String(width), 'borderWidth');
    }
    if ('strokeBottomWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'bottom') {
      target.strokeBottomWeight = transformValue(String(width), 'borderWidth');
    }
    if ('strokeLeftWeight' in target && typeof width !== 'undefined' && isPrimitiveValue(width) && side === 'left') {
      target.strokeLeftWeight = transformValue(String(width), 'borderWidth');
    }

    if (typeof style !== 'undefined' && typeof style === 'string' && 'dashPattern' in target) {
      let newDashPattern = [0, 0];
      switch (style) {
        case 'solid':
          newDashPattern = [0, 0];
          break;
        case 'dashed':
          newDashPattern = [10, 10];
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
